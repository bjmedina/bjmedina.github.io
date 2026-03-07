---
layout: default
title: Research
permalink: /research/
---
{:.content-list-header .content-block}
**Papers**

{% assign sorted = site.publications | sort: "date" | reverse %}

{%- for pub in sorted -%}
  {% if pub.paper %}{% include pub_entry.html pub=pub %}{%- endif -%}
{% endfor %}

{:.content-list-header .content-block}
**Presentations**

{%- for pub in sorted -%}
  {% if pub.presentation %}{% include pub_entry.html pub=pub %}{%- endif -%}
{% endfor %}
