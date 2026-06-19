(function () {
  function createMoviePlayer(container, streamUrl) {
    if (!container || !streamUrl) {
      return;
    }

    var video = container.querySelector("video");
    var trigger = container.querySelector(".player-cover");
    var hls = null;
    var attached = false;

    function attach() {
      if (attached || !video) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
            hls = null;
            attached = false;
          }
        });
      }
    }

    function start() {
      attach();
      container.classList.add("is-ready");
      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          container.classList.remove("is-playing");
        });
      }
    }

    if (trigger) {
      trigger.addEventListener("click", start);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener("play", function () {
        container.classList.add("is-ready", "is-playing");
      });
      video.addEventListener("pause", function () {
        container.classList.remove("is-playing");
      });
    }
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  }

  window.createMoviePlayer = createMoviePlayer;
})();
