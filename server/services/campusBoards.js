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
      // This board's list shows a deadline or "pinned until" date (2030-06-30 on a guide), never the
      // posting date, so the posting date is read from the notice's own page instead.
      { id: 'ajou-oia', label: 'Office of International Affairs', url: 'https://www.ajou.ac.kr/oia/notice/notice.do', intl: true, kind: 'general', listDate: 'until' },
      { id: 'ajou-en', label: 'University notices (English)', url: 'https://www.ajou.ac.kr/en/ajou/notice.do', intl: true, kind: 'general' },
      { id: 'ajou-scholarship', label: 'Scholarship office', url: 'https://www.ajou.ac.kr/kr/ajou/notice_scholarship.do', intl: false, kind: 'scholarship' },
      { id: 'ajou-notice', label: 'University notices', url: 'https://www.ajou.ac.kr/kr/ajou/notice.do', intl: false, kind: 'general' },
    ],
  },
};

const USER_AGENT = 'Mozilla/5.0 (compatible; PreplitAI-campus-board/0.1; +https://www.preplitai.com)';

/** Notices read per board: one page of the list, with the board's own pinned notices on top. */
const PAGE_SIZE = 30;
/** For a board whose list shows no posting date, how many of its newest notices have their own page read for it. */
const DATED_FROM_PAGE = 10;

const decode = (text) => text
  .replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&nbsp;/g, ' ')
  .replace(/\s+/g, ' ').trim();

/**
 * The notices on one page of a board. The university's boards all share one
 * layout: a title box holding the link, then the category, writer and date.
 * `postedOn` is only ever the date the notice was posted: on a board whose
 * list shows another date (`listDate: 'until'`) it stays null here.
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
      postedOn: date && board.listDate !== 'until' ? `${date[1].length === 2 ? '20' + date[1] : date[1]}-${date[2]}-${date[3]}` : null,
      pinned,
    });
  }
  return items;
}

const get = (url) => fetch(url, { headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'en,ko;q=0.8' }, signal: AbortSignal.timeout(20000) });

/** The posting date on a notice's own page: its published time, or the 작성일 (written on) line. */
function postedOnPage(html) {
  const meta = /article:published_time"\s+content="(\d{4})-(\d{2})-(\d{2})/.exec(html);
  const written = meta || /작성일[\s\S]{0,160}?(\d{4})[-.](\d{2})[-.](\d{2})/.exec(html);
  return written ? `${written[1]}-${written[2]}-${written[3]}` : null;
}

/** One board, read directly. Throws with the network's own reason when the site cannot be reached. */
async function readBoard(board) {
  let res;
  try {
    res = await get(`${board.url}?mode=list&articleLimit=${PAGE_SIZE}`);
  } catch (err) {
    const cause = err.cause ? ` (${err.cause.code || err.cause.name || ''} ${err.cause.message || ''})`.replace(/\s+\)/, ')') : '';
    throw new Error(board.id + ' could not be reached: ' + err.message + cause);
  }
  if (!res.ok) throw new Error(board.id + ' answered ' + res.status);
  const items = parseBoard(await res.text(), board);
  if (board.listDate === 'until') {
    // One page at a time, newest first; a page that fails leaves that notice without a date.
    const newest = [...items].sort((a, b) => Number(b.article) - Number(a.article)).slice(0, DATED_FROM_PAGE);
    for (const item of newest) {
      try {
        const page = await get(item.url);
        if (page.ok) item.postedOn = postedOnPage(await page.text());
      } catch { /* left undated */ }
    }
  }
  return items;
}

/** A board by its id, from any campus. */
function boardById(id) {
  for (const campus of Object.values(CAMPUSES)) {
    const board = campus.boards.find((b) => b.id === id);
    if (board) return board;
  }
  return null;
}

module.exports = { CAMPUSES, parseBoard, postedOnPage, readBoard, boardById };
