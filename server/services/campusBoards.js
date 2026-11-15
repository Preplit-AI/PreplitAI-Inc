'use strict';

/**
 * The universities whose public notice boards the campus board reads, and how
 * one page of a board is read. Nothing here touches the database, so the
 * campus reader (server/scripts/campusReader.js) runs it with no install.
 */

const CAMPUSES = {
  ajou: {
    name: 'Ajou University',
    city: 'Suwon',
    match: /ajou|아주대/i,
    links: [
      { label: 'Ajou Portal', url: 'https://mportal.ajou.ac.kr/' },
      { label: 'Blackboard (LMS)', url: 'https://eclass2.ajou.ac.kr/' },
      { label: 'Office of International Affairs', url: 'https://www.ajou.ac.kr/oia/index.do' },
      { label: 'Library', url: 'https://library.ajou.ac.kr/' },
      { label: 'Cafeteria menus', url: 'https://www.ajou.ac.kr/kr/life/food.do' },
      { label: 'Career centre', url: 'https://job.ajou.ac.kr/' },
    ],
    boards: [
      { id: 'ajou-oia', label: 'Office of International Affairs', url: 'https://www.ajou.ac.kr/oia/notice/notice.do', intl: true, kind: 'general' },
      { id: 'ajou-en', label: 'University notices (English)', url: 'https://www.ajou.ac.kr/en/ajou/notice.do', intl: true, kind: 'general' },
      { id: 'ajou-scholarship', label: 'Scholarship office', url: 'https://www.ajou.ac.kr/kr/ajou/notice_scholarship.do', intl: false, kind: 'scholarship' },
      { id: 'ajou-notice', label: 'University notices', url: 'https://www.ajou.ac.kr/kr/ajou/notice.do', intl: false, kind: 'general' },
    ],
  },
};

const USER_AGENT = 'Mozilla/5.0 (compatible; PreplitAI-campus-board/0.1; +https://www.preplitai.com)';

const decode = (text) => text
  .replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&nbsp;/g, ' ')
  .replace(/\s+/g, ' ').trim();

/**
 * The notices on one page of a board. The university's boards all share one
 * layout: a title box holding the link, then the category, writer and date.
 */
function parseBoard(html, board) {
  const items = [];
  const seen = new Set();
  const blocks = html.split('<div class="b-title-box">').slice(1);
  for (const block of blocks) {
    const article = /articleNo=(\d+)/.exec(block);
    if (!article || seen.has(article[1])) continue;
    const anchor = /<a\b[^>]*>([\s\S]*?)<\/a>/.exec(block);
    if (!anchor) continue;
    const pinned = /class="b-notice"/.test(anchor[1]);
    const title = decode(anchor[1].replace(/<span class="b-notice">[\s\S]*?<\/span>/g, '')).slice(0, 300);
    if (!title) continue;
    const date = /class="b-date">\s*(\d{4})[-.](\d{2})[-.](\d{2})/.exec(block) || /class="b-date">\s*(\d{2})[-.](\d{2})[-.](\d{2})/.exec(block);
    const category = /class="b-cate">\s*([^<]*)</.exec(block);
    seen.add(article[1]);
    items.push({
      source: board.id,
      article: article[1],
      title,
      category: category ? decode(category[1]).slice(0, 60) || null : null,
      url: `${board.url}?mode=view&articleNo=${article[1]}`,
      postedOn: date ? `${date[1].length === 2 ? '20' + date[1] : date[1]}-${date[2]}-${date[3]}` : null,
      pinned,
    });
  }
  return items;
}

/** One board, read directly. Throws with the network's own reason when the site cannot be reached. */
async function readBoard(board) {
  let res;
  try {
    res = await fetch(board.url, { headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'en,ko;q=0.8' }, signal: AbortSignal.timeout(20000) });
  } catch (err) {
    const cause = err.cause ? ` (${err.cause.code || err.cause.name || ''} ${err.cause.message || ''})`.replace(/\s+\)/, ')') : '';
    throw new Error(board.id + ' could not be reached: ' + err.message + cause);
  }
  if (!res.ok) throw new Error(board.id + ' answered ' + res.status);
  return parseBoard(await res.text(), board);
}

/** A board by its id, from any campus. */
function boardById(id) {
  for (const campus of Object.values(CAMPUSES)) {
    const board = campus.boards.find((b) => b.id === id);
    if (board) return board;
  }
  return null;
}

module.exports = { CAMPUSES, parseBoard, readBoard, boardById };
