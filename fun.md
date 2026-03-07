---
layout: default
title: fun
permalink: /fun/
toys: true
memory: true
---

<div class="content-narrow content-block" markdown="1">

## little interactive things

some fun on the browser..., mostly audio/visual. they use your microphone or camera and nothing leaves your device.

</div>

<div class="content-narrow content-block">

  <h3>live spectrogram</h3>
  <p>your microphone → frequency over time. low frequencies at the bottom, high at the top. color intensity = amplitude.</p>

  <div class="toy-widget">
    <canvas id="audio-canvas" width="600" height="200"></canvas>
    <br>
    <button id="audio-btn">Start listening</button>
  </div>

</div>

<div class="content-narrow content-block">

  <h3>camera pseudo-spectrogram</h3>
  <p>your webcam feed, rendered as a scrolling spectrogram. each column is one video frame; each row maps to a horizontal strip of the image, colored by brightness. move around and watch the pattern change.</p>

  <div class="toy-widget">
    <canvas id="camera-canvas" width="600" height="200"></canvas>
    <br>
    <button id="camera-btn">Start camera</button>
  </div>

</div>

<div class="content-narrow content-block">

  <h3>clap jump</h3>
  <p>clap to jump. dodge the cacti. spacebar also works if you don't have a mic.</p>

  <div class="toy-widget">
    <canvas id="dino-canvas" width="600" height="150"></canvas>
    <br>
    <button id="dino-btn">Start game</button>
  </div>

</div>

<div class="content-narrow content-block">

  <h3>auditory recognition memory</h3>
  <p>hear 6 sounds in the study phase, then judge all 12 as old or new. you'll get d&prime; at the end &mdash; the same sensitivity measure used in real memory research.</p>

  <div class="memory-game" id="recog-container"></div>

</div>

<div class="content-narrow content-block">

  <h3>sequence memory</h3>
  <p>watch the pattern of lights and tones, then repeat it back in order. how long a sequence can you hold?</p>

  <div class="memory-game" id="simon-container"></div>

</div>
