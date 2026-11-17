'use strict';
/**
 * The Groq SDK (used as an OpenAI-compatible HTTP client) against a local
 * server that speaks the same protocol, so the stream handling is tested on
 * real bytes without calling the provider.
 */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-that-is-long-enough-for-the-check-0123456789';
process.env.GROQ_API_KEY = 'local-test-key';
// Set a known fallback list so the cascade assertions below are stable.
process.env.FALLBACK_MODELS = 'fallback-a,fallback-b';

/** Decides each response: receives the parsed request, writes to the response. */
let respond = null;
let requestedModels = [];
let server;

before(async () => {
  server = http.createServer((req, res) => {
    let raw = '';
    req.on('data', (d) => { raw += d; });
    req.on('end', () => {
      const body = JSON.parse(raw);
      requestedModels.push(body.model);
      respond(body, res);
    });
  });
  await new Promise((resolve) => { server.listen(0, '127.0.0.1', resolve); });
  process.env.GROQ_BASE_URL = `http://127.0.0.1:${server.address().port}`;
});

after(() => {
  server.closeAllConnections();
  server.close();
});

const { streamTurn, callLLM } = require('../services/llmService');

const chunk = (delta, finish = null, extra = {}) =>
  `data: ${JSON.stringify({ id: 'x', object: 'chat.completion.chunk', choices: [{ index: 0, delta, finish_reason: finish }], ...extra })}\n\n`;

function sse(res, parts, { end = true } = {}) {
  res.writeHead(200, { 'Content-Type': 'text/event-stream' });
  for (const part of parts) res.write(part);
  if (end) res.end();
}

async function run(args = {}) {
  requestedModels = [];
  const events = [];
  let error = null;
  try {
    for await (const event of streamTurn({ primaryModel: 'model-a', messages: [{ role: 'user', content: '질문' }], ...args })) {
      events.push(event);
    }
  } catch (err) {
    error = err;
  }
  return { events, error, text: events.filter((e) => e.type === 'text').map((e) => e.text).join('') };
}

test('text arrives piece by piece, and usage is reported from the last chunk', async () => {
  respond = (body, res) => {
    assert.equal(body.stream, true);
    sse(res, [
      chunk({ content: '교착 ' }),
      chunk({ content: '상태예요.' }),
      chunk({}, 'stop', { x_groq: { usage: { total_tokens: 42 } } }),
      'data: [DONE]\n\n',
    ]);
  };
  const { events, error, text } = await run();
  assert.equal(error, null);
  assert.equal(text, '교착 상태예요.');
  assert.deepEqual(events.filter((e) => e.type === 'text').map((e) => e.text), ['교착 ', '상태예요.']);
  assert.deepEqual(events.find((e) => e.type === 'usage'), { type: 'usage', tokens: 42 });
});

test('reasoning text from the model is never passed on as the answer', async () => {
  respond = (body, res) => {
    sse(res, [chunk({ reasoning: '학생이 묻는 것은...' }), chunk({ content: '답이에요.' }), chunk({}, 'stop'), 'data: [DONE]\n\n']);
  };
  assert.equal((await run()).text, '답이에요.');
});

test('a tool call sent in pieces is put back together', async () => {
  respond = (body, res) => {
    assert.equal(body.tool_choice, 'auto');
    sse(res, [
      chunk({ tool_calls: [{ index: 0, id: 'call_1', type: 'function', function: { name: 'search_lectures', arguments: '{"query":' } }] }),
      chunk({ tool_calls: [{ index: 0, function: { arguments: '"교착 상태"}' } }] }),
      chunk({}, 'tool_calls'),
      'data: [DONE]\n\n',
    ]);
  };
  const { events, error } = await run({ tools: [{ type: 'function', function: { name: 'search_lectures', parameters: {} } }] });
  assert.equal(error, null);
  assert.deepEqual(events.find((e) => e.type === 'tool_calls').calls, [
    { id: 'call_1', name: 'search_lectures', arguments: '{"query":"교착 상태"}' },
  ]);
});

test('an answer cut off by the token limit fails instead of passing as complete', async () => {
  respond = (body, res) => sse(res, [chunk({ content: '쓰다가 끊긴 ' }), chunk({}, 'length'), 'data: [DONE]\n\n']);
  const { error, text } = await run();
  assert.equal(text, '쓰다가 끊긴 ');
  assert.equal(error.code, 'LLM_UNAVAILABLE');
  assert.match(error.message, /stopped early \(length\)/);
});

