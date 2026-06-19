(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');
  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
      document.body.classList.toggle('menu-open', mobilePanel.classList.contains('open'));
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  if (slides.length > 1) {
    var current = 0;
    var show = function (index) {
      current = index;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    window.setInterval(function () {
      show((current + 1) % slides.length);
    }, 5200);
  }

  var params = new URLSearchParams(window.location.search);
  var query = params.get('q');
  var filterInput = document.querySelector('[data-filter-input]');
  if (filterInput && query) {
    filterInput.value = query;
  }

  var grid = document.querySelector('[data-filter-grid]');
  var noResult = document.querySelector('[data-no-result]');
  var sortSelect = document.querySelector('[data-sort-select]');
  var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll('[data-title]')) : [];

  var getText = function (card) {
    return [
      card.getAttribute('data-title') || '',
      card.getAttribute('data-year') || '',
      card.getAttribute('data-genre') || '',
      card.getAttribute('data-type') || '',
      card.getAttribute('data-region') || '',
      card.textContent || ''
    ].join(' ').toLowerCase();
  };

  var applyFilter = function () {
    if (!grid || !filterInput) {
      return;
    }
    var value = filterInput.value.trim().toLowerCase();
    var visible = 0;
    cards.forEach(function (card) {
      var matched = !value || getText(card).indexOf(value) !== -1;
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });
    if (noResult) {
      noResult.style.display = visible ? 'none' : 'block';
    }
  };

  if (filterInput) {
    filterInput.addEventListener('input', applyFilter);
    applyFilter();
  }

  if (sortSelect && grid) {
    sortSelect.addEventListener('change', function () {
      var value = sortSelect.value;
      var sorted = cards.slice();
      if (value === 'year-desc') {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
        });
      }
      if (value === 'year-asc') {
        sorted.sort(function (a, b) {
          return Number(a.getAttribute('data-year')) - Number(b.getAttribute('data-year'));
        });
      }
      if (value === 'title') {
        sorted.sort(function (a, b) {
          return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
        });
      }
      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
      applyFilter();
    });
  }
})();
