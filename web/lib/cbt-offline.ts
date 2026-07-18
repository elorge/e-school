// web/lib/cbt-offline.ts
// Unlike the results/students queues (many small independent items), a
// CBT attempt is ONE ongoing session — so this stores a single active
// attempt's full state locally, keeps it live even with zero
// connectivity for the whole test, and reconciles with the server
// opportunistically.

import type { AttemptSession, SavedCodeAnswer } from './endpoints/cbt';
import { saveAnswer, submitAttempt } from './endpoints/cbt';

const KEY_PREFIX = 'eschools_cbt_attempt_';

// OBJECTIVE answers are a plain option index; CODE answers are the full
// SavedCodeAnswer (html/css/js + per-assertion results), matching
// AttemptSession.savedAnswers in endpoints/cbt.ts.
type StoredAnswer = number | SavedCodeAnswer;

interface LocalAttemptState extends AttemptSession {
  school: string;
  answers: Record<string, StoredAnswer>; // local source of truth while the test is running
  unsyncedQuestionIds: string[]; // answers not yet confirmed saved on the server
  submitted: boolean;
}

function key(attemptId: string) {
  return `${KEY_PREFIX}${attemptId}`;
}

export function initLocalAttempt(school: string, session: AttemptSession) {
  const state: LocalAttemptState = {
    ...session,
    school,
    answers: { ...session.savedAnswers },
    unsyncedQuestionIds: [],
    submitted: false,
  };
  localStorage.setItem(key(session.attemptId), JSON.stringify(state));
  return state;
}

export function getLocalAttempt(attemptId: string): LocalAttemptState | null {
  const raw = localStorage.getItem(key(attemptId));
  return raw ? (JSON.parse(raw) as LocalAttemptState) : null;
}

function writeLocalAttempt(state: LocalAttemptState) {
  localStorage.setItem(key(state.attemptId), JSON.stringify(state));
}

/**
 * Records an answer locally FIRST (instant, works offline), then
 * attempts a best-effort background sync. If the sync fails, the
 * question stays in unsyncedQuestionIds and gets retried later —
 * nothing is ever lost, and the student's UI never waits on the network.
 *
 * `answer` covers both question types: a number for OBJECTIVE, a full
 * SavedCodeAnswer (with per-assertion results) for CODE — same shape
 * that's round-tripped through savedAnswers on session load, so a
 * reload restores CODE questions with full fidelity, not just a summary.
 */
export async function answerQuestion(attemptId: string, questionId: string, answer: StoredAnswer) {
  const state = getLocalAttempt(attemptId);
  if (!state) return;

  state.answers[questionId] = answer;
  if (!state.unsyncedQuestionIds.includes(questionId)) state.unsyncedQuestionIds.push(questionId);
  writeLocalAttempt(state);

  try {
    await saveAnswer(state.school, attemptId, questionId, answer);
    const fresh = getLocalAttempt(attemptId);
    if (fresh) {
      fresh.unsyncedQuestionIds = fresh.unsyncedQuestionIds.filter((id) => id !== questionId);
      writeLocalAttempt(fresh);
    }
  } catch {
    // Offline or server unreachable — stays queued, retried by flushUnsyncedAnswers.
  }
}

/** Call on reconnect: pushes every answer the server doesn't have yet. */
export async function flushUnsyncedAnswers(attemptId: string) {
  const state = getLocalAttempt(attemptId);
  if (!state || state.unsyncedQuestionIds.length === 0) return;

  for (const questionId of [...state.unsyncedQuestionIds]) {
    try {
      await saveAnswer(state.school, attemptId, questionId, state.answers[questionId]);
      const fresh = getLocalAttempt(attemptId);
      if (fresh) {
        fresh.unsyncedQuestionIds = fresh.unsyncedQuestionIds.filter((id) => id !== questionId);
        writeLocalAttempt(fresh);
      }
    } catch {
      // still offline — leave it queued, try again next trigger
    }
  }
}

/**
 * Tries to submit for real. If it fails (offline), marks the attempt as
 * locally "done" so the UI can lock the test immediately (the student
 * can't keep answering after time's up just because the network is
 * down) — the actual server submit is retried on reconnect.
 */
export async function submitLocalAttempt(attemptId: string): Promise<{ submitted: boolean; queued: boolean }> {
  const state = getLocalAttempt(attemptId);
  if (!state) return { submitted: false, queued: false };

  await flushUnsyncedAnswers(attemptId);

  try {
    await submitAttempt(state.school, attemptId);
    state.submitted = true;
    writeLocalAttempt(state);
    return { submitted: true, queued: false };
  } catch {
    state.submitted = true; // lock the UI locally regardless
    writeLocalAttempt(state);
    return { submitted: false, queued: true };
  }
}

/** Called on 'online' — retries a queued submit that failed earlier. */
export async function retryQueuedSubmit(attemptId: string): Promise<boolean> {
  const state = getLocalAttempt(attemptId);
  if (!state || !state.submitted) return false;
  await flushUnsyncedAnswers(attemptId);
  try {
    await submitAttempt(state.school, attemptId);
    return true;
  } catch {
    return false;
  }
}

export function clearLocalAttempt(attemptId: string) {
  localStorage.removeItem(key(attemptId));
}