'use strict';
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const db = require('../db/database');
const documentParser = require('../services/documentParser');
const gksEvaluationService = require('../services/gksEvaluationService');
const { v4: uuidv4 } = require('uuid');

// Configure multer for GKS uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/gks');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'gks-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Helper to extract or generate session token for public GKS users
function getOrGenerateSessionToken(req) {
  let sessionToken = req.headers['x-gks-session-token'] || req.body?.sessionToken;
  if (!sessionToken || typeof sessionToken !== 'string') {
    sessionToken = 'gks_sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
  }
  return sessionToken;
}

// ── 1. POST /api/gks/profile ── Save/Update GKS Profile (UNRESTRICTED)
router.post('/profile', async (req, res) => {
  try {
    const sessionToken = getOrGenerateSessionToken(req);
    const {
      track,
      degreeLevel,
      country,
      targetField,
      firstChoiceUniversity,
      secondChoiceUniversity,
      thirdChoiceUniversity,
      academicGpa,
      topikLevel,
      englishScore,
      englishTestType,
      englishTestScore
    } = req.body;

    // Check if profile exists for this session_token
    const existing = await db.query('SELECT * FROM gks_profiles WHERE session_token = $1', [sessionToken]);

    let profile;
    if (existing.rows.length > 0) {
      const updated = await db.query(`
        UPDATE gks_profiles
        SET track = COALESCE($1, track),
            degree_level = COALESCE($2, degree_level),
            country = COALESCE($3, country),
            target_field = COALESCE($4, target_field),
            first_choice_university = COALESCE($5, first_choice_university),
            second_choice_university = COALESCE($6, second_choice_university),
            third_choice_university = COALESCE($7, third_choice_university),
            academic_gpa = COALESCE($8, academic_gpa),
            topik_level = COALESCE($9, topik_level),
            english_score = COALESCE($10, english_score),
            english_test_type = COALESCE($11, english_test_type),
            english_test_score = COALESCE($12, english_test_score),
            updated_at = now()
        WHERE session_token = $13
        RETURNING *
      `, [
        track, degreeLevel, country, targetField,
        firstChoiceUniversity, secondChoiceUniversity, thirdChoiceUniversity,
        academicGpa, topikLevel, englishScore, englishTestType, englishTestScore, sessionToken
      ]);
      profile = updated.rows[0];
    } else {
      const created = await db.query(`
        INSERT INTO gks_profiles (
          session_token, track, degree_level, country, target_field,
          first_choice_university, second_choice_university, third_choice_university,
          academic_gpa, topik_level, english_score, english_test_type, english_test_score
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *
      `, [
        sessionToken, track || 'embassy', degreeLevel || 'master',
        country || '', targetField || '', firstChoiceUniversity || '',
        secondChoiceUniversity || '', thirdChoiceUniversity || '',
        academicGpa || '', topikLevel || '', englishScore || '',
        englishTestType || 'IELTS', englishTestScore || ''
      ]);
      profile = created.rows[0];
    }

    res.json({
      success: true,
      sessionToken,
      profile
    });
  } catch (err) {
    console.error('Error saving GKS profile:', err);
    res.status(500).json({ error: 'Failed to save GKS profile', message: err.message });
  }
});

