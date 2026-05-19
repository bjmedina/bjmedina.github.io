---
layout: default
title: music
permalink: /music/
---

<div class="content-narrow content-block" markdown="1">

## saxophone

a rotating collection of performances. mostly alto. some bass too.

</div>

<div class="content-narrow content-block">

  <h3>playlist</h3>

  <div class="performance">
    <div class="performance-media">
      <iframe
        src="https://www.youtube.com/embed/aIAzo2somjs?list=PL900nRJsGdducFcZvvCKv8HNbMuf1IRlb"
        title="saxophone performances"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen></iframe>
    </div>
    <p class="performance-caption">full playlist on <a href="https://www.youtube.com/playlist?list=PL900nRJsGdducFcZvvCKv8HNbMuf1IRlb" target="_blank">youtube</a></p>
  </div>

</div>

{%- if site.data.sax_clips and site.data.sax_clips.size > 0 -%}
<div class="content-narrow content-block">

  <h3>featured moments</h3>
  <p class="section-note">specific spots in longer videos where i'm featured.</p>

  {%- assign gigs = site.data.sax_clips | sort: "date" | reverse -%}
  {%- for gig in gigs -%}
  <div class="gig">
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
