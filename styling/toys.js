// toys.js — live audio spectrogram + camera pseudo-spectrogram

// --- shared color helper ---
// maps 0–255 amplitude to a color in the site's green palette
function ampToColor(v) {
  if (v < 1) return '#000';
  const t = v / 255;
  // black → forest green (#043927) → sage green (#728c69) → white at peaks
  if (t < 0.5) {
    const r = Math.round(4 * t * 2);
    const g = Math.round(57 * t * 2);
    const b = Math.round(39 * t * 2);
    return `rgb(${r},${g},${b})`;
  } else {
    const s = (t - 0.5) * 2; // 0→1 in upper half
    const r = Math.round(4 + (114 - 4) * s);
    const g = Math.round(57 + (140 - 57) * s);
    const b = Math.round(39 + (105 - 39) * s);
    return `rgb(${r},${g},${b})`;
  }
}

// scroll canvas left by 1px and return context
function scrollLeft(canvas, ctx) {
  const img = ctx.getImageData(1, 0, canvas.width - 1, canvas.height);
  ctx.putImageData(img, 0, 0);
  ctx.clearRect(canvas.width - 1, 0, 1, canvas.height);
}

// ─── AUDIO SPECTROGRAM ────────────────────────────────────────────────────────
(function () {
  const canvas = document.getElementById('audio-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const btn = document.getElementById('audio-btn');

  let animId = null;
  let stream = null;
  let audioCtx = null;

  btn.addEventListener('click', async () => {
    if (animId) {
      // stop
      cancelAnimationFrame(animId);
      animId = null;
      stream.getTracks().forEach(t => t.stop());
      audioCtx.close();
      audioCtx = null;
      btn.textContent = 'Start listening';
      return;
    }

    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    } catch (e) {
      alert('Microphone access denied.');
      return;
    }

    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);

    const bins = analyser.frequencyBinCount; // 256
    const data = new Uint8Array(bins);
    const h = canvas.height;
    const w = canvas.width;

    btn.textContent = 'Stop';

    function draw() {
      animId = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(data);
      scrollLeft(canvas, ctx);

      for (let i = 0; i < h; i++) {
        // map canvas row to frequency bin (low freq at bottom)
        const bin = Math.floor((1 - i / h) * bins);
        const v = data[Math.min(bin, bins - 1)];
        ctx.fillStyle = ampToColor(v);
        ctx.fillRect(w - 1, i, 1, 1);
      }
    }
    draw();
  });
})();

