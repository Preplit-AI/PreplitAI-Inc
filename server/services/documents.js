'use strict';
const fsp = require('fs/promises');
const path = require('path');

/**
 * A course document in, its text out: lecture slides or a reading as a PDF, or
 * a plain text file. The file itself is never kept; only its text goes on to
 * become notes, exactly as a transcript does.
 *
 * A PDF made of scanned pages holds pictures, not text, and comes back nearly
 * empty; the caller tells the student so rather than making notes from nothing.
 */

const DOCUMENT_EXTENSIONS = new Set(['.pdf', '.txt', '.md']);
const MAX_PAGES = 400;

async function textFromPdf(buffer) {
  // unpdf is an ES module (a serverless-friendly build of PDF.js), hence the dynamic import.
  const { getDocumentProxy, extractText } = await import('unpdf');
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  if (pdf.numPages > MAX_PAGES) {
    const err = new Error(`PDF has ${pdf.numPages} pages`);
    err.code = 'DOCUMENT_TOO_LONG';
    throw err;
  }
  const { text } = await extractText(pdf, { mergePages: false });
  // Page marks let the notes, and Juno's citations after them, say where something was.
  return (Array.isArray(text) ? text : [text])
    .map((page, i) => (page && page.trim() ? `[p.${i + 1}]\n${page.trim()}` : ''))
    .filter(Boolean)
    .join('\n\n');
}

/**
 * @returns {Promise<{ text: string, material: 'pdf' | 'text' }>}
 * @throws when the file cannot be read as the kind its name says it is.
 */
async function textFromDocument(filePath, originalName) {
  const ext = path.extname(originalName || '').toLowerCase();
  const buffer = await fsp.readFile(filePath);
  if (ext === '.pdf') return { text: await textFromPdf(buffer), material: 'pdf' };
  // Null bytes mean this is not text, whatever it was called.
  if (buffer.includes(0)) throw new Error('Not a text file');
  return { text: buffer.toString('utf8').replace(/\r\n/g, '\n').trim(), material: 'text' };
}

module.exports = { textFromDocument, DOCUMENT_EXTENSIONS };
