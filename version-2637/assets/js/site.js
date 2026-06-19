(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            var open = mobileNav.classList.toggle('is-open');
            menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    var filterForms = document.querySelectorAll('[data-filter-form]');
    filterForms.forEach(function (form) {
        var scope = form.closest('[data-filter-scope]') || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-title]'));
        var empty = scope.querySelector('[data-empty-state]');
        var input = form.querySelector('[data-filter-input]');
        var select = form.querySelector('[data-filter-select]');

        function normalize(value) {
            return (value || '').toString().trim().toLowerCase();
        }

        function applyFilter() {
            var query = normalize(input ? input.value : '');
            var sort = select ? select.value : 'default';
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-genre')
                ].join(' '));
                var matched = !query || haystack.indexOf(query) !== -1;
                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });

            if (sort !== 'default') {
                var grid = scope.querySelector('[data-filter-grid]');
                var visibleCards = cards.filter(function (card) {
                    return card.style.display !== 'none';
                });
                visibleCards.sort(function (a, b) {
                    if (sort === 'score') {
                        return parseFloat(b.getAttribute('data-score') || '0') - parseFloat(a.getAttribute('data-score') || '0');
                    }
                    if (sort === 'year') {
                        return parseInt(b.getAttribute('data-year') || '0', 10) - parseInt(a.getAttribute('data-year') || '0', 10);
                    }
                    return normalize(a.getAttribute('data-title')).localeCompare(normalize(b.getAttribute('data-title')));
                });
                if (grid) {
                    visibleCards.forEach(function (card) {
                        grid.appendChild(card);
                    });
                }
            }

            if (empty) {
                empty.style.display = visible ? 'none' : 'block';
            }
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            applyFilter();
        });

        if (input) {
            input.addEventListener('input', applyFilter);
        }

        if (select) {
            select.addEventListener('change', applyFilter);
        }

        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q && input) {
            input.value = q;
        }
        applyFilter();
    });
})();

function initMoviePlayer(url) {
    var video = document.getElementById('moviePlayer');
    var overlay = document.querySelector('.player-overlay');
    var button = document.querySelector('.play-button');
    var started = false;
    var hlsInstance = null;

    if (!video || !url) {
        return;
    }

    function start() {
        if (started) {
            if (video.paused) {
                video.play().catch(function () {});
            }
            return;
        }

        started = true;

        if (overlay) {
            overlay.classList.add('is-hidden');
        }

        video.setAttribute('controls', 'controls');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
            video.play().catch(function () {});
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsInstance.loadSource(url);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
            });
            return;
        }

        video.src = url;
        video.play().catch(function () {});
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
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
}
