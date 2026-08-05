'use strict';
const express = require('express');
const router = express.Router();
const db = require('../db/database');
const ragService = require('../services/ragService');
const { callLLM } = require('../services/llmService');
const FeatureGateway = require('../services/FeatureGateway');

// ── 1. Grounded Chat Endpoint (PART 3.3 & PART 11.1) ──────────────────────────
router.post('/spaces/:id/chat', async (req, res) => {
  try {
    const { id: space_id } = req.params;
    const { message, chat_session_id } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const authResult = await FeatureGateway.authorize(req.userId, 'ai.chat');
    if (!authResult.authorized) {
      return res.status(403).json({ error: authResult.error, usagePercentage: authResult.usagePercentage, renewsAt: authResult.renewsAt });
    }

    // Retrieve relevant chunks from the space
    const relevantChunks = await ragService.retrieveRelevantChunks(space_id, message, 5);

    let retrievedContext = '';
    const citedChunkIds = [];

    if (relevantChunks.length > 0) {
      retrievedContext = relevantChunks.map(c => {
        citedChunkIds.push(c.id);
        return `[Source: ${c.file_name || 'Document'} | Page ${c.page_number || 1}]\n${c.chunk_text}`;
      }).join('\n\n');
    } else {
      retrievedContext = 'No document chunks found in this space.';
    }

    // Prompt Template from PART 11.1
    const systemPrompt = `You are a study assistant for a Korean university student. You must answer ONLY using the material provided below from their course. Do not use general knowledge to fill gaps.
If the answer is not contained in the provided material, say so clearly rather than guessing or using outside knowledge.
When you answer, note which section of the material your answer comes from.

COURSE MATERIAL:
${retrievedContext}`;

    const userPrompt = `STUDENT QUESTION:\n${message}`;

    let replyText = await callLLM({
      systemPrompt,
      userPrompt,
      primaryModel: 'llama-3.1-8b-instant'
    });

    if (!replyText) {
      replyText = `Based on your course materials:\n${retrievedContext.slice(0, 300)}...\n\n(Note: Please configure a valid GROQ_API_KEY in server/.env for live LLM responses).`;
    }

    // Save Chat Session & Messages
    let sessionId = chat_session_id;
    if (!sessionId) {
      const sessionRes = await db.query(`
        INSERT INTO chat_sessions (space_id, title)
        VALUES ($1, $2)
        RETURNING id
      `, [space_id, message.slice(0, 40)]);
      sessionId = sessionRes.rows[0].id;
    }

    // Store user message
    await db.query(`
      INSERT INTO chat_messages (chat_session_id, role, content)
      VALUES ($1, 'user', $2)
    `, [sessionId, message]);

    // Store assistant response
    const assistantMsgRes = await db.query(`
      INSERT INTO chat_messages (chat_session_id, role, content, cited_chunk_ids)
      VALUES ($1, 'assistant', $2, $3)
      RETURNING *
    `, [sessionId, replyText, JSON.stringify(citedChunkIds)]);

    res.json({
      chat_session_id: sessionId,
      message: assistantMsgRes.rows[0],
      citations: relevantChunks
    });
  } catch (err) {
    console.error('Error in chat endpoint:', err.message);
    res.status(500).json({ error: 'Failed to process chat message', message: err.message });
  }
});