// ── 2. GET /api/gks/profile ── Get Profile
router.get('/profile', async (req, res) => {
  try {
    const sessionToken = getOrGenerateSessionToken(req);
    const result = await db.query('SELECT * FROM gks_profiles WHERE session_token = $1', [sessionToken]);
    res.json({
      success: true,
      sessionToken,
      profile: result.rows[0] || null
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch GKS profile', message: err.message });
  }
});

// ── 3. POST /api/gks/document ── Upload or Save GKS Document (UNRESTRICTED)
router.post('/document', upload.single('file'), async (req, res) => {
  try {
    const sessionToken = getOrGenerateSessionToken(req);
    const documentType = req.body.documentType || 'personal_statement'; // personal_statement, study_plan, recommendation_letter
    let extractedText = req.body.text || '';
    let fileName = req.body.fileName || 'Pasted Content';

    if (req.file) {
      fileName = req.file.originalname;
      const storedPath = path.join(__dirname, '../uploads/gks', req.file.filename);
      extractedText = await documentParser.parseDocument(storedPath, req.file.mimetype);
    }

    if (!extractedText || !extractedText.trim()) {
      return res.status(400).json({ error: 'Document text is empty or could not be parsed' });
    }

    // Fetch or create profile
    let profileRes = await db.query('SELECT * FROM gks_profiles WHERE session_token = $1', [sessionToken]);
    let profileId;
    if (profileRes.rows.length === 0) {
      const newProf = await db.query('INSERT INTO gks_profiles (session_token) VALUES ($1) RETURNING id', [sessionToken]);
      profileId = newProf.rows[0].id;
    } else {
      profileId = profileRes.rows[0].id;
    }

    // Fetch or create application record
    let appRes = await db.query('SELECT * FROM gks_applications WHERE profile_id = $1 ORDER BY created_at DESC LIMIT 1', [profileId]);
    let applicationId;
    if (appRes.rows.length === 0) {
      const newApp = await db.query('INSERT INTO gks_applications (profile_id) VALUES ($1) RETURNING id', [profileId]);
      applicationId = newApp.rows[0].id;
    } else {
      applicationId = appRes.rows[0].id;
    }

    // Save or update document of this type
    const wordCount = extractedText.trim().split(/\s+/).filter(Boolean).length;
    await db.query('DELETE FROM gks_documents WHERE application_id = $1 AND document_type = $2', [applicationId, documentType]);
    
    const docRes = await db.query(`
      INSERT INTO gks_documents (application_id, document_type, file_name, extracted_text, word_count)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [applicationId, documentType, fileName, extractedText, wordCount]);

    res.json({
      success: true,
      sessionToken,
      document: docRes.rows[0]
    });
  } catch (err) {
    console.error('Error uploading GKS document:', err);
    res.status(500).json({ error: 'Failed to upload document', message: err.message });
  }
});

// ── 4. POST /api/gks/evaluate ── Trigger Full GKS Guidance Evaluation (UNRESTRICTED)
router.post('/evaluate', async (req, res) => {
  try {
    const sessionToken = getOrGenerateSessionToken(req);

    // Fetch profile
    const profileRes = await db.query('SELECT * FROM gks_profiles WHERE session_token = $1', [sessionToken]);
    const profile = profileRes.rows[0] || {
      track: req.body.profile?.track || 'embassy',
      degree_level: req.body.profile?.degreeLevel || 'master',
      country: req.body.profile?.country || '',
      target_field: req.body.profile?.targetField || '',
      first_choice_university: req.body.profile?.firstChoiceUniversity || '',
      second_choice_university: req.body.profile?.secondChoiceUniversity || '',
      third_choice_university: req.body.profile?.thirdChoiceUniversity || '',
      academic_gpa: req.body.profile?.academicGpa || '',
      topik_level: req.body.profile?.topikLevel || '',
      english_score: req.body.profile?.englishScore || ''
    };

    // Gather submitted documents from DB or request body fallback
    let documents = [];
    if (profileRes.rows.length > 0) {
      const appRes = await db.query('SELECT id FROM gks_applications WHERE profile_id = $1 ORDER BY created_at DESC LIMIT 1', [profileRes.rows[0].id]);
      if (appRes.rows.length > 0) {
        const docsRes = await db.query('SELECT document_type as type, extracted_text as text, file_name as fileName FROM gks_documents WHERE application_id = $1', [appRes.rows[0].id]);
        documents = docsRes.rows;
      }
    }

    // Direct text fallback if frontend sent inline documents
    if (documents.length === 0 && req.body.documents) {
      documents = req.body.documents;
    }

    // Run evaluation pipeline
    const result = await gksEvaluationService.evaluateApplication(profile, documents);

    // Save evaluation result if we have an application record
    if (profileRes.rows.length > 0) {
      const appRes = await db.query('SELECT id FROM gks_applications WHERE profile_id = $1 ORDER BY created_at DESC LIMIT 1', [profileRes.rows[0].id]);
      if (appRes.rows.length > 0) {
        const appId = appRes.rows[0].id;
        await db.query(`
          INSERT INTO gks_evaluations (
            application_id, readiness_score, narrative_fit_score, academic_fit_score,
            korea_fit_score, feasibility_score, document_diagnostics, action_items, raw_ai_response
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          appId,
          result.readinessScore,
          result.scores.narrativeFit,
          result.scores.academicFit,
          result.scores.koreaFit,
          result.scores.feasibility,
          JSON.stringify(result.documentDiagnostics),
          JSON.stringify(result.actionItems),
          JSON.stringify(result)
        ]);

        await db.query('UPDATE gks_applications SET readiness_score = $1, status = $2, updated_at = now() WHERE id = $3', [
          result.readinessScore, 'evaluated', appId
        ]);
      }
    }

    res.json({
      success: true,
      sessionToken,
      evaluation: result
    });
  } catch (err) {
    console.error('Error running GKS evaluation:', err);
    res.status(500).json({ error: 'Evaluation failed', message: err.message });
  }
});

// ── 5. POST /api/gks/chat ── Dedicated GKS Advisor AI Chatbot (UNRESTRICTED)
const { callLLM } = require('../services/llmService');

