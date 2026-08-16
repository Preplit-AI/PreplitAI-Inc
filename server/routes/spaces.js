'use strict';
const express = require('express');
const router = express.Router();
const db = require('../db/database');
const ragService = require('../services/ragService');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const pdfParse = require('pdf-parse');

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_'));
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }
});

// ── 1. Create a Space ────────────────────────────────────────────────────────
router.post('/spaces', async (req, res) => {
  try {
    const { name, user_id } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Space name is required' });
    }

    const result = await db.query(`
      INSERT INTO spaces (user_id, name)
      VALUES ($1, $2)
      RETURNING *
    `, [user_id || null, name]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating space:', err.message);
    res.status(500).json({ error: 'Failed to create space', message: err.message });
  }
});

// ── 2. List Spaces ────────────────────────────────────────────────────────────
router.get('/spaces', async (req, res) => {
  try {
    const user_id = req.query.user_id;
    const result = await db.query(`
      SELECT s.*, 
             COUNT(d.id)::int as document_count
      FROM spaces s
      LEFT JOIN documents d ON s.id = d.space_id
      ${user_id ? 'WHERE s.user_id = $1' : ''}
      GROUP BY s.id
      ORDER BY s.updated_at DESC
    `, user_id ? [user_id] : []);

    res.json(result.rows);
  } catch (err) {
    console.error('Error listing spaces:', err.message);
    res.status(500).json({ error: 'Failed to fetch spaces', message: err.message });
  }
});

// ── 3. Get Single Space & Nested Content (Documents + Generated Outputs) ──────
router.get('/spaces/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const spaceRes = await db.query('SELECT * FROM spaces WHERE id = $1', [id]);
    if (spaceRes.rows.length === 0) {
      return res.status(404).json({ error: 'Space not found' });
    }

    const docsRes = await db.query(`
      SELECT id, space_id, type, upload_method, raw_file_url, file_name, created_at,
             LENGTH(extracted_text) as text_length, extracted_text
      FROM documents
      WHERE space_id = $1
      ORDER BY created_at DESC
    `, [id]);

    const outputsRes = await db.query(`
      SELECT id, space_id, type, content, source_document_ids, created_at
      FROM generated_outputs
      WHERE space_id = $1
      ORDER BY created_at DESC
    `, [id]);

    res.json({
      ...spaceRes.rows[0],
      documents: docsRes.rows,
      generated_outputs: outputsRes.rows
    });
  } catch (err) {
    console.error('Error getting space:', err.message);
    res.status(500).json({ error: 'Failed to fetch space details', message: err.message });
  }
});

// ── 4. Rename Space ───────────────────────────────────────────────────────────
router.patch('/spaces/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const result = await db.query(`
      UPDATE spaces SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING *
    `, [name, id]);

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to rename space', message: err.message });
  }
});

// ── 5. Delete Space (Cascade deletes nested content) ──────────────────────────
router.delete('/spaces/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM spaces WHERE id = $1', [id]);
    res.json({ message: 'Space deleted successfully' });
  } catch (err) {
    console.error('Error deleting space:', err.message);
    res.status(500).json({ error: 'Failed to delete space', message: err.message });
  }
});

// ── 6. Upload Document to Space ──────────────────────────────────────────────
router.post('/spaces/:id/documents', upload.single('file'), async (req, res) => {
  try {
    const { id: space_id } = req.params;
    const { type = 'course_material', upload_method = 'file', text_content, file_name: customName } = req.body;

    let extractedText = '';
    let rawFileUrl = '';
    let fileName = customName || 'Document';

    if (upload_method === 'file' && req.file) {
      fileName = req.file.originalname;
      rawFileUrl = `/uploads/${req.file.filename}`;
      const filePath = req.file.path;

      if (fileName.toLowerCase().endsWith('.pdf')) {
        const fileBuffer = await fs.readFile(filePath);
        const pdfData = await pdfParse(fileBuffer);
        extractedText = pdfData.text;
      } else {
        extractedText = await fs.readFile(filePath, 'utf-8');
      }
    } else if (upload_method === 'paste' || upload_method === 'link') {
      extractedText = text_content || '';
      fileName = customName || (upload_method === 'paste' ? 'Pasted Text' : 'Imported Link');
    }

    if (!extractedText.trim()) {
      return res.status(400).json({ error: 'No extractable text content found in document' });
    }

    const docRes = await db.query(`
      INSERT INTO documents (space_id, type, upload_method, raw_file_url, extracted_text, file_name)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [space_id, type, upload_method, rawFileUrl, extractedText, fileName]);

    const createdDoc = docRes.rows[0];

    // Asynchronously chunk and store vector embeddings for grounded RAG
    try {
      await ragService.processAndStoreDocumentChunks(createdDoc.id, extractedText);
    } catch (chunkErr) {
      console.warn('Document chunking notice:', chunkErr.message);
    }

    await db.query('UPDATE spaces SET updated_at = NOW() WHERE id = $1', [space_id]);

    res.status(201).json(createdDoc);
  } catch (err) {
    console.error('Error uploading document to space:', err.message);
    res.status(500).json({ error: 'Failed to process document upload', message: err.message });
  }
});

// ── 7. Save Generated Content to Space (Auto-Save Endpoint) ───────────────────
router.post('/spaces/:id/outputs', async (req, res) => {
  try {
    const { id: space_id } = req.params;
    const { type, content, source_document_ids } = req.body;

    if (!type || !content) {
      return res.status(400).json({ error: 'Type and content are required' });
    }

    const result = await db.query(`
      INSERT INTO generated_outputs (space_id, type, content, source_document_ids)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [space_id, type, typeof content === 'string' ? content : JSON.stringify(content), source_document_ids]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save generated output', message: err.message });
  }
});

module.exports = router;
