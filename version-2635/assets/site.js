document.addEventListener("DOMContentLoaded", function () {
  var header = document.querySelector("[data-site-header]");
  var toggle = document.querySelector("[data-menu-toggle]");
  var mobilePanel = document.querySelector("[data-mobile-panel]");

  function updateHeader() {
    if (!header) {
      return;
    }

    if (window.scrollY > 44) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  if (toggle && header && mobilePanel) {
    toggle.addEventListener("click", function () {
      header.classList.toggle("menu-open");
    });
  }

  document.querySelectorAll("[data-hero]").forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var thumbs = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-thumb]"));
    var next = hero.querySelector("[data-hero-next]");
    var prev = hero.querySelector("[data-hero-prev]");
    var current = 0;
    var timer = null;

    function setSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
      thumbs.forEach(function (thumb, thumbIndex) {
        thumb.classList.toggle("active", thumbIndex === current);
      });
    }

    function play() {
      stop();
      timer = window.setInterval(function () {
        setSlide(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        setSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        play();
      });
    });

    thumbs.forEach(function (thumb) {
      thumb.addEventListener("mouseenter", function () {
        setSlide(Number(thumb.getAttribute("data-hero-thumb")) || 0);
      });
    });

    if (next) {
      next.addEventListener("click", function () {
        setSlide(current + 1);
        play();
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        setSlide(current - 1);
        play();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", play);
    setSlide(0);
    play();
  });

  document.querySelectorAll("[data-search-input]").forEach(function (input) {
    var list = document.querySelector("[data-card-list]");
    var empty = document.querySelector("[data-empty-state]");

    function applyFilter() {
      if (!list) {
        return;
      }

      var keyword = input.value.trim().toLowerCase();
      var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-meta") || "",
          card.textContent || ""
        ].join(" ").toLowerCase();
        var matched = !keyword || haystack.indexOf(keyword) !== -1;
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("visible", visible === 0);
      }
    }

    if (input.hasAttribute("data-sync-query")) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q) {
        input.value = q;
      }
    }

    input.addEventListener("input", applyFilter);
    applyFilter();
  });
});
