(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    document.querySelectorAll(".site-search-form").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";

        if (query) {
          event.preventDefault();
          window.location.href = "./search.html?q=" + encodeURIComponent(query);
        }
      });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var localInput = document.querySelector(".grid-search input");
    var yearSelect = document.querySelector(".year-filter");
    var typeSelect = document.querySelector(".type-filter");
    var emptyHint = document.querySelector(".empty-hint");
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || "";

    if (localInput && q) {
      localInput.value = q;
    }

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function applyFilters() {
      if (!cards.length) {
        return;
      }

      var term = normalize(localInput ? localInput.value : "");
      var year = yearSelect ? yearSelect.value : "";
      var type = typeSelect ? typeSelect.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre")
        ].join(" "));
        var yearOk = !year || card.getAttribute("data-year") === year;
        var typeOk = !type || card.getAttribute("data-type") === type;
        var termOk = !term || haystack.indexOf(term) !== -1;
        var show = yearOk && typeOk && termOk;

        card.style.display = show ? "" : "none";
        if (show) {
          visible += 1;
        }
      });

      if (emptyHint) {
        emptyHint.style.display = visible ? "none" : "block";
      }
    }

    [localInput, yearSelect, typeSelect].forEach(function (el) {
      if (el) {
        el.addEventListener("input", applyFilters);
        el.addEventListener("change", applyFilters);
      }
    });

    applyFilters();
  });

  window.bootMoviePlayer = function (sourceUrl) {
    var video = document.getElementById("moviePlayer");
    var layer = document.getElementById("playLayer");
    var button = document.getElementById("playButton");
    var started = false;
    var hlsInstance = null;

    function start() {
      if (!video || started) {
        return;
      }

      started = true;

      if (layer) {
        layer.style.display = "none";
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new Hls();
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.src = sourceUrl;
        video.play().catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", start);
    }

    if (layer) {
      layer.addEventListener("click", start);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (!started) {
          start();
        }
      });
      video.addEventListener("emptied", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    }
  };
})();
