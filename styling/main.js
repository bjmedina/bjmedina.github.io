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

});
