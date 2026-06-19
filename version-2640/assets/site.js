(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  ready(function () {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-site-nav]");
    var search = document.querySelector(".nav-search");
    if (toggle && nav && search) {
      toggle.addEventListener("click", function () {
        var opened = nav.classList.toggle("is-open");
        search.classList.toggle("is-open", opened);
        toggle.setAttribute("aria-expanded", opened ? "true" : "false");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var heroIndex = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      heroIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === heroIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === heroIndex);
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(heroIndex - 1);
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        showSlide(heroIndex + 1);
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(heroIndex + 1);
      }, 5600);
    }

    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
      var input = panel.querySelector("[data-filter-input]");
      var year = panel.querySelector("[data-filter-year]");
      var type = panel.querySelector("[data-filter-type]");
      var reset = panel.querySelector("[data-filter-reset]");
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
      var query = new URLSearchParams(window.location.search).get("q");
      if (query && input) {
        input.value = query;
      }

      function apply() {
        var text = normalize(input && input.value);
        var selectedYear = year ? year.value : "";
        var selectedType = type ? type.value : "";
        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute("data-search") || card.textContent);
          var okText = !text || haystack.indexOf(text) !== -1;
          var okYear = !selectedYear || card.getAttribute("data-year") === selectedYear;
          var okType = !selectedType || card.getAttribute("data-type") === selectedType;
          card.classList.toggle("is-hidden", !(okText && okYear && okType));
        });
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      if (year) {
        year.addEventListener("change", apply);
      }
      if (type) {
        type.addEventListener("change", apply);
      }
      if (reset) {
        reset.addEventListener("click", function () {
          if (input) {
            input.value = "";
          }
          if (year) {
            year.value = "";
          }
          if (type) {
            type.value = "";
          }
          apply();
        });
      }
      apply();
    });

    var rankInput = document.querySelector("[data-rank-filter]");
    if (rankInput) {
      var rankRows = Array.prototype.slice.call(document.querySelectorAll("[data-rank-row]"));
      rankInput.addEventListener("input", function () {
        var text = normalize(rankInput.value);
        rankRows.forEach(function (row) {
          var haystack = normalize(row.getAttribute("data-search") || row.textContent);
          row.classList.toggle("is-hidden", text && haystack.indexOf(text) === -1);
        });
      });
    }
  });
})();
