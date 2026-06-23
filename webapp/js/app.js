'use strict';

// ── Frequency data ────────────────────────────────────────────────────────────

const FREQUENCIES = [
  { frq: 20,    displayAs: '20'    },
  { frq: 25,    displayAs: '25'    },
  { frq: 31.5,  displayAs: '31.5'  },
  { frq: 40,    displayAs: '40'    },
  { frq: 50,    displayAs: '50'    },
  { frq: 63,    displayAs: '63'    },
  { frq: 80,    displayAs: '80'    },
  { frq: 100,   displayAs: '100'   },
  { frq: 125,   displayAs: '125'   },
  { frq: 160,   displayAs: '160'   },
  { frq: 200,   displayAs: '200'   },
  { frq: 250,   displayAs: '250'   },
  { frq: 315,   displayAs: '315'   },
  { frq: 400,   displayAs: '400'   },
  { frq: 500,   displayAs: '500'   },
  { frq: 630,   displayAs: '630'   },
  { frq: 800,   displayAs: '800'   },
  { frq: 1000,  displayAs: '1k'    },
  { frq: 1250,  displayAs: '1.25k' },
  { frq: 1600,  displayAs: '1.6k'  },
  { frq: 2000,  displayAs: '2k'    },
  { frq: 2500,  displayAs: '2.5k'  },
  { frq: 3150,  displayAs: '3.15k' },
  { frq: 4000,  displayAs: '4k'    },
  { frq: 5000,  displayAs: '5k'    },
  { frq: 6300,  displayAs: '6.3k'  },
  { frq: 8000,  displayAs: '8k'    },
  { frq: 10000, displayAs: '10k'   },
  { frq: 12500, displayAs: '12.5k' },
  { frq: 16000, displayAs: '16k'   },
  { frq: 20000, displayAs: '20k'   },
];

// ── App state ─────────────────────────────────────────────────────────────────

const state = {
  mode: 'explore',

  volume: 0.33,

  exploreDuration: 1.0,

  guessDuration: 1.0,
  guessTargetIdx: null,
  // idle | playing | waiting | answered
  guessPhase: 'idle',

  compNumTests: 20,
  compDuration: 1.0,
  // setup | playing | waiting | feedback | done
  compPhase: 'setup',
  compCurrentTest: 0,
  compTargetIdx: null,
  compResults: [],
  compTotalStart: null,
  compTotalEnd: null,
  compQuestionStart: null,
  compTimerInterval: null,
};

// ── Audio engine ──────────────────────────────────────────────────────────────

let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playFrequency(freq, duration) {
  const ctx = getAudioCtx();
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  const fade = Math.min(0.06, duration * 0.08);

  osc.type = 'sine';
  osc.frequency.value = freq;

  const vol = state.volume;
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + fade);
  gain.gain.setValueAtTime(vol, ctx.currentTime + duration - fade);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);

  return new Promise(resolve => { osc.onended = resolve; });
}

// ── DOM helpers ───────────────────────────────────────────────────────────────

function el(id) { return document.getElementById(id); }
function qs(sel, ctx = document) { return ctx.querySelector(sel); }
function qsa(sel, ctx = document) { return [...ctx.querySelectorAll(sel)]; }

function clearBandStates(...classes) {
  qsa('.eq-band').forEach(b => b.classList.remove(...classes));
}

function getBand(idx) {
  return qs(`.eq-band[data-idx="${idx}"]`);
}

function setEqDisabled(disabled) {
  el('eq-bands').classList.toggle('disabled', disabled);
}

function fmtSec(ms) {
  return `${(ms / 1000).toFixed(2)}s`;
}

// ── EQ init ───────────────────────────────────────────────────────────────────

function initEQ() {
  const container = el('eq-bands');
  FREQUENCIES.forEach((f, idx) => {
    const band = document.createElement('div');
    band.className = 'eq-band';
    band.dataset.idx = idx;
    band.setAttribute('role', 'button');
    band.setAttribute('tabindex', '0');
    band.setAttribute('aria-label', `${f.displayAs} Hz`);
    band.innerHTML = `<div class="eq-bar"><div class="eq-fill"></div></div><span class="eq-label">${f.displayAs}</span>`;
    band.addEventListener('click', () => handleBandClick(idx));
    band.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleBandClick(idx); }
    });
    container.appendChild(band);
  });
}

// ── Mode switching ────────────────────────────────────────────────────────────

