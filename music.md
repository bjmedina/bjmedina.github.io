---
layout: default
title: music
permalink: /music/
---

<div class="content-narrow content-block" markdown="1">

## saxophone

a small collection of performances. mostly alto. some bass too. fill is rotating.

</div>

<div class="content-narrow content-block">

  <h3>performances</h3>

  <!--
    add a new performance by copying one of the blocks below.
    - youtube: replace VIDEO_ID with the part after "v=" in the url
    - local file: drop the file into /images/music/ (or wherever) and update src
    delete the unused block.
  -->

  <div class="performance">
    <div class="performance-media">
      <iframe
        src="https://www.youtube.com/embed/VIDEO_ID"
        title="YouTube performance"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen></iframe>
    </div>
    <p class="performance-caption">title of the piece &mdash; venue, date</p>
  </div>

  <div class="performance">
    <div class="performance-media">
      <video controls preload="metadata">
        <source src="/images/music/example.mp4" type="video/mp4">
        your browser doesn't support embedded video.
      </video>
    </div>
    <p class="performance-caption">title of the piece &mdash; venue, date</p>
  </div>

  <div class="performance">
    <audio controls preload="metadata">
      <source src="/images/music/example.mp3" type="audio/mpeg">
      your browser doesn't support embedded audio.
    </audio>
    <p class="performance-caption">title of the piece &mdash; recording date</p>
  </div>

</div>

<div class="content-narrow content-block" markdown="1">

i also have a radioshow on WMBR &mdash; playlists live on the [radio]({{ "/radio/" | relative_url }}) page.

</div>
