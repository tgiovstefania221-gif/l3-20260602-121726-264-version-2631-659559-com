(function () {
  function setupPlayer(box) {
    var video = box.querySelector('video');
    var overlay = box.querySelector('[data-play-overlay]');
    var button = box.querySelector('[data-play-button]');
    var source = box.getAttribute('data-source');
    var hls = null;
    var started = false;

    function start() {
      if (!video || !source) {
        return;
      }

      if (overlay) {
        overlay.classList.add('is-hidden');
      }

      if (!started) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }

        started = true;
      }

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          video.controls = true;
        });
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.stopPropagation();
        start();
      });
    }

    if (overlay) {
      overlay.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (!started) {
        start();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
})();
