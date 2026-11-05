'use strict';
const Groq = require('groq-sdk');

let client = null;

/**
 * The Groq client, built lazily.
 *
 * The key is read at call time, not at module load, so a missing key does not
 * take the whole API down on boot - but it fails the individual request loudly
 * instead of producing nothing. There is no offline or mock mode.
 */
function getClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    const err = new Error('GROQ_API_KEY is not set, so transcription and notes are unavailable.');
    err.code = 'LLM_NOT_CONFIGURED';
    throw err;
  }
  if (!client) client = new Groq({ apiKey, timeout: 5 * 60 * 1000, maxRetries: 2 });
  return client;
}

/**
 * Returns the generated text, or throws. It never returns empty or substitute
 * content: a student revising from fabricated notes is worse than a student
 * seeing an error.
 */
async function callLLM({ systemPrompt, userPrompt, primaryModel, jsonMode = false, temperature = 0.2 }) {
  const groq = getClient();
  const models = [...new Set([primaryModel, 'llama-3.3-70b-versatile', 'openai/gpt-oss-120b'].filter(Boolean))];

  let lastError = null;
  for (const model of models) {
    try {
      const completion = await groq.chat.completions.create({
        model,
        temperature,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
      });
      const text = (completion.choices?.[0]?.message?.content || '').trim();
      if (text) return text;
      lastError = new Error('Model ' + model + ' returned an empty completion');
    } catch (err) {
      lastError = err;
      console.warn('[llm] ' + model + ' failed:', err.message);
    }
  }

  const err = new Error('Text generation failed on every model. Last error: ' + (lastError ? lastError.message : 'unknown'));
  err.code = 'LLM_UNAVAILABLE';
  throw err;
}

module.exports = { getClient, callLLM };