// ─── CLAP JUMP (dino game) ────────────────────────────────────────────────────
(function () {
  const canvas = document.getElementById('dino-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const btn = document.getElementById('dino-btn');

  const W = canvas.width;
  const H = canvas.height;
  const GROUND_Y = H - 20;
  const COL_DARK  = '#043927';
  const COL_MID   = '#728c69';
  const COL_BG    = '#f5f5f5';

  // --- character ---
  const CHAR_X = 60;
  const CHAR_W = 16;
  const CHAR_H = 26;
  let charY = GROUND_Y - CHAR_H;
  let velY = 0;
  let onGround = true;
  let legFrame = 0;

  // --- obstacles ---
  let cacti = [];
  let speed = 4;
  let spawnInterval = 1400;
  let lastSpawn = 0;

  // --- scoring ---
  let score = 0;
  let best = 0;
  let frameCount = 0;

  // --- state ---
  let state = 'idle'; // idle | running | dead
  let animId = null;
  let stream = null;
  let audioCtx = null;

  // --- clap detection ---
  let analyser = null;
  let clapData = null;
  let bgEnergy = 0.001;
  let lastClap = 0;

  function detectClap() {
    if (!analyser) return false;
    analyser.getByteTimeDomainData(clapData);
    let rms = 0;
    for (let i = 0; i < clapData.length; i++) {
      const s = (clapData[i] - 128) / 128;
      rms += s * s;
    }
    rms = Math.sqrt(rms / clapData.length);
    bgEnergy = bgEnergy * 0.95 + rms * 0.05;
    const now = performance.now();
    if (rms > bgEnergy * 2.8 && now - lastClap > 350) {
      lastClap = now;
      return true;
    }
    return false;
  }

  function jump() {
    if (onGround) {
      velY = -11;
      onGround = false;
    }
  }

  function spawnCactus(now) {
    if (now - lastSpawn < spawnInterval) return;
    lastSpawn = now;
    const h = 32 + Math.random() * 24;
    const hasArm = Math.random() > 0.4;
    cacti.push({ x: W + 10, w: 14, h, hasArm });
    // gradually speed up
    speed = 4 + Math.min(score / 800, 4);
    spawnInterval = Math.max(800, 1400 - score / 4);
  }

  function drawCharacter() {
    ctx.fillStyle = COL_DARK;
    // body
    ctx.fillRect(CHAR_X, charY + 10, CHAR_W, 16);
    // head
    ctx.fillRect(CHAR_X + 2, charY, CHAR_W - 2, 12);
    // eye
    ctx.fillStyle = COL_BG;
    ctx.fillRect(CHAR_X + CHAR_W - 5, charY + 2, 3, 3);
    ctx.fillStyle = COL_DARK;
    // legs (alternate when running, static when jumping)
    if (onGround) {
      const l = Math.floor(legFrame / 8) % 2;
      ctx.fillRect(CHAR_X + 2,      charY + 26, 5, l === 0 ? 6 : 4);
      ctx.fillRect(CHAR_X + CHAR_W - 7, charY + 26, 5, l === 0 ? 4 : 6);
    } else {
      ctx.fillRect(CHAR_X + 2,      charY + 26, 5, 5);
      ctx.fillRect(CHAR_X + CHAR_W - 7, charY + 26, 5, 5);
    }
  }

  function drawCactus(c) {
    ctx.fillStyle = COL_MID;
    const baseY = GROUND_Y - c.h;
    ctx.fillRect(c.x, baseY, c.w, c.h);
    if (c.hasArm) {
      // left arm
      ctx.fillRect(c.x - 8, baseY + 8, 8, 7);
      ctx.fillRect(c.x - 8, baseY + 2, 5, 8);
    }
  }

  function collides(c) {
    const cx = c.x + 2, cw = c.w - 4;
    const cy = GROUND_Y - c.h, ch = c.h;
    return (
      CHAR_X + 3 < cx + cw &&
      CHAR_X + CHAR_W - 3 > cx &&
      charY + 6 < cy + ch &&
      charY + CHAR_H > cy
    );
  }

  function drawScene(now) {
    // background
    ctx.fillStyle = COL_BG;
    ctx.fillRect(0, 0, W, H);

    // ground
    ctx.fillStyle = COL_DARK;
    ctx.fillRect(0, GROUND_Y, W, 2);

    // cacti
    for (const c of cacti) drawCactus(c);

    // character
    drawCharacter();

    // score
    ctx.fillStyle = COL_DARK;
    ctx.font = '13px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`${Math.floor(score / 10)}`, W - 10, 18);
    if (best > 0) ctx.fillText(`best ${Math.floor(best / 10)}`, W - 10, 34);
    ctx.textAlign = 'left';
  }

  function drawIdle() {
    ctx.fillStyle = COL_BG;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = COL_DARK;
    ctx.fillRect(0, GROUND_Y, W, 2);
    charY = GROUND_Y - CHAR_H;
    drawCharacter();
    ctx.fillStyle = COL_DARK;
    ctx.font = '13px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('click "Start game" to begin', W / 2, H / 2 - 10);
    ctx.textAlign = 'left';
  }

  function drawDead() {
    ctx.fillStyle = 'rgba(245,245,245,0.7)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = COL_DARK;
    ctx.font = 'bold 15px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('game over', W / 2, H / 2 - 14);
    ctx.font = '12px monospace';
    ctx.fillText(`score: ${Math.floor(score / 10)}`, W / 2, H / 2 + 4);
    ctx.fillText('clap or press space to restart', W / 2, H / 2 + 22);
    ctx.textAlign = 'left';
  }

  function resetGame() {
    charY = GROUND_Y - CHAR_H;
    velY = 0;
    onGround = true;
    cacti = [];
    speed = 4;
    spawnInterval = 1400;
    lastSpawn = 0;
    score = 0;
    frameCount = 0;
    legFrame = 0;
    state = 'running';
  }

  function loop(now) {
    animId = requestAnimationFrame(loop);
    const clapped = detectClap();

    if (state === 'running') {
      frameCount++;
      score++;
      legFrame++;

      if (clapped) jump();

      // physics
      velY += 0.6;
      charY += velY;
      if (charY >= GROUND_Y - CHAR_H) {
        charY = GROUND_Y - CHAR_H;
        velY = 0;
        onGround = true;
      }

      // spawn & move obstacles
      spawnCactus(now);
      for (const c of cacti) c.x -= speed;
      cacti = cacti.filter(c => c.x + c.w + 20 > 0);

      // collision
      if (cacti.some(collides)) {
        state = 'dead';
        if (score > best) best = score;
      }

      drawScene(now);
    } else if (state === 'dead') {
      drawScene(now);
      drawDead();
      if (clapped) resetGame();
    }
  }

  // keyboard fallback
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      if (state === 'running') jump();
      else if (state === 'dead') resetGame();
    }
  });

  btn.addEventListener('click', async () => {
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
      if (stream) stream.getTracks().forEach(t => t.stop());
      if (audioCtx) { audioCtx.close(); audioCtx = null; }
      state = 'idle';
      btn.textContent = 'Start game';
      drawIdle();
      return;
    }

    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      clapData = new Uint8Array(analyser.fftSize);
    } catch (e) {
      // mic denied — game still works with spacebar
      analyser = null;
    }

    resetGame();
    btn.textContent = 'Stop game';
    requestAnimationFrame(loop);
  });

  drawIdle();
})();

