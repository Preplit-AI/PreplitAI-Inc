'use strict';
const Groq = require('groq-sdk');
const { FALLBACK_MODELS } = require('../config/constants');

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
    const err = new Error('GROQ_API_KEY is not set, so transcription, notes and chat are unavailable.');
    err.code = 'LLM_NOT_CONFIGURED';
    throw err;
  }
  if (!client) client = new Groq({ apiKey, timeout: 5 * 60 * 1000, maxRetries: 2 });
  return client;
}

const modelsFrom = (primaryModel) => [...new Set([primaryModel, ...FALLBACK_MODELS].filter(Boolean))];

/** How long background work will wait for a provider rate limit before giving up on a model. */
const PATIENCE_MS = 5 * 60 * 1000;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** How long the provider says to wait. It says so in a header, in its message, or both. */
function retryDelayMs(err) {
  const header = Number(err.headers && (err.headers.get ? err.headers.get('retry-after') : err.headers['retry-after']));
  if (Number.isFinite(header) && header > 0) return header * 1000;
  const match = String(err.message).match(/try again in (?:(\d+)m)?([\d.]+)(ms|s)/i);
  if (match) return (Number(match[1] || 0) * 60 + Number(match[2]) * (match[3] === 'ms' ? 0.001 : 1)) * 1000;
  return 20000;
}

/**
 * Returns the generated text, or throws. It never returns empty or substitute
 * content: a student revising from fabricated notes is worse than a student
 * seeing an error.
 *
 * `patient` is for background work no one is watching: a per-minute rate limit
 * is waited out rather than treated as a failure. A request too large for the
 * plan (413) is not a rate limit and no amount of waiting helps.
 */
async function callLLM({ systemPrompt, userPrompt, primaryModel, jsonMode = false, temperature = 0.2, patient = false }) {
  const groq = getClient();

  let lastError = null;
  for (const model of modelsFrom(primaryModel)) {
    const giveUpAt = Date.now() + PATIENCE_MS;
    for (;;) {
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
        break;
      } catch (err) {
        lastError = err;
        const wait = retryDelayMs(err);
        if (patient && err.status === 429 && Date.now() + wait < giveUpAt) {
          console.log('[llm] ' + model + ' rate limited; waiting ' + Math.ceil(wait / 1000) + 's');
          await sleep(wait + 250);
          continue;
        }
        console.warn('[llm] ' + model + ' failed:', err.message);
        break;
      }
    }
  }

  const err = new Error('Text generation failed on every model. Last error: ' + (lastError ? lastError.message : 'unknown'));
  err.code = 'LLM_UNAVAILABLE';
  throw err;
}

/**
 * One streamed model turn for the chat. Yields, in order:
 *
 *   { type: 'text', text }             as the answer arrives
 *   { type: 'tool_calls', calls }      when the model asks for tools instead
 *   { type: 'usage', tokens }          once, if the provider reports it
 *
 * A model that fails before producing anything falls through to the next one.
 * Once text has reached the student a failure is final: restarting on another
 * model would print a second, different answer after the first.
 */
async function* streamTurn({ primaryModel, messages, tools, signal, temperature = 0.2, maxTokens = 3000 }) {
  const groq = getClient();

  let lastError = null;
  for (const model of modelsFrom(primaryModel)) {
    let produced = false;
    try {
      const stream = await groq.chat.completions.create(
        {
          model,
          temperature,
          messages,
          stream: true,
          max_completion_tokens: maxTokens,
          // Answers come from what the tools returned, so long deliberation adds
          // cost and delay and no accuracy. Only these models accept the setting.
          ...(model.startsWith('openai/gpt-oss') ? { reasoning_effort: 'low' } : {}),
          ...(tools && tools.length ? { tools, tool_choice: 'auto' } : {}),
        },
        { signal }
      );

      const calls = [];
      let tokens = null;
      let finish = null;
      for await (const chunk of stream) {
        const usage = chunk.usage || chunk.x_groq?.usage;
        if (usage && usage.total_tokens) tokens = usage.total_tokens;

        const choice = chunk.choices?.[0];
        if (choice?.finish_reason) finish = choice.finish_reason;
        const delta = choice?.delta;
        if (!delta) continue;
        if (delta.content) {
          produced = true;
          yield { type: 'text', text: delta.content };
        }
        for (const part of delta.tool_calls || []) {
          produced = true;
          const index = part.index ?? calls.length;
          if (!calls[index]) calls[index] = { id: '', name: '', arguments: '' };
          if (part.id) calls[index].id = part.id;
          if (part.function?.name) calls[index].name += part.function.name;
          if (part.function?.arguments) calls[index].arguments += part.function.arguments;
        }
      }

      if (tokens) yield { type: 'usage', tokens };
      if (!produced) {
        lastError = new Error('Model ' + model + ' returned an empty completion');
        continue;
      }
      // Cut off by the token limit or a dropped connection: what arrived reads
      // like an answer but is not one, so it must not be saved as if it were.
      if (finish !== 'stop' && finish !== 'tool_calls') {
        throw new Error('Model ' + model + ' stopped early (' + (finish || 'stream ended') + ')');
      }
      const finished = calls.filter((c) => c && c.name);
      if (finished.length) yield { type: 'tool_calls', calls: finished };
      return;
    } catch (err) {
      if (signal && signal.aborted) throw err;
      lastError = err;
      console.warn('[llm] ' + model + ' failed:', err.message);
      if (produced) break;
    }
  }

  const err = new Error('Chat generation failed. Last error: ' + (lastError ? lastError.message : 'unknown'));
  err.code = lastError && lastError.status === 429 ? 'LLM_BUSY' : 'LLM_UNAVAILABLE';
  throw err;
}

module.exports = { getClient, callLLM, streamTurn };
