---
title: Blog
permalink: /blog/
categories: Personal
---

{:.content-narrow .content-block}
**Blog (?)**

{:.content-narrow .content-block}
<div class="content list">
  {% for post in site.categories.Personal %}
    <div class="list-item">
      <p class="list-post-title">
        <a href="{{ site.baseurl }}{{ post.url }}">- {{ post.title }}</a>
      </p>
    </div>
  {% endfor %}

</div>