function setMode(mode) {
  if (state.compTimerInterval) {
    clearInterval(state.compTimerInterval);
    state.compTimerInterval = null;
  }

  state.mode = mode;
  state.guessPhase = 'idle';
  state.compPhase = 'setup';

  qsa('.tab-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.mode === mode));
  qsa('.mode-panel').forEach(p => p.classList.remove('active'));
  el(`panel-${mode}`).classList.add('active');

  clearBandStates('playing', 'correct', 'wrong', 'reveal');
  setEqDisabled(false);

  if (mode === 'guess') {
    el('guess-status').textContent = '';
    el('guess-status').className = 'status-box';
    el('guess-replay').disabled = true;
  }

  if (mode === 'competition') {
    el('comp-setup').classList.remove('hidden');
    el('comp-progress').classList.add('hidden');
    el('comp-status').textContent = '';
    el('comp-status').className = 'status-box';
  }
}

// ── Band click dispatch ───────────────────────────────────────────────────────

function handleBandClick(idx) {
  if (state.mode === 'explore')     exploreBandClick(idx);
  else if (state.mode === 'guess')  guessBandClick(idx);
  else if (state.mode === 'competition') compBandClick(idx);
}

// ── Explore mode ──────────────────────────────────────────────────────────────

function exploreBandClick(idx) {
  if (el('eq-bands').classList.contains('disabled')) return;

  clearBandStates('playing');
  getBand(idx).classList.add('playing');
  setEqDisabled(true);

  playFrequency(FREQUENCIES[idx].frq, state.exploreDuration).then(() => {
    getBand(idx).classList.remove('playing');
    setEqDisabled(false);
  });
}

// ── Guess mode ────────────────────────────────────────────────────────────────

function guessPlay() {
  if (state.guessPhase === 'playing') return;

  state.guessPhase = 'playing';
  state.guessTargetIdx = randomIdx();

  clearBandStates('playing', 'correct', 'wrong', 'reveal');
  el('guess-status').textContent = '';
  el('guess-status').className = 'status-box';
  el('guess-play').disabled = true;
  el('guess-replay').disabled = true;
  setEqDisabled(true);

  playFrequency(FREQUENCIES[state.guessTargetIdx].frq, state.guessDuration).then(() => {
    state.guessPhase = 'waiting';
    setEqDisabled(false);
    el('guess-replay').disabled = false;
    el('guess-status').textContent = 'Which frequency was that?';
  });
}

function guessBandClick(idx) {
  if (state.guessPhase !== 'waiting') return;

  state.guessPhase = 'answered';
  setEqDisabled(true);

  const correct = idx === state.guessTargetIdx;
  const status = el('guess-status');

  if (correct) {
    getBand(idx).classList.add('correct');
    status.textContent = `Correct! That was ${FREQUENCIES[idx].displayAs} Hz.`;
    status.className = 'status-box correct';
  } else {
    getBand(idx).classList.add('wrong');
    getBand(state.guessTargetIdx).classList.add('reveal');
    status.textContent = `Wrong — you picked ${FREQUENCIES[idx].displayAs} Hz, it was ${FREQUENCIES[state.guessTargetIdx].displayAs} Hz.`;
    status.className = 'status-box wrong';
  }

  el('guess-replay').disabled = true;
  el('guess-play').disabled = false;
}


// ── Competition mode ──────────────────────────────────────────────────────────

function compStart() {
  state.compPhase   = 'playing';
  state.compCurrentTest = 0;
  state.compResults = [];
  state.compTotalStart = performance.now();

  el('comp-setup').classList.add('hidden');
  el('comp-progress').classList.remove('hidden');

  state.compTimerInterval = setInterval(() => {
    if (!state.compTotalStart) return;
    const elapsed = performance.now() - state.compTotalStart;
    el('comp-total-time').textContent = `${(elapsed / 1000).toFixed(1)}s`;
  }, 100);

  updateCompUI();
  playNextQuestion();
}

function playNextQuestion() {
  state.compCurrentTest++;
  state.compTargetIdx = randomIdx();
  state.compPhase = 'playing';

  clearBandStates('playing', 'correct', 'wrong', 'reveal');
  el('comp-status').textContent = '';
  el('comp-status').className = 'status-box';
  el('comp-replay').disabled = true;
  setEqDisabled(true);
  updateCompUI();

  playFrequency(FREQUENCIES[state.compTargetIdx].frq, state.compDuration).then(() => {
    state.compPhase = 'waiting';
    state.compQuestionStart = performance.now();
    setEqDisabled(false);
    el('comp-replay').disabled = false;
  });
}

function compReplay() {
  if (state.compPhase !== 'waiting') return;

  setEqDisabled(true);
  el('comp-replay').disabled = true;

  playFrequency(FREQUENCIES[state.compTargetIdx].frq, state.compDuration).then(() => {
    setEqDisabled(false);
    el('comp-replay').disabled = false;
  });
}

function compBandClick(idx) {
  if (state.compPhase !== 'waiting') return;

  const timeMs = Math.round(performance.now() - state.compQuestionStart);
  const correct = idx === state.compTargetIdx;

  state.compResults.push({ targetIdx: state.compTargetIdx, guessIdx: idx, correct, timeMs });
  state.compPhase = 'feedback';
  setEqDisabled(true);
  el('comp-replay').disabled = true;

  const status = el('comp-status');

  if (correct) {
    getBand(idx).classList.add('correct');
    status.textContent = `✓  ${FREQUENCIES[idx].displayAs} Hz — ${fmtSec(timeMs)}`;
    status.className = 'status-box correct';
  } else {
    getBand(idx).classList.add('wrong');
    getBand(state.compTargetIdx).classList.add('reveal');
    status.textContent = `✗  Picked ${FREQUENCIES[idx].displayAs} Hz — was ${FREQUENCIES[state.compTargetIdx].displayAs} Hz — ${fmtSec(timeMs)}`;
    status.className = 'status-box wrong';
  }

  updateCompUI();

  const done = state.compCurrentTest >= state.compNumTests;
  setTimeout(() => done ? compFinish() : playNextQuestion(), 1400);
}

function compFinish() {
  clearInterval(state.compTimerInterval);
  state.compTimerInterval = null;
  state.compTotalEnd = performance.now();
  state.compPhase = 'done';

  clearBandStates('playing', 'correct', 'wrong', 'reveal');
  setEqDisabled(true);
  showResults();
}

function updateCompUI() {
  el('comp-q-num').textContent   = state.compCurrentTest;
  el('comp-q-total').textContent = state.compNumTests;
  el('comp-correct').textContent = state.compResults.filter(r => r.correct).length;
  el('comp-wrong').textContent   = state.compResults.filter(r => !r.correct).length;
}

// ── Results ───────────────────────────────────────────────────────────────────

function median(arr) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? (s[m - 1] + s[m]) / 2 : s[m];
}

