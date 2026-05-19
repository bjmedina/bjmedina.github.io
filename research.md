---
layout: default
title: research
permalink: /research/
---

{% assign sorted = site.publications | sort: "date" | reverse %}

<div class="content-narrow content-block">
  <h2 class="pub-section-header">papers</h2>
  <div class="pub-list">
    {%- for pub in sorted -%}
      {%- if pub.paper -%}{% include pub_entry.html pub=pub %}{%- endif -%}
    {%- endfor -%}
  </div>
</div>

<div class="content-narrow content-block">
  <h2 class="pub-section-header">presentations</h2>
  <div class="pub-list">
    {%- for pub in sorted -%}
      {%- if pub.presentation -%}{% include pub_entry.html pub=pub %}{%- endif -%}
    {%- endfor -%}
  </div>
</div>