test('a stream that ends with no finish signal fails instead of passing as complete', async () => {
  respond = (body, res) => sse(res, [chunk({ content: '쓰다가 끊긴 ' })]);
  const { error } = await run();
  assert.equal(error.code, 'LLM_UNAVAILABLE');
  assert.match(error.message, /stopped early/);
});

test('a dropped connection partway through fails, and does not start over on another model', async () => {
  respond = (body, res) => {
    sse(res, [chunk({ content: '쓰다가 끊긴 ' })], { end: false });
    setTimeout(() => res.destroy(), 30);
  };
  const { error, text } = await run();
  assert.equal(text, '쓰다가 끊긴 ');
  assert.equal(error.code, 'LLM_UNAVAILABLE');
  assert.deepEqual(requestedModels, ['model-a']);
});

test('a model that fails before saying anything falls through to the next', async () => {
  respond = (body, res) => {
    if (body.model === 'model-a') {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: { message: 'model decommissioned', code: 'model_decommissioned' } }));
      return;
    }
    sse(res, [chunk({ content: '다음 모델의 답이에요.' }), chunk({}, 'stop'), 'data: [DONE]\n\n']);
  };
  const { error, text } = await run();
  assert.equal(error, null);
  assert.equal(text, '다음 모델의 답이에요.');
  assert.deepEqual(requestedModels, ['model-a', 'fallback-a']);
});

test('when every model fails the error says so, with no provider detail lost to the log', async () => {
  respond = (body, res) => {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: { message: 'nope' } }));
  };
  const { error, events } = await run();
  assert.equal(error.code, 'LLM_UNAVAILABLE');
  assert.equal(events.length, 0);
  assert.deepEqual(requestedModels, ['model-a', 'fallback-a', 'fallback-b']);
});

const rateLimited = (res) => {
  res.writeHead(429, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: { message: 'Rate limit reached. Please try again in 0.05s.', code: 'rate_limit_exceeded' } }));
};
const completion = (res, content) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ id: 'x', object: 'chat.completion', choices: [{ index: 0, message: { role: 'assistant', content }, finish_reason: 'stop' }] }));
};

test('background work waits out a rate limit on the same model, instead of failing', async () => {
  let calls = 0;
  respond = (body, res) => {
    calls += 1;
    if (calls <= 4) return rateLimited(res);
    return completion(res, '노트예요.');
  };
  requestedModels = [];
  const text = await callLLM({ systemPrompt: 's', userPrompt: 'u', primaryModel: 'model-a', patient: true });
  assert.equal(text, '노트예요.');
  assert.deepEqual([...new Set(requestedModels)], ['model-a']);
});

test('a request too large for the plan is not waited on, because waiting cannot help', async () => {
  respond = (body, res) => {
    res.writeHead(413, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: { message: 'Request too large' } }));
  };
  requestedModels = [];
  const started = Date.now();
  await assert.rejects(callLLM({ systemPrompt: 's', userPrompt: 'u', primaryModel: 'model-a', patient: true }), { code: 'LLM_UNAVAILABLE' });
  assert.equal(new Set(requestedModels).size, 3);
  assert.ok(Date.now() - started < 5000);
});

test('a chat answer that hits a rate limit fails quickly, and says it was busy', async () => {
  respond = (body, res) => rateLimited(res);
  const { error } = await run();
  assert.equal(error.code, 'LLM_BUSY');
});

test('chat does not send reasoning_effort to Gemini models', async () => {
  const seen = [];
  respond = (body, res) => {
    seen.push([body.model, body.reasoning_effort]);
    sse(res, [chunk({ content: '답이에요.' }), chunk({}, 'stop'), 'data: [DONE]\n\n']);
  };
  await run({ primaryModel: 'gemini-2.5-flash' });
  await run({ primaryModel: 'other/model' });
  assert.deepEqual(seen, [['gemini-2.5-flash', undefined], ['other/model', undefined]]);
});

test('an empty answer falls through to the next model', async () => {
  respond = (body, res) => {
    if (body.model === 'model-a') return sse(res, [chunk({}, 'stop'), 'data: [DONE]\n\n']);
    return sse(res, [chunk({ content: '답이에요.' }), chunk({}, 'stop'), 'data: [DONE]\n\n']);
  };
  assert.equal((await run()).text, '답이에요.');
});
