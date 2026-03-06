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

});