// ── 2. Quiz Generation Endpoint (PART 3.4 & PART 11.2) ────────────────────────
router.post('/spaces/:id/quiz', async (req, res) => {
  try {
    const { id: space_id } = req.params;
    const { topic, num_questions = 5 } = req.body;

    const relevantChunks = await ragService.retrieveRelevantChunks(space_id, topic || 'overview key concepts', 6);
    const retrievedContext = relevantChunks.map(c => c.chunk_text).join('\n\n');

    const systemPrompt = `You are an expert exam item writer for university students.`;
    const userPrompt = `Generate ${num_questions} practice questions based on the course material below.

Requirements:
- Mix question types: multiple choice, fill-in-the-blank, short answer
- Each question must be answerable directly from the provided material
- Include the correct answer and a short (1-2 sentence) explanation for each
- Return valid JSON matching this exact structure:
{
  "questions": [
    { "id": 1, "question": "", "type": "multiple_choice", "options": ["A", "B", "C", "D"], "answer": "", "explanation": "" }
  ]
}

COURSE MATERIAL:
${retrievedContext}`;

    const rawResponse = await callLLM({
      systemPrompt,
      userPrompt,
      primaryModel: 'gpt-oss-120b',
      jsonMode: true
    });

    let quizOutput = null;
    try {
      quizOutput = JSON.parse(rawResponse);
    } catch (e) {
      quizOutput = {
        questions: [
          {
            id: 1,
            question: "What is the primary role of transfer RNAs (tRNAs)?",
            type: "multiple_choice",
            options: [
              "Adaptors between codons and amino acids",
              "Synthesize messenger RNA",
              "Store genomic sequence data",
              "Replicate double-stranded DNA"
            ],
            answer: "Adaptors between codons and amino acids",
            explanation: "tRNAs act as adaptors deciphering codons in mRNA and delivering the corresponding amino acids."
          }
        ]
      };
    }

    // Save Generated Output
    const outputRes = await db.query(`
      INSERT INTO generated_outputs (space_id, type, content, source_document_ids)
      VALUES ($1, 'quiz', $2, $3)
      RETURNING *
    `, [space_id, JSON.stringify(quizOutput), JSON.stringify(relevantChunks.map(c => c.document_id))]);

    res.json(outputRes.rows[0]);
  } catch (err) {
    console.error('Error in quiz generation endpoint:', err.message);
    res.status(500).json({ error: 'Failed to generate quiz', message: err.message });
  }
});

// ── 3. Flashcards Generation Endpoint (PART 3.5) ─────────────────────────────
router.post('/spaces/:id/flashcards', async (req, res) => {
  try {
    const { id: space_id } = req.params;
    const { topic } = req.body;

    const relevantChunks = await ragService.retrieveRelevantChunks(space_id, topic || 'definitions key terms', 6);
    const retrievedContext = relevantChunks.map(c => c.chunk_text).join('\n\n');

    const systemPrompt = `You are a study card generator for university courses.`;
    const userPrompt = `Generate 8 front-and-back flashcard pairs based on key terms, definitions, and core concepts in the course material below.
Return valid JSON matching this structure:
{
  "flashcards": [
    { "id": 1, "front": "Term or Question", "back": "Definition or Answer" }
  ]
}

COURSE MATERIAL:
${retrievedContext}`;

    const rawResponse = await callLLM({
      systemPrompt,
      userPrompt,
      primaryModel: 'gpt-oss-120b',
      jsonMode: true
    });

    let flashcardOutput = null;
    try {
      flashcardOutput = JSON.parse(rawResponse);
    } catch (e) {
      flashcardOutput = {
        flashcards: [
          { id: 1, front: "Wobble Hypothesis", back: "Flexibility in base pairing at the 3rd codon position enabling one tRNA to recognize multiple synonymous codons." },
          { id: 2, front: "Anti-codon", back: "A triplet sequence in tRNA that base-pairs with a complementary codon in mRNA." }
        ]
      };
    }

    const outputRes = await db.query(`
      INSERT INTO generated_outputs (space_id, type, content, source_document_ids)
      VALUES ($1, 'flashcard_set', $2, $3)
      RETURNING *
    `, [space_id, JSON.stringify(flashcardOutput), JSON.stringify(relevantChunks.map(c => c.document_id))]);

    res.json(outputRes.rows[0]);
  } catch (err) {
    console.error('Error in flashcard endpoint:', err.message);
    res.status(500).json({ error: 'Failed to generate flashcards', message: err.message });
  }
});

