---
title: extras
permalink: /extras/
categories: Experience
---
{:.content-narrow .content-block}
**cool stuff with me in it**

{:.content-narrow .content-block}
<div class="content list">
  {% for post in site.categories.Academic %}
    <div class="list-item">
      <p class="list-post-title">
        <a href="{{ site.baseurl }}{{ post.url }}">- {{ post.title }}</a>
      </p>
    </div>
  {% endfor %}

</div>
