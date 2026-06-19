(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function setupMobileMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHeroCarousel() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var prev = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupHomeSearch() {
    var form = document.querySelector("[data-home-search]");
    if (!form) {
      return;
    }
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = form.querySelector("input[name='q']");
      var query = input ? input.value.trim() : "";
      var target = "search.html";
      if (query) {
        target += "?q=" + encodeURIComponent(query);
      }
      window.location.href = target;
    });
  }

  function setupFilters() {
    var filter = document.querySelector("[data-filter-page]");
    if (!filter) {
      return;
    }
    var root = filter.closest(".list-section") || document;
    var input = filter.querySelector("[data-filter-input]");
    var region = filter.querySelector("[data-filter-region]");
    var year = filter.querySelector("[data-filter-year]");
    var type = filter.querySelector("[data-filter-type]");
    var items = Array.prototype.slice.call(root.querySelectorAll(".movie-card, .rank-item"));

    function apply() {
      var q = normalize(input && input.value);
      var regionValue = normalize(region && region.value);
      var yearValue = normalize(year && year.value);
      var typeValue = normalize(type && type.value);
      items.forEach(function (item) {
        var haystack = normalize([
          item.dataset.title,
          item.dataset.tags,
          item.dataset.region,
          item.dataset.type,
          item.dataset.year
        ].join(" "));
        var matchesQuery = !q || haystack.indexOf(q) !== -1;
        var matchesRegion = !regionValue || normalize(item.dataset.region) === regionValue;
        var matchesYear = !yearValue || normalize(item.dataset.year) === yearValue;
        var matchesType = !typeValue || normalize(item.dataset.type) === typeValue;
        item.classList.toggle("is-hidden", !(matchesQuery && matchesRegion && matchesYear && matchesType));
      });
    }

    [input, region, year, type].forEach(function (control) {
      if (!control) {
        return;
      }
      control.addEventListener("input", apply);
      control.addEventListener("change", apply);
    });

    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    if (q && input) {
      input.value = q;
    }
    apply();
  }

  function setupPlayer() {
    var shell = document.querySelector("[data-player]");
    if (!shell) {
      return;
    }
    var wrapper = shell.querySelector(".video-player");
    var video = shell.querySelector("video");
    var button = shell.querySelector(".player-play-button");
    var overlay = shell.querySelector(".player-overlay");
    if (!wrapper || !video) {
      return;
    }
    var source = video.dataset.src;
    var hls = null;
    var attached = false;

    function attachSource() {
      if (attached || !source) {
        return;
      }
      attached = true;
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (_, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else {
        video.src = source;
      }
    }

    function play() {
      attachSource();
      wrapper.classList.add("is-playing");
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {
          wrapper.classList.remove("is-playing");
        });
      }
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        play();
      });
    }

    if (overlay) {
      overlay.addEventListener("click", function () {
        play();
      });
    }

    video.addEventListener("play", function () {
      wrapper.classList.add("is-playing");
    });

    video.addEventListener("pause", function () {
      if (!video.ended && video.currentTime > 0) {
        return;
      }
      wrapper.classList.remove("is-playing");
    });

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHeroCarousel();
    setupHomeSearch();
    setupFilters();
    setupPlayer();
  });
})();