router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const systemPrompt = `You are the Preplit AI GKS Selection Advisor & KGSP Scholarship Expert.
You assist international students applying for the Global Korea Scholarship (GKS / KGSP) program administered by NIIED (National Institute for International Education), South Korea.

Key Knowledge Base:
- Eligibility: Minimum CGPA 80% or top 20% of class, under 25 years old (Undergraduate) or under 40 years old (Graduate).
- Tracks:
  1) Embassy Track: Apply via Korean Embassy in home country. Choose up to 3 universities (combination of Type A and Type B). 3 rounds of selection (Embassy -> NIIED -> Universities).
  2) University Track: Apply directly to 1 Korean university. 2 rounds of selection (University -> NIIED).
- Scholarship Benefits: Full tuition, 1,000,000 KRW monthly stipend, 200,000 KRW settlement allowance, 1-year intensive Korean language program (must reach TOPIK Level 3 within 1 year), round-trip airfare, medical insurance.
- Required Documents: Form 1 (Application), Form 2 (Personal Statement), Form 3 (Study Plan), Form 4 (Recommendation Letter), Form 5 (GKS Applicant Agreement), Form 6 (Personal Medical Assessment), Transcripts & Graduation Certificates (Apostilled/Consular Authenticated), Proof of Citizenship (Birth Certificates or Passports).
- Language Requirements: TOPIK Level 3+ or IELTS 6.5+ / TOEFL 80+ grants additional evaluation preference. TOPIK Level 5 or 6 scholars are exempt from the 1-year language program and receive a 100,000 KRW/month bonus allowance.

Guidelines:
- Give clear, encouraging, highly accurate, and practical advice.
- Keep answers formatted with bullet points for readability.
- Respond in the same language as the user query (Korean or English).`;

    let reply = await callLLM({
      systemPrompt,
      userPrompt: message,
      primaryModel: 'llama-3.1-8b-instant'
    });

    if (!reply) {
      reply = "GKS Scholarship Guidance Tip:\n- For Embassy Track, select 3 target universities (including at least one Type B university).\n- For University Track, apply directly to your primary target department.\n- Ensure all certificates are Apostilled or Consular Authenticated prior to 1st round submission.";
    }

    res.json({
      success: true,
      reply
    });
  } catch (err) {
    console.error('Error in GKS AI Chat:', err);
    res.status(500).json({ error: 'Chat service error', message: err.message });
  }
});

// ── 6. POST /api/gks/manual-review ── Apply for Manual Scholar & Alumni Review
router.post('/manual-review', async (req, res) => {
  try {
    const sessionToken = getOrGenerateSessionToken(req);
    const { name, email, track, notes } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required for manual review application' });
    }

    const reviewRes = await db.query(`
      INSERT INTO gks_manual_reviews (session_token, applicant_name, applicant_email, target_track, notes)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [sessionToken, name, email, track || 'embassy', notes || '']);

    res.json({
      success: true,
      message: 'Manual review application submitted successfully! A former GKS scholar will review your dossier within 48 hours.',
      review: reviewRes.rows[0]
    });
  } catch (err) {
    console.error('Error applying for manual review:', err);
    res.status(500).json({ error: 'Failed to submit manual review application', message: err.message });
  }
});

// ── 7. GET /api/gks/scholar-materials ── Previous Successful Scholars' Samples & Guidelines
router.get('/scholar-materials', (req, res) => {
  const materials = [
    {
      id: 'mat-1',
      title: 'Successful Embassy Track Personal Statement (SNU Computer Science Scholar)',
      type: 'Personal Statement (Form 2)',
      scholarYear: '2024 GKS Scholar',
      degree: 'Master\'s Degree',
      university: 'Seoul National University',
      summary: 'High-scoring Personal Statement demonstrating clear academic origin, resilience through project setbacks, and specific alignment with Korean tech innovation.',
      previewText: 'From my initial undergraduate research in distributed systems, South Korea stood out as the global epicenter of real-time cloud infrastructure...'
    },
    {
      id: 'mat-2',
      title: 'High-Scoring University Track Study Plan (KAIST AI & Robotics)',
      type: 'Study Plan (Form 3)',
      scholarYear: '2024 GKS Scholar',
      degree: 'Doctoral Degree',
      university: 'KAIST',
      summary: 'Includes detailed 1-year language learning timeline, specific laboratory professor references, and a bilateral AI research collaboration post-graduation plan.',
      previewText: 'Goal of Study: 1) Language Plan: Reach TOPIK Level 5 in first 6 months. 2) Research Plan: Join Professor Kim\'s Autonomous Systems Lab...'
    },
    {
      id: 'mat-3',
      title: 'Professor Recommendation Letter Template & Real Sample',
      type: 'Recommendation Letter (Form 4)',
      scholarYear: '2023 GKS Scholar',
      degree: 'Master\'s Degree',
      university: 'Korea University',
      summary: 'Annotated sample letter showing quantified academic achievements, referee seal Placement, and endorsement of candidate adaptability.',
      previewText: 'It is my absolute pleasure to recommend [Applicant Name] for the Global Korea Scholarship program. As Dean of Engineering...'
    },
    {
      id: 'mat-4',
      title: 'Official NIIED Document Apostille & Consular Authentication Guide 2025',
      type: 'Official Guideline PDF',
      scholarYear: 'NIIED Official Notice',
      degree: 'All Programs',
      university: 'NIIED',
      summary: 'Complete step-by-step checklist for degree certificate apostille, translation notarization, and medical assessment submission.',
      previewText: 'Requirement Checklist: All original certificates must be issued within 1 year and verified by diplomatic missions...'
    }
  ];

  res.json({
    success: true,
    materials
  });
});

module.exports = router;

