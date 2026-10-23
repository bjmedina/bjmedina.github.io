---
layout: default
title: guide
permalink: /guide/
guide: true
---

<div class="content-narrow content-block">
  <h2 class="sec">guide</h2>
  <p class="section-note">
    going to coffee shops was a huge help during my phd. it's also a vehicle for getting to know the city — it encourages me to go out and explore. these are my favorite spots to grab a coffee and/or pastry (not necessarily to work out of — working coffee shops are a little different).
  </p>

  <div id="guide-map"></div>

  {%- assign places = site.data.places -%}

  {%- assign cities = "" -%}
  {%- for p in places -%}
    {%- unless cities contains p.city -%}
      {%- assign cities = cities | append: p.city | append: "," -%}
    {%- endunless -%}
  {%- endfor -%}
  {%- assign cities = cities | split: "," -%}

  {%- for city in cities -%}
  <h3 class="sub">{{ city | downcase }}</h3>
  <ul class="guide-list">
    {%- for p in places -%}
      {%- if p.city == city -%}
      <li data-lat="{{ p.lat }}" data-lon="{{ p.lon }}" data-name="{{ p.name | escape }}">
        <div class="place-head">
          <a class="place-name" href="https://www.google.com/maps/search/?api=1&query={{ p.lat }},{{ p.lon }}" target="_blank" rel="noopener">{{ p.name }}</a>
          {%- if p.type %}<span class="place-type">{{ p.type | downcase }}</span>{% endif -%}
        </div>
        {%- if p.neighborhood or p.rating -%}
        <div class="place-sub">
          {%- if p.neighborhood %}{{ p.neighborhood | downcase }}{% endif -%}
          {%- if p.rating %}{% if p.neighborhood %} · {% endif %}{{ p.rating }}/5{% endif -%}
        </div>
        {%- endif -%}
        {%- if p.note %}<div class="place-note">{{ p.note }}</div>{% endif -%}
      </li>
      {%- endif -%}
    {%- endfor -%}
  </ul>
  {%- endfor -%}

</div>

<script>
  document.addEventListener('DOMContentLoaded', function () {
    if (typeof L === 'undefined') return;
    var mapEl = document.getElementById('guide-map');
    if (!mapEl) return;

    var items = document.querySelectorAll('.guide-list li[data-lat]');
    if (items.length === 0) return;

    var map = L.map(mapEl, { scrollWheelZoom: false });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19
    }).addTo(map);

    var markers = [];
    items.forEach(function (li) {
      var lat = parseFloat(li.dataset.lat);
      var lon = parseFloat(li.dataset.lon);
      if (isNaN(lat) || isNaN(lon)) return;
      var m = L.marker([lat, lon]).addTo(map).bindPopup(li.dataset.name);
      markers.push(m);
      li.addEventListener('click', function (e) {
        if (e.target.closest('a')) return;  // let the external link handle it
        map.setView([lat, lon], Math.max(map.getZoom(), 14));
        m.openPopup();
      });
    });

    if (markers.length > 0) {
      map.fitBounds(L.featureGroup(markers).getBounds().pad(0.25));
    } else {
      map.setView([42.37, -71.11], 12);  // fallback: cambridge
    }
  });
</script>
