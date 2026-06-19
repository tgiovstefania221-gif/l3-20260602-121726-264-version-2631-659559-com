(function () {
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.mobile-menu-toggle');
  var mobileMenu = document.querySelector('.mobile-menu');

  function updateHeader() {
    if (!header) {
      return;
    }
    if (window.scrollY > 18) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (toggle && mobileMenu && header) {
    toggle.addEventListener('click', function () {
      var open = mobileMenu.classList.toggle('open');
      header.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var topButton = document.querySelector('.back-to-top');
  if (topButton) {
    topButton.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('.hero-prev');
    var next = hero.querySelector('.hero-next');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || '0'));
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    restart();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('.filter-panel'));
    panels.forEach(function (panel) {
      var scope = panel.closest('section') || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
      if (!cards.length) {
        cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
      }
      var input = panel.querySelector('.filter-input');
      var type = panel.querySelector('.filter-type');
      var year = panel.querySelector('.filter-year');
      var category = panel.querySelector('.filter-category');
      var empty = scope.querySelector('.filter-empty');

      function normalize(value) {
        return String(value || '').trim().toLowerCase();
      }

      function apply() {
        var keyword = normalize(input && input.value);
        var typeValue = normalize(type && type.value);
        var yearValue = normalize(year && year.value);
        var categoryValue = normalize(category && category.value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-category'),
            card.textContent
          ].join(' '));
          var ok = true;
          if (keyword && haystack.indexOf(keyword) === -1) {
            ok = false;
          }
          if (typeValue && normalize(card.getAttribute('data-type')) !== typeValue) {
            ok = false;
          }
          if (yearValue && normalize(card.getAttribute('data-year')) !== yearValue) {
            ok = false;
          }
          if (categoryValue && normalize(card.getAttribute('data-category')) !== categoryValue) {
            ok = false;
          }
          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      panel.addEventListener('input', apply);
      panel.addEventListener('change', apply);
      panel.addEventListener('reset', function () {
        window.setTimeout(apply, 0);
      });

      var params = new URLSearchParams(window.location.search);
      if (input && params.get('q')) {
        input.value = params.get('q');
      }
      apply();
    });
  }

  function setupPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll('.video-shell'));

    function start(shell) {
      var video = shell.querySelector('video');
      var stream = shell.getAttribute('data-stream');
      if (!video || !stream) {
        return;
      }
      if (!video.getAttribute('data-ready')) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
          shell._hls = hls;
        } else {
          video.src = stream;
        }
        video.setAttribute('data-ready', 'true');
        video.controls = true;
      }
      shell.classList.add('is-playing');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    shells.forEach(function (shell) {
      var overlay = shell.querySelector('.player-overlay');
      var video = shell.querySelector('video');
      if (overlay) {
        overlay.addEventListener('click', function (event) {
          event.preventDefault();
          start(shell);
        });
      }
      shell.addEventListener('click', function (event) {
        if (event.target === shell) {
          start(shell);
        }
      });
      if (video) {
        video.addEventListener('click', function () {
          if (!video.getAttribute('data-ready')) {
            start(shell);
          }
        });
      }
    });
  }

  setupHero();
  setupFilters();
  setupPlayers();
})();
