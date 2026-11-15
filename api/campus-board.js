'use strict';
// Reads one university notice board and answers with its notices, from Seoul
// (vercel.json pins this function to icn1). Korean university sites often
// refuse visitors from abroad, so the API, which runs in Washington, asks this
// function instead of the site. It reads only the boards listed in
// server/services/campusBoards.js, so it cannot be used to fetch anything else.
const { readBoard, boardById } = require('../server/services/campusBoards');

// Each board is read at most once every five minutes per instance, so this cannot be used to flood the site.
const recent = new Map();
const FRESH_MS = 5 * 60 * 1000;

module.exports = async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const board = boardById(url.searchParams.get('board') || '');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (!board) {
    res.statusCode = 404;
    return res.end(JSON.stringify({ error: 'No such board' }));
  }
  const kept = recent.get(board.id);
  if (kept && Date.now() - kept.at < FRESH_MS) return res.end(JSON.stringify({ items: kept.items }));
  try {
    const items = await readBoard(board);
    recent.set(board.id, { at: Date.now(), items });
    res.end(JSON.stringify({ items }));
  } catch (err) {
    console.warn('[campus-board]', err.message);
    res.statusCode = 502;
    res.end(JSON.stringify({ error: err.message }));
  }
};
