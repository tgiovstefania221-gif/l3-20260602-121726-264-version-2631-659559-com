(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var searchBox = document.querySelector('[data-search-input]');
  var typeSelect = document.querySelector('[data-type-filter]');
  var regionSelect = document.querySelector('[data-region-filter]');
  var yearSelect = document.querySelector('[data-year-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var emptyState = document.querySelector('[data-empty-state]');

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }

    var query = normalize(searchBox ? searchBox.value : '');
    var typeValue = normalize(typeSelect ? typeSelect.value : '');
    var regionValue = normalize(regionSelect ? regionSelect.value : '');
    var yearValue = normalize(yearSelect ? yearSelect.value : '');
    var visible = 0;

    cards.forEach(function (card) {
      var text = [
        card.dataset.title,
        card.dataset.genre,
        card.dataset.region,
        card.dataset.type,
        card.dataset.category,
        card.dataset.year
      ].join(' ').toLowerCase();

      var matched = true;

      if (query && text.indexOf(query) === -1) {
        matched = false;
      }

      if (typeValue && normalize(card.dataset.type) !== typeValue) {
        matched = false;
      }

      if (regionValue && normalize(card.dataset.region).indexOf(regionValue) === -1) {
        matched = false;
      }

      if (yearValue && normalize(card.dataset.year) !== yearValue) {
        matched = false;
      }

      card.style.display = matched ? '' : 'none';

      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0);
    }
  }

  [searchBox, typeSelect, regionSelect, yearSelect].forEach(function (control) {
    if (control) {
      control.addEventListener('input', applyFilters);
      control.addEventListener('change', applyFilters);
    }
  });

  applyFilters();
})();