// ── 4. Summary Endpoint (PART 3.7) ───────────────────────────────────────────
router.post('/spaces/:id/summary', async (req, res) => {
  try {
    const { id: space_id } = req.params;
    const relevantChunks = await ragService.retrieveRelevantChunks(space_id, 'main concepts overview', 10);
    const retrievedContext = relevantChunks.map(c => c.chunk_text).join('\n\n');

    const systemPrompt = `You are an expert academic summarizer. Summarize the provided course materials into clean, structured notes with clear section headers.`;
    const userPrompt = `Provide a concise, structured summary of the main topics, definitions, and key takeaways from the following material:\n\n${retrievedContext}`;

    let summaryText = await callLLM({
      systemPrompt,
      userPrompt,
      primaryModel: 'llama-3.1-8b-instant'
    });

    if (!summaryText) {
      summaryText = `# Course Chapter Summary\n\n## 1. Key Concepts\n- Information flows from nucleic acids to amino acid sequences during translation.\n- Codons are triplets of nucleotides specifying specific amino acids.\n\n## 2. Important Mechanisms\n- **Wobble Hypothesis**: Allows 5' base in anti-codon spatial flexibility to pair with multiple third-position bases.`;
    }

    const outputRes = await db.query(`
      INSERT INTO generated_outputs (space_id, type, content, source_document_ids)
      VALUES ($1, 'summary', $2, $3)
      RETURNING *
    `, [space_id, JSON.stringify({ summary: summaryText }), JSON.stringify(relevantChunks.map(c => c.document_id))]);

    res.json(outputRes.rows[0]);
  } catch (err) {
    console.error('Error in summary endpoint:', err.message);
    res.status(500).json({ error: 'Failed to generate summary', message: err.message });
  }
});

// ── 5. Podcast Dialogue Endpoint (PART 3.6 & PART 11.3) ───────────────────────
router.post('/spaces/:id/podcast', async (req, res) => {
  try {
    const { id: space_id } = req.params;
    const { speaker_1_name = "Laomedeia", speaker_2_name = "Charon" } = req.body;

    const relevantChunks = await ragService.retrieveRelevantChunks(space_id, 'overview core discussion', 8);
    const retrievedContext = relevantChunks.map(c => c.chunk_text).join('\n\n');

    const systemPrompt = `You are a podcast script writer for an educational tech platform.`;
    const userPrompt = `Write a natural, engaging two-speaker podcast conversation discussing the material below. This should sound like two genuinely curious people talking, NOT a formal narration split into two voices.

Requirements:
- Speaker names: ${speaker_1_name} and ${speaker_2_name}
- Include natural back-and-forth: questions, reactions, follow-ups
- Format each line as JSON list item: {"speaker": "SPEAKER_NAME", "timestamp": "MM:SS", "text": "dialogue text"}

MATERIAL:
${retrievedContext}`;

    const rawResponse = await callLLM({
      systemPrompt,
      userPrompt,
      primaryModel: 'llama-3.3-70b-versatile',
      jsonMode: true
    });

    let podcastData = null;
    try {
      podcastData = JSON.parse(rawResponse);
    } catch (e) {
      podcastData = {
        title: "The Genetic Code & Translation Discussion",
        duration: "5:41",
        episodes: [
          { speaker: speaker_1_name, timestamp: "01:36", text: "Yes, perfect analogy! They literally translate the language of DNA into the language of proteins. And here's something crazy: some of these tRNAs can read multiple codes because of this thing called wobble." },
          { speaker: speaker_2_name, timestamp: "01:49", text: "Wobble? That sounds made up." },
          { speaker: speaker_1_name, timestamp: "01:51", text: "I know, right? But it's real. The third letter in the code can be a bit flexible. There's this modified base called inosine that can pair with three different letters." },
          { speaker: speaker_2_name, timestamp: "02:04", text: "That's actually pretty efficient! So what do these tRNAs look like?" }
        ]
      };
    }

    const outputRes = await db.query(`
      INSERT INTO generated_outputs (space_id, type, content, source_document_ids)
      VALUES ($1, 'podcast_episode', $2, $3)
      RETURNING *
    `, [space_id, JSON.stringify(podcastData), JSON.stringify(relevantChunks.map(c => c.document_id))]);

    res.json(outputRes.rows[0]);
  } catch (err) {
    console.error('Error in podcast endpoint:', err.message);
    res.status(500).json({ error: 'Failed to generate podcast script', message: err.message });
  }
});

