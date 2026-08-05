'use strict';
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || 'mock_key' });

/**
 * PreplitAI LLM Model Routing & Generation Service (PART 7.2)
 */
async function callLLM({ systemPrompt, userPrompt, primaryModel = 'llama-3.1-8b-instant', jsonMode = false }) {
  const fallbackModels = [
    primaryModel,
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
    'mixtral-8x7b-32768'
  ];

  // Remove duplicates while preserving order
  const uniqueModels = [...new Set(fallbackModels)];

  let lastError = null;

  for (const model of uniqueModels) {
    try {
      const options = {
        model,
        temperature: 0.7,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      };

      if (jsonMode && (model.includes('llama-3.3') || model.includes('8b-instant'))) {
        options.response_format = { type: 'json_object' };
      }

      const completion = await groq.chat.completions.create(options);
      const text = completion.choices?.[0]?.message?.content?.trim() || '';
      return text;
    } catch (err) {
      lastError = err;
      console.warn(`Groq model ${model} failed, trying fallback:`, err.message);
      // Continue to next fallback model
    }
  }

  // Fallback mock mode if API key is invalid or Groq calls fail during offline testing
  console.error('All Groq models failed. Using local fallback generator.');
  return null;
}

module.exports = {
  callLLM
};