function showResults() {
  const r      = state.compResults;
  const totalMs = Math.round(state.compTotalEnd - state.compTotalStart);
  const correct = r.filter(x => x.correct).length;
  const wrong   = r.filter(x => !x.correct).length;
  const times   = r.map(x => x.timeMs);
  const avgMs   = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
  const medMs   = Math.round(median(times));
  const pct     = Math.round((correct / r.length) * 100);

  el('results-content').innerHTML = `
    <div class="results-grid">
      <div class="result-stat good">
        <div class="value">${correct}</div>
        <div class="label">Correct</div>
      </div>
      <div class="result-stat bad">
        <div class="value">${wrong}</div>
        <div class="label">Wrong</div>
      </div>
      <div class="result-stat">
        <div class="value">${pct}%</div>
        <div class="label">Accuracy</div>
      </div>
      <div class="result-stat">
        <div class="value">${(totalMs / 1000).toFixed(1)}s</div>
        <div class="label">Total Time</div>
      </div>
      <div class="result-stat">
        <div class="value">${fmtSec(avgMs)}</div>
        <div class="label">Avg per Question</div>
      </div>
      <div class="result-stat">
        <div class="value">${fmtSec(medMs)}</div>
        <div class="label">Median per Question</div>
      </div>
    </div>
  `;

  el('results-modal').classList.remove('hidden');
}

// ── Utility ───────────────────────────────────────────────────────────────────

function randomIdx() {
  return Math.floor(Math.random() * FREQUENCIES.length);
}

// ── Init ──────────────────────────────────────────────────────────────────────

function init() {
  initEQ();

  // Volume
  el('volume').addEventListener('input', e => {
    state.volume = parseFloat(e.target.value);
    el('volume-val').textContent = `${Math.round(state.volume * 100)}%`;
  });

  // Mode tabs
  qsa('.tab-btn').forEach(btn => btn.addEventListener('click', () => setMode(btn.dataset.mode)));

  // Explore duration slider
  el('explore-duration').addEventListener('input', e => {
    state.exploreDuration = parseFloat(e.target.value);
    el('explore-duration-val').textContent = `${parseFloat(e.target.value).toFixed(1)}s`;
  });

  // Guess
  el('guess-duration').addEventListener('input', e => {
    state.guessDuration = parseFloat(e.target.value);
    el('guess-duration-val').textContent = `${parseFloat(e.target.value).toFixed(1)}s`;
  });
  el('guess-play').addEventListener('click', guessPlay);
  el('guess-replay').addEventListener('click', guessPlay);

  // Competition sliders
  el('comp-count').addEventListener('input', e => {
    state.compNumTests = parseInt(e.target.value, 10);
    el('comp-count-val').textContent = e.target.value;
  });
  el('comp-duration').addEventListener('input', e => {
    state.compDuration = parseFloat(e.target.value);
    el('comp-duration-val').textContent = `${parseFloat(e.target.value).toFixed(1)}s`;
  });
  el('comp-start').addEventListener('click', compStart);
  el('comp-replay').addEventListener('click', compReplay);

  // Results modal close → reset competition to setup
  el('results-close').addEventListener('click', () => {
    el('results-modal').classList.add('hidden');
    state.compPhase = 'setup';
    state.compCurrentTest = 0;
    state.compResults = [];
    el('comp-setup').classList.remove('hidden');
    el('comp-progress').classList.add('hidden');
    el('comp-status').textContent = '';
    el('comp-status').className = 'status-box';
    clearBandStates('playing', 'correct', 'wrong', 'reveal');
    setEqDisabled(false);
  });
}

document.addEventListener('DOMContentLoaded', init);
