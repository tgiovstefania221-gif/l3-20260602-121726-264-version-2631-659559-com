(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-nav]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function setupFilter() {
    var input = document.querySelector('[data-filter-input]');
    var clear = document.querySelector('[data-filter-clear]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));
    if (!input || !cards.length) {
      return;
    }
    function apply() {
      var query = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        card.style.display = !query || haystack.indexOf(query) !== -1 ? '' : 'none';
      });
    }
    input.addEventListener('input', apply);
    if (clear) {
      clear.addEventListener('click', function () {
        input.value = '';
        apply();
        input.focus();
      });
    }
  }

  function setupPlayer() {
    var video = document.getElementById('movie-player');
    var button = document.querySelector('[data-play-button]');
    var wrap = document.querySelector('[data-player-wrap]');
    if (!video || !button || !wrap) {
      return;
    }
    var stream = video.getAttribute('data-stream');
    var attached = false;
    function attach() {
      if (attached || !stream) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    }
    function start() {
      attach();
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    }
    button.addEventListener('click', start);
    video.addEventListener('play', function () {
      wrap.classList.add('playing');
    });
    video.addEventListener('pause', function () {
      wrap.classList.remove('playing');
    });
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilter();
    setupPlayer();
  });
})();