// ─── CAMERA PSEUDO-SPECTROGRAM ────────────────────────────────────────────────
(function () {
  const canvas = document.getElementById('camera-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const btn = document.getElementById('camera-btn');

  // hidden elements for video processing
  const video = document.createElement('video');
  video.autoplay = true;
  video.playsInline = true;

  const scratch = document.createElement('canvas');
  const sCtx = scratch.getContext('2d', { willReadFrequently: true });

  let animId = null;
  let stream = null;

  btn.addEventListener('click', async () => {
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
      stream.getTracks().forEach(t => t.stop());
      btn.textContent = 'Start camera';
      return;
    }

    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    } catch (e) {
      alert('Camera access denied.');
      return;
    }

    video.srcObject = stream;
    await video.play();

    const h = canvas.height;
    const w = canvas.width;
    scratch.width = h;   // use canvas height as scratch width (portrait strip)
    scratch.height = h;

    btn.textContent = 'Stop';

    function draw() {
      animId = requestAnimationFrame(draw);
      if (video.readyState < 2) return;

      // draw a narrow strip from the center of the video onto the scratch canvas
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      sCtx.drawImage(video, vw / 2 - h / 2, 0, h, vh, 0, 0, h, h);

      const pixels = sCtx.getImageData(0, 0, h, h).data;
      scrollLeft(canvas, ctx);

      for (let row = 0; row < h; row++) {
        // average luminance across the row
        let sum = 0;
        for (let col = 0; col < h; col++) {
          const idx = (row * h + col) * 4;
          // perceptual luminance weights
          sum += 0.299 * pixels[idx] + 0.587 * pixels[idx + 1] + 0.114 * pixels[idx + 2];
        }
        const lum = Math.round(sum / h);
        ctx.fillStyle = ampToColor(lum);
        ctx.fillRect(w - 1, row, 1, 1);
      }
    }
    draw();
  });
})();
