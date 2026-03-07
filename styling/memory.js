// memory.js — auditory recognition memory + Simon sequence game

// ─── SHARED UTILITIES ─────────────────────────────────────────────────────────

let _audioCtx = null;
function getAudioCtx() {
  if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (_audioCtx.state === 'suspended') _audioCtx.resume();
  return _audioCtx;
}

// Resolve a Wikimedia Commons filename → direct CDN URL via the MediaWiki API
async function resolveWikimediaURL(filename) {
  const enc = encodeURIComponent(filename);
  const api = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${enc}&prop=imageinfo&iiprop=url&format=json&origin=*`;
  const resp = await Promise.race([
    fetch(api),
    new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 6000))
  ]);
  const data = await resp.json();
  const page = Object.values(data.query.pages)[0];
  if ('missing' in page) throw new Error('file not found on Commons');
  return page.imageinfo[0].url;
}

async function loadBuffer(audioCtx, url) {
  const resp = await Promise.race([
    fetch(url),
    new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 10000))
  ]);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return audioCtx.decodeAudioData(await resp.arrayBuffer());
}

// Trim an AudioBuffer to maxSecs with a 100ms fade-out to avoid clicks
function trimBuffer(audioCtx, buf, maxSecs) {
  const sr = buf.sampleRate;
  const maxFrames = Math.min(buf.length, Math.round(sr * maxSecs));
  const fadeFrames = Math.min(Math.round(sr * 0.1), maxFrames);
  const out = audioCtx.createBuffer(buf.numberOfChannels, maxFrames, sr);
  for (let c = 0; c < buf.numberOfChannels; c++) {
    const src = buf.getChannelData(c).slice(0, maxFrames);
    for (let i = 0; i < fadeFrames; i++) src[maxFrames - 1 - i] *= i / fadeFrames;
    out.copyToChannel(src, c);
  }
  return out;
}

// Synthesize a piano-like decaying tone as fallback
function makeSynthBuf(audioCtx, freq, duration) {
  const sr = audioCtx.sampleRate;
  const len = Math.round(sr * duration);
  const buf = audioCtx.createBuffer(1, len, sr);
  const d = buf.getChannelData(0);
  const k = 4 / duration;
  for (let i = 0; i < len; i++) {
    const t = i / sr;
    const env = Math.exp(-k * t);
    d[i] = env * 0.32 * (
      Math.sin(2 * Math.PI * freq * t) +
      0.5  * Math.sin(4 * Math.PI * freq * t) +
      0.15 * Math.sin(6 * Math.PI * freq * t)
    );
  }
  return buf;
}

function playBuf(audioCtx, buf) {
  return new Promise(res => {
    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    src.connect(audioCtx.destination);
    src.onended = res;
    src.start();
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Peter Acklam's rational approximation for the inverse normal CDF (probit)
function probit(p) {
  const a = [-3.969683028665376e+01,  2.209460984245205e+02, -2.759285104469687e+02,
              1.383577518672690e+02, -3.066479806614716e+01,  2.506628277459239e+00];
  const b = [-5.447609879822406e+01,  1.615858368580409e+02, -1.556989798598866e+02,
              6.680131188771972e+01, -1.328068155288572e+01];
  const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00,
             -2.549732539343734e+00,  4.374664141464968e+00,  2.938163982698783e+00];
  const d = [ 7.784695709041462e-03,  3.224671290700398e-01,  2.445134137142996e+00,
              3.754408661907416e+00];
  p = Math.max(1e-7, Math.min(1 - 1e-7, p));
  const plo = 0.02425, phi = 1 - plo;
  if (p < plo) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) /
           ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
  } else if (p <= phi) {
    const q = p - 0.5, r = q * q;
    return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q /
           (((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1);
  } else {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) /
            ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
  }
}

// ─── RECOGNITION MEMORY ───────────────────────────────────────────────────────
(function () {
  const container = document.getElementById('recog-container');
  if (!container) return;

  // 12 sounds: confirmed Wikimedia Commons CDN URLs (CORS-friendly)
  // maxDur: trim long files to this many seconds; synthFreq: fallback pitch
  const POOL = [
    { id:  1, label: 'cat',       url:  'https://upload.wikimedia.org/wikipedia/commons/a/a6/Meow.ogg',                                          maxDur: 2.0, synthFreq: 1047 },
    { id:  2, label: 'dog',       url:  'https://upload.wikimedia.org/wikipedia/commons/a/a6/Barking_of_a_dog.ogg',                              maxDur: 2.6, synthFreq:  220 },
    { id:  3, label: 'bird',      url:  'https://upload.wikimedia.org/wikipedia/commons/9/9d/Budgerigar_chirping.ogg',                           maxDur: 2.5, synthFreq: 2600 },
    { id:  4, label: 'guitar',    url:  'https://upload.wikimedia.org/wikipedia/commons/7/7b/G_chord.ogg',                                       maxDur: 2.0, synthFreq:  196 },
    { id:  5, label: 'piano',     url:  'https://upload.wikimedia.org/wikipedia/commons/b/b9/Piano-C-major-chord.ogg',                           maxDur: 2.0, synthFreq:  262 },
    { id:  6, label: 'bell',      url:  'https://upload.wikimedia.org/wikipedia/commons/f/f7/Gong_or_bell_vibrant_%28short%29.ogg',              maxDur: 3.5, synthFreq:  440 },
    { id:  7, label: 'rain',      url:  'https://upload.wikimedia.org/wikipedia/commons/a/ad/Rain.ogg',                                          maxDur: 3.0, synthFreq:  350 },
    { id:  8, label: 'flute',     url:  'https://upload.wikimedia.org/wikipedia/commons/d/d4/Flute.ogg',                                         maxDur: 2.5, synthFreq:  523 },
    { id:  9, label: 'snare',     url:  'https://upload.wikimedia.org/wikipedia/commons/b/b2/Snare_drum_unmuffled.ogg',                          maxDur: 2.5, synthFreq:  200 },
    { id: 10, label: 'applause',  url:  'https://upload.wikimedia.org/wikipedia/commons/8/8e/Applause.ogg',                                      maxDur: 2.5, synthFreq:  800 },
    { id: 11, label: 'trumpet',   url:  'https://upload.wikimedia.org/wikipedia/commons/9/94/02._B3-flat-trumpet.ogg',                           maxDur: 2.5, synthFreq:  466 },
    { id: 12, label: 'cow',       file: 'Cow_moo.ogg',                                                                                           maxDur: 2.0, synthFreq:  147 },
  ];

  const N = 6;
  const buffers = new Map();
  let synthCount = 0;
  let targets = [], testOrder = [], responses = {};

  function paint(html) { container.innerHTML = html; }

  async function getBuffer(sound) {
    if (buffers.has(sound.id)) return buffers.get(sound.id);
    const ctx = getAudioCtx();
    const maxDur = sound.maxDur || 2.5;
    let buf;
    try {
      // prefer direct URL; fall back to Wikimedia API resolution
      const url = sound.url || await resolveWikimediaURL(sound.file);
      buf = trimBuffer(ctx, await loadBuffer(ctx, url), maxDur);
    } catch (_) {
      buf = makeSynthBuf(ctx, sound.synthFreq, maxDur);
      synthCount++;
    }
    buffers.set(sound.id, buf);
    return buf;
  }

  async function preload() {
    paint(`<div class="mem-status">loading sounds from the internet…</div>`);
    await Promise.all(POOL.map(getBuffer));
    const note = synthCount > 0
      ? `<p class="mem-note">${synthCount} sound(s) used synthesized tones as fallback.</p>`
      : `<p class="mem-note">all sounds loaded.</p>`;
    paint(`
      <p class="mem-desc">you'll hear <strong>${N} sounds</strong> in the study phase.<br>
      then all 12 play in random order — decide if each one was in the study set.</p>
      ${note}
      <button class="mem-action-btn" id="recog-go">Begin study phase &rarr;</button>
    `);
    document.getElementById('recog-go').addEventListener('click', runStudy);
  }

  async function runStudy() {
    targets = shuffle(POOL).slice(0, N);
    for (let i = 0; i < targets.length; i++) {
      const s = targets[i];
      paint(`
        <div class="mem-phase-label">study &mdash; ${i + 1} / ${N}</div>
        <div class="mem-sound-display">${s.label}</div>
        <div class="mem-status">&#9834; playing&hellip;</div>
      `);
      await playBuf(getAudioCtx(), await getBuffer(s));
      await sleep(700);
    }
    paint(`<div class="mem-status">get ready for the test&hellip;</div>`);
    await sleep(2000);
    await runTest();
  }

  async function runTest() {
    const distractors = POOL.filter(s => !targets.includes(s));
    testOrder = shuffle([...targets, ...distractors]);
    responses = {};

    for (let i = 0; i < testOrder.length; i++) {
      const s = testOrder[i];
      paint(`
        <div class="mem-phase-label">test &mdash; ${i + 1} / ${testOrder.length}</div>
        <div class="mem-status">&#9834; listen&hellip;</div>
      `);
      await playBuf(getAudioCtx(), await getBuffer(s));

      await new Promise(resolve => {
        paint(`
          <div class="mem-phase-label">test &mdash; ${i + 1} / ${testOrder.length}</div>
          <p class="mem-question">did you hear this sound in the study phase?</p>
          <div class="mem-response-row">
            <button class="mem-btn-yes" id="r-old">&#10003;&nbsp; heard it before</button>
            <button class="mem-btn-no"  id="r-new">&#10005;&nbsp; new sound</button>
          </div>
        `);
        document.getElementById('r-old').addEventListener('click', () => { responses[s.id] = 'old'; resolve(); });
        document.getElementById('r-new').addEventListener('click', () => { responses[s.id] = 'new'; resolve(); });
      });
      await sleep(350);
    }
    showResults();
  }

  function showResults() {
    const targetIds = new Set(targets.map(s => s.id));
    let hits = 0, fa = 0;
    for (const s of testOrder) {
      if (targetIds.has(s.id)  && responses[s.id] === 'old') hits++;
      if (!targetIds.has(s.id) && responses[s.id] === 'old') fa++;
    }

    // Log-linear correction for extreme hit/FA rates
    const hc = (hits + 0.5) / (N + 1);
    const fc = (fa  + 0.5) / (N + 1);
    const dp   = (probit(hc) - probit(fc)).toFixed(2);
    const crit = (-0.5 * (probit(hc) + probit(fc))).toFixed(2);

    const dpLabel   = dp >= 2.5 ? 'excellent' : dp >= 1.5 ? 'good' : dp >= 0.5 ? 'fair' : 'near chance';
    const biasLabel = crit < -0.1 ? 'liberal (tend to say "old")' : crit > 0.1 ? 'conservative (tend to say "new")' : 'neutral';

    paint(`
      <div class="mem-phase-label">results</div>
      <table class="mem-table">
        <tr><td>hits</td>          <td>${hits} / ${N} (${Math.round(hits/N*100)}%)</td></tr>
        <tr><td>false alarms</td>  <td>${fa} / ${N} (${Math.round(fa/N*100)}%)</td></tr>
        <tr><td>d&prime;</td>      <td><strong>${dp}</strong> &mdash; ${dpLabel}</td></tr>
        <tr><td>criterion c</td>   <td>${crit} &mdash; ${biasLabel}</td></tr>
      </table>
      <p class="mem-note">
        d&prime; measures sensitivity: 0 = chance, 1 = decent, 2+ = good, 3+ = excellent.<br>
        c = response bias (positive = conservative, negative = liberal).
      </p>
      <button class="mem-action-btn" id="recog-again">Try again</button>
    `);
    document.getElementById('recog-again').addEventListener('click', () => {
      buffers.clear();
      synthCount = 0;
      preload();
    });
  }

  preload();
})();

// ─── SIMON SEQUENCE MEMORY ────────────────────────────────────────────────────
(function () {
  const container = document.getElementById('simon-container');
  if (!container) return;

  const TONES = [
    { color: '#8b2020', activeColor: '#e84040', freq: 261.63 }, // C4 — red
    { color: '#043927', activeColor: '#27ae60', freq: 329.63 }, // E4 — green
    { color: '#7a6200', activeColor: '#f0c040', freq: 392.00 }, // G4 — yellow
    { color: '#1a3570', activeColor: '#3a7bd5', freq: 493.88 }, // B4 — blue
  ];

  // Build DOM
  const grid = document.createElement('div');
  grid.className = 'simon-grid';

  const btns = TONES.map((t, i) => {
    const b = document.createElement('button');
    b.className = 'simon-btn';
    b.style.background = t.color;
    b.dataset.idx = i;
    b.disabled = true;
    grid.appendChild(b);
    return b;
  });

  const statusEl = document.createElement('div');
  statusEl.className = 'simon-status';
  statusEl.textContent = 'press start';

  const scoreEl = document.createElement('div');
  scoreEl.className = 'simon-score';

  const startBtn = document.createElement('button');
  startBtn.className = 'mem-action-btn';
  startBtn.textContent = 'Start';

  container.append(grid, statusEl, scoreEl, startBtn);

  let sequence = [], playerIdx = 0, accepting = false, best = 0;

  function setStatus(t) { statusEl.textContent = t; }
  function setScore(len) {
    scoreEl.textContent = len > 0 ? `level ${len}${best > 0 ? ' — best ' + best : ''}` : '';
  }
  function setAccepting(v) {
    accepting = v;
    btns.forEach(b => b.disabled = !v);
  }

  function playTone(idx, duration) {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = TONES[idx].freq;
    gain.gain.setValueAtTime(0.55, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (duration / 1000));
    osc.start();
    osc.stop(ctx.currentTime + (duration / 1000) + 0.05);
  }

  async function flashBtn(idx, ms) {
    btns[idx].style.background = TONES[idx].activeColor;
    playTone(idx, ms);
    await sleep(ms);
    btns[idx].style.background = TONES[idx].color;
  }

  async function playSequence() {
    setAccepting(false);
    setStatus('watch…');
    await sleep(600);
    for (const idx of sequence) {
      await flashBtn(idx, 400);
      await sleep(120);
    }
    setStatus('your turn!');
    playerIdx = 0;
    setAccepting(true);
  }

  async function startGame() {
    sequence = [];
    startBtn.textContent = 'Restart';
    setScore(0);
    await nextRound();
  }

  async function nextRound() {
    sequence.push(Math.floor(Math.random() * 4));
    setScore(sequence.length);
    await playSequence();
  }

  async function onPlayerClick(idx) {
    if (!accepting) return;
    await flashBtn(idx, 200);

    if (idx !== sequence[playerIdx]) {
      // wrong answer
      setAccepting(false);
      if (sequence.length - 1 > best) best = sequence.length - 1;
      setStatus(`wrong! you got ${sequence.length - 1} right`);
      setScore(0);
      // flash all red
      for (let r = 0; r < 3; r++) {
        btns.forEach(b => b.style.background = '#c0392b');
        await sleep(140);
        btns.forEach((b, i) => b.style.background = TONES[i].color);
        await sleep(100);
      }
      setStatus(`level ${sequence.length - 1} — best ${best} — press restart`);
      return;
    }

    playerIdx++;
    if (playerIdx === sequence.length) {
      setAccepting(false);
      setStatus(`level ${sequence.length} ✓ — get ready…`);
      await sleep(900);
      await nextRound();
    }
  }

  btns.forEach((b, i) => b.addEventListener('click', () => onPlayerClick(i)));
  startBtn.addEventListener('click', startGame);
})();
