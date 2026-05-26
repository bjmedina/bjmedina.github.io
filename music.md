---
layout: default
title: music
permalink: /music/
---

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
{%- endif -%}
<div class="content-narrow content-block" markdown="1">

i also have a radioshow on WMBR &mdash; playlists live on the [radio]({{ "/radio/" | relative_url }}) page.

</div>
