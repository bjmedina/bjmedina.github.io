document.addEventListener('DOMContentLoaded', function () {

  // Lightbox
  var lightbox = null;

  document.querySelectorAll('.lightbox_trigger').forEach(function (trigger) {
    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      var src = this.getAttribute('href');

      if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.id = 'lightbox';
        lightbox.innerHTML = '<img>';
        lightbox.addEventListener('click', function () {
          lightbox.style.display = 'none';
        });
        document.body.appendChild(lightbox);
      }

      lightbox.querySelector('img').src = src;
      lightbox.style.display = 'block';
    });
  });

  // Year filter on the music page
  var musicFilters = document.getElementById('music-filters');
  if (musicFilters) {
    var gigEls = document.querySelectorAll('.gig[data-year]');
    musicFilters.addEventListener('click', function (e) {
      var btn = e.target.closest('.music-filter');
      if (!btn) return;
      var year = btn.dataset.year;
      musicFilters.querySelectorAll('.music-filter').forEach(function (b) {
        b.classList.toggle('is-active', b === btn);
      });
      gigEls.forEach(function (g) {
        g.style.display = (year === 'all' || g.dataset.year === year) ? '' : 'none';
      });
    });
  }

  // Typewriter section headers — animate text in char-by-char on load
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('.typewrite').forEach(function (el, i) {
    var text = el.dataset.text || el.textContent;
    if (prefersReduced) { el.textContent = text; return; }
    el.textContent = '';
    el.classList.add('typing');
    var idx = 0;
    var delay = 220 + i * 350;         // stagger multiple headers
    var perChar = 40;                  // ms per character
    setTimeout(function step() {
      if (idx <= text.length) {
        el.textContent = text.slice(0, idx++);
        setTimeout(step, perChar);
      } else {
        el.classList.remove('typing');
        el.classList.add('typed');
      }
    }, delay);
  });

  // Rotating footer note — pick a random one per page load
  var footerNote = document.getElementById('footer-note');
  if (footerNote && footerNote.dataset.notes) {
    try {
      var notes = JSON.parse(footerNote.dataset.notes);
      if (Array.isArray(notes) && notes.length) {
        var pick = notes[Math.floor(Math.random() * notes.length)];
        footerNote.textContent = pick;
      }
    } catch (_) { /* leave the default */ }
  }

});
