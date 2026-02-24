// Unit tests for api/password-feedback.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import handler from './password-feedback.js';

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

test('missing userRankingText returns 400', async () => {
  const res = mockRes();
  await handler(mockReq('POST', { correctRankingText: '1. password\n2. letmein' }), res);
  assert.equal(res.statusCode, 400);
  assert.ok(res.responseBody.error);
});

test('missing correctRankingText returns 400', async () => {
  const res = mockRes();
  await handler(mockReq('POST', { userRankingText: '1. password\n2. letmein' }), res);
  assert.equal(res.statusCode, 400);
  assert.ok(res.responseBody.error);
});

test('returns feedback string from Claude response', async () => {
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({
      content: [{ text: 'Good effort! You correctly spotted that long passphrases beat short complex ones.' }]
    })
  });

  const res = mockRes();
  await handler(mockReq('POST', {
    userRankingText: '1. password\n2. letmein',
    correctRankingText: '1. password\n2. letmein'
  }), res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.responseBody.feedback, 'Good effort! You correctly spotted that long passphrases beat short complex ones.');
});

test('returns 500 when Anthropic API returns non-ok response', async () => {
  globalThis.fetch = async () => ({ ok: false, statusText: 'Unauthorized' });

  const res = mockRes();
  await handler(mockReq('POST', {
    userRankingText: '1. password',
    correctRankingText: '1. password'
  }), res);

  assert.equal(res.statusCode, 500);
  assert.ok(res.responseBody.error);
});

test('returns 500 with details when fetch throws', async () => {
  globalThis.fetch = async () => { throw new Error('Network failure'); };

  const res = mockRes();
  await handler(mockReq('POST', {
    userRankingText: '1. password',
    correctRankingText: '1. password'
  }), res);

  assert.equal(res.statusCode, 500);
  assert.equal(res.responseBody.details, 'Network failure');
});
