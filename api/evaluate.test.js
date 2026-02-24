// Unit tests for api/evaluate.js
// Uses Node's built-in test runner (no dependencies required)
// Mocks fetch so no ANTHROPIC_API_KEY is needed
import { test } from 'node:test';
import assert from 'node:assert/strict';
import handler from './evaluate.js';

// --- Helpers ---

function mockReq(method = 'POST', body = {}) {
  return { method, body };
}

function mockRes() {
  const res = {
    headers: {},
    statusCode: null,
    responseBody: null,
    setHeader(key, value) { this.headers[key] = value; },
    status(code) {
      res.statusCode = code;
      return {
        json(body) { res.responseBody = body; return res; },
        end() { return res; }
      };
    }
  };
  return res;
}

function stubFetch(text) {
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({ content: [{ text }] })
  });
}

// --- Tests ---

test('OPTIONS preflight returns 200', async () => {
  const res = mockRes();
  await handler(mockReq('OPTIONS'), res);
  assert.equal(res.statusCode, 200);
});

test('non-POST method returns 405', async () => {
  const res = mockRes();
  await handler(mockReq('GET'), res);
  assert.equal(res.statusCode, 405);
  assert.equal(res.responseBody.error, 'Method not allowed');
});

test('missing message field returns 400', async () => {
  const res = mockRes();
  await handler(mockReq('POST', { scenario: 'phishing email' }), res);
  assert.equal(res.statusCode, 400);
  assert.ok(res.responseBody.error);
});

test('missing scenario field returns 400', async () => {
  const res = mockRes();
  await handler(mockReq('POST', { message: 'Watch out for phishing!' }), res);
  assert.equal(res.statusCode, 400);
  assert.ok(res.responseBody.error);
});

test('parses score, feedback, and suggestion from a well-formed Claude response', async () => {
  stubFetch(
    'SCORE: 520\n' +
    'FEEDBACK: The message is clear and actionable.\n' +
    'SUGGESTION: Add more specific examples of phishing red flags.'
  );
  const res = mockRes();
  await handler(mockReq('POST', { message: 'Be careful of phishing', scenario: 'phishing email' }), res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.responseBody.score, 520);
  assert.equal(res.responseBody.feedback, 'The message is clear and actionable.');
  assert.equal(res.responseBody.suggestion, 'Add more specific examples of phishing red flags.');
});

test('score is capped at 650 max by Claude — passes through parsed value correctly', async () => {
  stubFetch('SCORE: 650\nFEEDBACK: Outstanding work.\nSUGGESTION: Excellent as-is');
  const res = mockRes();
  await handler(mockReq('POST', { message: 'great message', scenario: 'ransomware' }), res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.responseBody.score, 650);
  assert.equal(res.responseBody.suggestion, 'Excellent as-is');
});

test('uses fallback values when Claude response is malformed', async () => {
  stubFetch('I cannot evaluate this message at this time.');
  const res = mockRes();
  await handler(mockReq('POST', { message: 'test', scenario: 'test scenario' }), res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.responseBody.score, 300);           // fallback score
  assert.equal(res.responseBody.feedback, 'Message evaluated.'); // fallback feedback
  assert.equal(res.responseBody.suggestion, 'Keep practicing!'); // fallback suggestion
});

test('returns 500 when Anthropic API returns a non-ok response', async () => {
  globalThis.fetch = async () => ({ ok: false, statusText: 'Unauthorized' });
  const res = mockRes();
  await handler(mockReq('POST', { message: 'test', scenario: 'test' }), res);

  assert.equal(res.statusCode, 500);
  assert.ok(res.responseBody.error);
});

test('returns 500 with details when fetch throws a network error', async () => {
  globalThis.fetch = async () => { throw new Error('Network failure'); };
  const res = mockRes();
  await handler(mockReq('POST', { message: 'test', scenario: 'test' }), res);

  assert.equal(res.statusCode, 500);
  assert.equal(res.responseBody.details, 'Network failure');
});
