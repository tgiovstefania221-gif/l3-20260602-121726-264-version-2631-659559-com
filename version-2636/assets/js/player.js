(function () {
  function onReady(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function attach(video, url) {
    if (!video || video.dataset.ready === '1') {
      return;
    }
    video.dataset.ready = '1';
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(url);
      hls.attachMedia(video);
      return;
    }
    video.src = url;
  }

  window.setupPlayer = function (url) {
    onReady(function () {
      var video = document.getElementById('movie-player');
      var button = document.getElementById('player-button');
      var overlay = document.getElementById('player-overlay');
      var start = function () {
        attach(video, url);
        if (overlay) {
          overlay.classList.add('hide');
        }
        var action = video.play();
        if (action && typeof action.catch === 'function') {
          action.catch(function () {});
        }
      };
      if (button) {
        button.addEventListener('click', start);
      }
      if (overlay) {
        overlay.addEventListener('click', start);
      }
      if (video) {
        video.addEventListener('click', function () {
          if (!video.dataset.ready) {
            start();
            return;
          }
          if (video.paused) {
            video.play();
          } else {
            video.pause();
          }
        });
        video.addEventListener('play', function () {
          if (overlay) {
            overlay.classList.add('hide');
          }
        });
      }
    });
  };
})();
