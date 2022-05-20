---
title: WMBR
permalink: /radio/
categories: music
---

{:.content-list-header .content-block}
**WMBR playlists**

{:.content-narrow .content-block}
I have a radioshow on [WMBR](https://wmbr.org/). below are the playlists for my shows, as they air

{:.content-narrow .content-block}
<div class="content list">
  {% for post in site.categories.music %}
    <div class="list-item">
      <p class="list-post-title">
        <a href="{{ site.baseurl }}{{ post.url }}">- {{ post.title }}</a>
      </p>
    </div>
  {% endfor %}
