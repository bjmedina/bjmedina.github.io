---
layout: default
title: research
permalink: /research/
---

{% assign sorted = site.publications | sort: "date" | reverse %}

<div class="content-narrow content-block">
  <h2 class="sec">papers</h2>
  {%- for pub in sorted -%}
    {%- if pub.paper -%}{% include pub_entry.html pub=pub %}{%- endif -%}
  {%- endfor -%}
</div>

<div class="content-narrow content-block">
  <h2 class="sec">presentations</h2>
  {%- for pub in sorted -%}
    {%- if pub.presentation -%}{% include pub_entry.html pub=pub %}{%- endif -%}
  {%- endfor -%}
</div>