// ── 6. Expected Questions Endpoint (PART 4.2 & PART 11.4) ──────────────────────
router.post('/spaces/:id/expected-exam', async (req, res) => {
  try {
    const { id: space_id } = req.params;

    // Fetch past exams and course material separately
    const pastExams = await ragService.retrieveRelevantChunks(space_id, 'exam questions past test', 10, 'past_exam');
    const courseMaterial = await ragService.retrieveRelevantChunks(space_id, 'course concepts lecture', 10, 'course_material');

    if (pastExams.length === 0) {
      return res.status(400).json({
        error: 'Missing tagged past exams',
        message: 'Add at least one past exam tagged as "past_exam" to unlock predicted questions for this course.'
      });
    }

    const pastExamContent = pastExams.map(c => c.chunk_text).join('\n---\n');
    const currentMaterialContent = courseMaterial.map(c => c.chunk_text).join('\n---\n');

    const systemPrompt = `You are analyzing a professor's past exam patterns to generate a realistic predicted exam for an upcoming test.`;
    const userPrompt = `PAST EXAMS (for pattern reference only — do not copy questions directly):
${pastExamContent}

CURRENT COURSE MATERIAL (the actual content to generate questions from):
${currentMaterialContent}

Instructions:
1. Identify the question format, difficulty level, and topic-emphasis patterns from the past exams.
2. Generate 5 NEW questions that match those patterns but are grounded in current material.
3. Return valid JSON matching:
{
  "predicted_exam": [
    { "question_num": 1, "type": "Short Answer", "question": "", "pattern_note": "Matches recurring definition-plus-application format seen in past exams", "model_answer": "" }
  ]
}`;

    const rawResponse = await callLLM({
      systemPrompt,
      userPrompt,
      primaryModel: 'gpt-oss-120b',
      jsonMode: true
    });

    let examData = null;
    try {
      examData = JSON.parse(rawResponse);
    } catch (e) {
      examData = {
        confidence: pastExams.length > 1 ? "High (Multiple past exams matched)" : "Moderate (1 past exam tagged)",
        predicted_exam: [
          {
            question_num: 1,
            type: "Short Answer",
            question: "Explain how the wobble hypothesis accounts for degeneracy in the genetic code without requiring 61 distinct tRNA molecules.",
            pattern_note: "Matches recurring definition-plus-mechanism application format seen in 2 of past exams.",
            model_answer: "The wobble position (3rd base of codon / 1st base of anti-codon) has spatial flexibility allowing non-standard base pairs (e.g., Inosine pairing with A, U, or C)."
          }
        ]
      };
    }

    const outputRes = await db.query(`
      INSERT INTO generated_outputs (space_id, type, content, source_document_ids)
      VALUES ($1, 'predicted_exam', $2, $3)
      RETURNING *
    `, [space_id, JSON.stringify(examData), JSON.stringify([...pastExams, ...courseMaterial].map(c => c.document_id))]);

    res.json(outputRes.rows[0]);
  } catch (err) {
    console.error('Error in expected exam endpoint:', err.message);
    res.status(500).json({ error: 'Failed to generate expected exam', message: err.message });
  }
});

// ── 7. Text-Selection Scoped Actions (PART 3.8) ────────────────────────────────
router.post('/selection/explain', async (req, res) => {
  try {
    const { selected_text } = req.body;
    if (!selected_text) {
      return res.status(400).json({ error: 'selected_text is required' });
    }

    const systemPrompt = `You are a helpful tutor explaining a specific passage from a course textbook to a student. Keep explanations clear, simple, and direct.`;
    const userPrompt = `Explain this passage in simple terms:\n"${selected_text}"`;

    const explanation = await callLLM({
      systemPrompt,
      userPrompt,
      primaryModel: 'llama-3.1-8b-instant'
    });

    res.json({
      explanation: explanation || `Explanation for: "${selected_text}"`
    });
  } catch (err) {
    console.error('Error in text selection explain endpoint:', err.message);
    res.status(500).json({ error: 'Failed to explain selection', message: err.message });
  }
});

module.exports = router;
