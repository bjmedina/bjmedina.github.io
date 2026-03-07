---
layout: default
title: fun
permalink: /fun/
toys: true
---

<div class="content-narrow content-block" markdown="1">

## little interactive things

some browser toys, mostly audio/visual. they use your microphone or camera and nothing leaves your device.

</div>

<div class="content-narrow content-block">

  <h3>live spectrogram</h3>
  <p>your microphone → frequency over time. low frequencies at the bottom, high at the top. color intensity = amplitude.</p>

  <div class="toy-widget">
    <canvas id="audio-canvas" width="600" height="200"></canvas>
    <br>
    <button id="audio-btn">Start listening</button>
    <p class="note">requires microphone permission &mdash; audio is processed locally, not sent anywhere.</p>
  </div>

</div>

<div class="content-narrow content-block">

  <h3>camera pseudo-spectrogram</h3>
  <p>your webcam feed, rendered as a scrolling spectrogram. each column is one video frame; each row maps to a horizontal strip of the image, colored by brightness. move around and watch the pattern change.</p>

  <div class="toy-widget">
    <canvas id="camera-canvas" width="600" height="200"></canvas>
    <br>
    <button id="camera-btn">Start camera</button>
    <p class="note">requires camera permission &mdash; video is processed locally, not sent anywhere.</p>
  </div>

</div>

<div class="content-narrow content-block">

  <h3>clap jump</h3>
  <p>clap to jump. dodge the cacti. spacebar also works if you don't have a mic.</p>

  <div class="toy-widget">
    <canvas id="dino-canvas" width="600" height="150"></canvas>
    <br>
    <button id="dino-btn">Start game</button>
    <p class="note">requires microphone &mdash; clap detection runs locally, nothing is sent anywhere.</p>
  </div>

</div>
