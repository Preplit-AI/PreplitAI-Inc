'use strict';
const db = require('../db/database');

/**
 * PreplitAI Shared RAG & Retrieval Service (PART 7.3)
 * Handles text chunking, storing document chunks, and retrieving relevant chunks per Space.
 */

// Simple cosine similarity helper for keyword / term-frequency vectors
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (const key in vecA) {
    if (vecB[key]) {
      dotProduct += vecA[key] * vecB[key];
    }
    normA += vecA[key] * vecA[key];
  }
  for (const key in vecB) {
    normB += vecB[key] * vecB[key];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Extract word frequency vector for lightweight retrieval
function textToVector(text) {
  const words = text.toLowerCase().replace(/[^\w\s\u3131-\uD79D]/g, '').split(/\s+/).filter(w => w.length > 1);
  const freq = {};
  for (const word of words) {
    freq[word] = (freq[word] || 0) + 1;
  }
  return freq;
}

/**
 * Split raw document text into paragraph-sized chunks (~300-500 chars / paragraph breaks)
 */
function splitTextIntoChunks(text, targetChunkSize = 400) {
  if (!text) return [];
  
  // Split by double line breaks or major section breaks first
  const paragraphs = text.split(/\n\s*\n/);
  const chunks = [];
  let currentChunk = '';
  let currentPage = 1;

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;

    // Check for page markers e.g. [Page X] or --- Page X ---
    const pageMatch = trimmed.match(/(?:Page|\[Page|\-\-\-\s*Page)\s*(\d+)/i);
    if (pageMatch) {
      currentPage = parseInt(pageMatch[1], 10);
    }

    if ((currentChunk.length + trimmed.length) > targetChunkSize && currentChunk.length > 0) {
      chunks.push({
        text: currentChunk.trim(),
        page: currentPage
      });
      currentChunk = trimmed;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + trimmed;
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push({
      text: currentChunk.trim(),
      page: currentPage
    });
  }

  return chunks;
}

/**
 * Process an uploaded document: chunk its text and store chunks in document_chunks table
 */
async function processAndStoreDocumentChunks(documentId, extractedText) {
  if (!extractedText) return [];

  const chunks = splitTextIntoChunks(extractedText);
  const storedChunks = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const vector = textToVector(chunk.text);
    
    try {
      const res = await db.query(`
        INSERT INTO document_chunks (document_id, chunk_text, embedding_vector, chunk_index, page_number)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, document_id, chunk_text, chunk_index, page_number
      `, [documentId, chunk.text, JSON.stringify(vector), i, chunk.page]);

      storedChunks.push(res.rows[0]);
    } catch (err) {
      console.error(`Error storing chunk ${i} for document ${documentId}:`, err.message);
    }
  }

  return storedChunks;
}

/**
 * Retrieve the top K relevant chunks across all documents in a Space
 */
async function retrieveRelevantChunks(spaceId, queryText, topK = 5, documentTypeFilter = null) {
  try {
    let sql = `
      SELECT dc.id, dc.document_id, dc.chunk_text, dc.embedding_vector, dc.chunk_index, dc.page_number,
             d.file_name, d.type as document_type
      FROM document_chunks dc
      JOIN documents d ON dc.document_id = d.id
      WHERE d.space_id = $1
    `;
    const params = [spaceId];

    if (documentTypeFilter) {
      params.push(documentTypeFilter);
      sql += ` AND d.type = $2`;
    }

    const res = await db.query(sql, params);
    const queryVector = textToVector(queryText);

    const scoredChunks = res.rows.map(row => {
      let docVector = {};
      try {
        docVector = JSON.parse(row.embedding_vector || '{}');
      } catch (e) {
        docVector = textToVector(row.chunk_text);
      }
      const score = cosineSimilarity(queryVector, docVector);
      return { ...row, score };
    });

    // Sort descending by score
    scoredChunks.sort((a, b) => b.score - a.score);

    // If scores are all 0 (no keyword overlap), fall back to first topK chunks
    const topChunks = scoredChunks.slice(0, topK);
    return topChunks;
  } catch (err) {
    console.error('Error in retrieveRelevantChunks:', err.message);
    return [];
  }
}

module.exports = {
  splitTextIntoChunks,
  processAndStoreDocumentChunks,
  retrieveRelevantChunks
};
