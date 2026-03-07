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
