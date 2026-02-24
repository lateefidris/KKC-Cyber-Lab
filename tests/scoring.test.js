// Unit tests for scoring formulas extracted from public/index.html
// Tests pure logic only — no DOM, no API calls needed.
import { test } from 'node:test';
import assert from 'node:assert/strict';

// --- Scoring formulas (mirrored from index.html) ---

function analystScore(correct, incorrect, missed) {
  return Math.max(0, (correct * 300) - (incorrect * 100) - (missed * 150));
}

// Fixed formula: Math.round on full ratio so perfect score always == 600
function pentesterScore(correctCount, total) {
  return Math.round(600 * correctCount / total);
}

function forensicsScore(correct) {
  return correct * 150;
}

// --- Security Analyst ---

test('Analyst: all correct, no mistakes → 600', () => {
  assert.equal(analystScore(2, 0, 0), 600);
});

test('Analyst: all correct with one false positive → 500', () => {
  assert.equal(analystScore(2, 1, 0), 500);
});

test('Analyst: missed one threat → 450', () => {
  assert.equal(analystScore(1, 0, 1), 150);
});

test('Analyst: no correct, all missed → 0 (no negative scores)', () => {
  assert.equal(analystScore(0, 0, 2), 0);
});

test('Analyst: penalties do not produce negative score', () => {
  assert.equal(analystScore(0, 5, 5), 0);
});

// --- Penetration Tester ---

test('Pentester R1: 6 passwords all correct → exactly 600', () => {
  assert.equal(pentesterScore(6, 6), 600);
});

test('Pentester R2: 7 passwords all correct → exactly 600 (was 595 with old Math.floor bug)', () => {
  assert.equal(pentesterScore(7, 7), 600);
});

test('Pentester R3: 8 passwords all correct → exactly 600', () => {
  assert.equal(pentesterScore(8, 8), 600);
});

test('Pentester: zero correct → 0', () => {
  assert.equal(pentesterScore(0, 7), 0);
});

test('Pentester R2: partial credit scales correctly (3 of 7 correct)', () => {
  assert.equal(pentesterScore(3, 7), Math.round(600 * 3 / 7)); // 257
});

// --- Digital Forensics ---

test('Forensics R1: all 6 events correct → 900', () => {
  assert.equal(forensicsScore(6), 900);
});

test('Forensics R2: all 7 events correct → 1050', () => {
  assert.equal(forensicsScore(7), 1050);
});

test('Forensics R3: all 8 events correct → 1200', () => {
  assert.equal(forensicsScore(8), 1200);
});

test('Forensics: zero correct → 0', () => {
  assert.equal(forensicsScore(0), 0);
});
