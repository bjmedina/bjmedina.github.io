---
layout: default
title: art
permalink: /art/
---

<div class="content-narrow content-block">
  <nav class="section-jumps">
    <a href="#music">music</a>
    <a href="#radio">radio</a>
    <a href="#writing">writing</a>
  </nav>
</div>

<!-- MUSIC -->
<section id="music" class="art-section">
  <div class="content-narrow content-block">
    <h2 class="section-header typewrite" data-text="music">music</h2>
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

    <div class="gig-list">
      {%- for gig in gigs -%}
      <div class="gig" data-year="{{ gig.date | date: '%Y' }}">
        <div class="gig-header">
          <h4 class="gig-venue">{{ gig.venue }}{% if gig.date %} &mdash; {{ gig.date | date: "%B %Y" }}{% endif %}</h4>
          {%- if gig.meta %}<p class="gig-meta">{{ gig.meta }}</p>{% endif -%}
        </div>

        {%- for clip in gig.clips -%}
        <div class="performance">
          <div class="performance-media">
            <iframe
              src="https://www.youtube.com/embed/{{ clip.video }}?start={{ clip.start | default: 0 }}{% if clip.end %}&amp;end={{ clip.end }}{% endif %}"
              title="{{ clip.title | escape }}"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen></iframe>
          </div>
          <p class="performance-caption">
            <span class="performance-title">{{ clip.title }}</span>
            {%- if clip.note %}<br><span class="performance-note">{{ clip.note }}</span>{% endif -%}
          </p>
        </div>
        {%- endfor -%}
      </div>
      {%- endfor -%}
    </div>

  </div>
  {%- endif -%}
</section>

<!-- RADIO -->
<section id="radio" class="art-section">
  <div class="content-narrow content-block">
    <h2 class="section-header typewrite" data-text="radio">radio</h2>
    <p class="section-note">
      brain waves — my radioshow on <a href="https://wmbr.org/" target="_blank">wmbr</a>, mit's station.
      playlists below, most recent first.
    </p>

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
    <h2 class="section-header typewrite" data-text="writing">writing</h2>
    <p class="section-note">notes, small essays, guest posts.</p>

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
