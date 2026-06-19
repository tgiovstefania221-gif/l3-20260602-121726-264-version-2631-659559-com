var MoviePlayer = (function () {
  function attach(url) {
    var video = document.querySelector("[data-player-video]");
    var cover = document.querySelector("[data-player-cover]");
    var button = document.querySelector("[data-player-button]");
    var hls = null;
    var ready = false;

    if (!video || !url) {
      return;
    }

    function load() {
      if (ready) {
        return;
      }

      ready = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
    }

    function start() {
      load();
      video.controls = true;
      if (cover) {
        cover.classList.add("is-hidden");
      }
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener("click", start);
    }

    if (button) {
      button.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
      if (!ready || video.paused) {
        start();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  }

  return {
    attach: attach
  };
})();
