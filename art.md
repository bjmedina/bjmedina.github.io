---
layout: default
title: art
permalink: /art/
---

<!-- MUSIC -->
<section id="music" class="art-section">
  <div class="content-narrow content-block">
    <h2 class="sec">music</h2>
    <p class="section-note">specific spots in longer videos where i'm featured.</p>
  </div>

  {%- if site.data.sax_clips and site.data.sax_clips.size > 0 -%}
  <div class="content-narrow content-block">

    {%- assign gigs = site.data.sax_clips | sort: "date" | reverse -%}

    {%- assign years = "" -%}
    {%- for gig in gigs -%}
      {%- assign y = gig.date | date: "%Y" -%}
      {%- unless years contains y -%}{%- assign years = years | append: y | append: "," -%}{%- endunless -%}
    {%- endfor -%}
    {%- assign years = years | split: "," -%}

    <div class="music-filters" id="music-filters">
      <button type="button" class="music-filter is-active" data-year="all">all</button>
      {%- for y in years -%}
      <button type="button" class="music-filter" data-year="{{ y }}">{{ y }}</button>
      {%- endfor -%}
    </div>

    {%- for gig in gigs -%}
    <div class="row gig-row" data-year="{{ gig.date | date: '%Y' }}">
      <div class="tag">
        <span class="venue">{{ gig.venue }}</span>
        {%- if gig.date %}<span class="year">{{ gig.date | date: "%b '%y" | downcase }}</span>{% endif -%}
      </div>
      <div class="body">
        {%- if gig.meta %}<div class="gig-meta">{{ gig.meta }}</div>{% endif -%}
        {%- for clip in gig.clips -%}
        <div class="clip-item">
          <div class="title">{{ clip.title }}</div>
          {%- if clip.note %}<div class="note">{{ clip.note }}</div>{% endif -%}
          <div class="performance-media">
            <iframe
              src="https://www.youtube.com/embed/{{ clip.video }}?start={{ clip.start | default: 0 }}{% if clip.end %}&amp;end={{ clip.end }}{% endif %}"
              title="{{ clip.title | escape }}"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen></iframe>
          </div>
        </div>
        {%- endfor -%}
      </div>
    </div>
    {%- endfor -%}

  </div>
  {%- endif -%}
</section>

<!-- RADIO -->
<section id="radio" class="art-section">
  <div class="content-narrow content-block">
    <h3 class="sub">radio · brain waves on wmbr</h3>
    <ul class="art-list">
      {%- for post in site.categories.music -%}
      <li>
        <a href="{{ site.baseurl }}{{ post.url }}">{{ post.title }}</a>
        <span class="art-date">{{ post.date | date: "%b %-d, %Y" | downcase }}</span>
      </li>
      {%- endfor -%}
    </ul>
  </div>
</section>

<!-- WRITING -->
<section id="writing" class="art-section">
  <div class="content-narrow content-block">
    <h3 class="sub">writing</h3>
    <ul class="art-list">
      {%- for post in site.categories.Personal -%}
      <li>
        <a href="{{ site.baseurl }}{{ post.url }}">{{ post.title }}</a>
        <span class="art-date">{{ post.date | date: "%b %-d, %Y" | downcase }}</span>
      </li>
      {%- endfor -%}
    </ul>
  </div>
</section>
