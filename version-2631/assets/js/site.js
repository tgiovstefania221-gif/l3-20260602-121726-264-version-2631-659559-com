(function () {
    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(text) {
        return String(text || '').toLowerCase().trim();
    }

    function parseYear(value) {
        var match = String(value || '').match(/\d{4}/);
        return match ? Number(match[0]) : 0;
    }

    function htmlEscape(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function initNavigation() {
        var toggle = $('[data-nav-toggle]');
        var menu = $('[data-nav-menu]');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = $('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = $all('[data-hero-slide]', hero);
        var dots = $all('[data-hero-dot]', hero);
        var prev = $('[data-hero-prev]', hero);
        var next = $('[data-hero-next]', hero);
        var index = 0;
        var timer;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function play() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                play();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                play();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                play();
            });
        });
        show(0);
        play();
    }

    function initImageFallback() {
        document.addEventListener('error', function (event) {
            var target = event.target;
            if (target && target.tagName === 'IMG') {
                target.style.opacity = '0';
                target.setAttribute('aria-hidden', 'true');
            }
        }, true);
    }

    function initFilters() {
        var panel = $('[data-filter-search]') ? document : null;
        if (!panel) {
            return;
        }
        var searchInput = $('[data-filter-search]');
        var regionSelect = $('[data-filter-region]');
        var yearSelect = $('[data-filter-year]');
        var sortSelect = $('[data-sort-cards]');
        var grid = $('[data-card-grid]');
        var visibleCount = $('[data-visible-count]');
        var totalCount = $('[data-total-count]');
        var emptyState = $('[data-empty-state]');
        if (!grid) {
            return;
        }
        var cards = $all('.movie-card', grid);
        var original = cards.slice();
        if (totalCount) {
            totalCount.textContent = String(cards.length);
        }

        function matchRegion(card, selected) {
            if (!selected) {
                return true;
            }
            var region = card.getAttribute('data-region') || '';
            return selected.split('|').some(function (part) {
                return region.indexOf(part) !== -1;
            });
        }

        function matchYear(card, selected) {
            if (!selected) {
                return true;
            }
            var year = parseYear(card.getAttribute('data-year'));
            if (selected === 'classic') {
                return year > 0 && year < 2010;
            }
            return selected.split('|').some(function (part) {
                return String(year) === part;
            });
        }

        function sortCards(cardsToSort) {
            var mode = sortSelect ? sortSelect.value : 'default';
            var sorted = cardsToSort.slice();
            if (mode === 'default') {
                sorted.sort(function (a, b) {
                    return original.indexOf(a) - original.indexOf(b);
                });
            } else if (mode === 'views-desc') {
                sorted.sort(function (a, b) {
                    return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
                });
            } else if (mode === 'score-desc') {
                sorted.sort(function (a, b) {
                    return Number(b.dataset.score || 0) - Number(a.dataset.score || 0);
                });
            } else if (mode === 'year-desc') {
                sorted.sort(function (a, b) {
                    return parseYear(b.dataset.year) - parseYear(a.dataset.year);
                });
            } else if (mode === 'year-asc') {
                sorted.sort(function (a, b) {
                    return parseYear(a.dataset.year) - parseYear(b.dataset.year);
                });
            } else if (mode === 'title-asc') {
                sorted.sort(function (a, b) {
                    return (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-Hans-CN');
                });
            }
            sorted.forEach(function (card) {
                grid.appendChild(card);
            });
        }

        function applyFilters() {
            var query = normalize(searchInput ? searchInput.value : '');
            var region = regionSelect ? regionSelect.value : '';
            var year = yearSelect ? yearSelect.value : '';
            var visibleCards = [];
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.year,
                    card.dataset.tags
                ].join(' '));
                var matched = (!query || haystack.indexOf(query) !== -1) && matchRegion(card, region) && matchYear(card, year);
                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visibleCards.push(card);
                }
            });
            sortCards(visibleCards);
            if (visibleCount) {
                visibleCount.textContent = String(visibleCards.length);
            }
            if (emptyState) {
                emptyState.classList.toggle('is-visible', visibleCards.length === 0);
            }
        }

        [searchInput, regionSelect, yearSelect, sortSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });
        applyFilters();
    }

    function initSearchPage() {
        var form = $('[data-search-form]');
        var input = $('[data-search-input]');
        var results = $('[data-search-results]');
        var note = $('[data-search-note]');
        if (!form || !input || !results || !window.MOVIE_INDEX) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';
        input.value = initialQuery;

        function render(query) {
            var q = normalize(query);
            var matched = window.MOVIE_INDEX.filter(function (movie) {
                if (!q) {
                    return true;
                }
                return normalize([
                    movie.title,
                    movie.region,
                    movie.year,
                    movie.genre,
                    movie.tags,
                    movie.oneLine
                ].join(' ')).indexOf(q) !== -1;
            }).slice(0, 240);
            note.textContent = q ? '找到 ' + matched.length + ' 条相关结果，最多展示前 240 条。' : '输入关键词可搜索全站影片，默认展示前 240 条。';
            results.innerHTML = matched.map(function (movie) {
                return [
                    '<article class="movie-card">',
                    '    <a class="movie-card__link" href="' + htmlEscape(movie.url) + '">',
                    '        <div class="poster-wrap">',
                    '            <img src="' + htmlEscape(movie.cover) + '" alt="' + htmlEscape(movie.title) + '" loading="lazy">',
                    '            <span class="duration-badge">' + htmlEscape(movie.duration) + '</span>',
                    '            <span class="play-hover" aria-hidden="true">▶</span>',
                    '        </div>',
                    '        <div class="movie-card__body">',
                    '            <div class="card-badges">',
                    '                <span class="badge badge--blue">' + htmlEscape(movie.category) + '</span>',
                    '                <span class="badge badge--light">' + htmlEscape(movie.score) + ' 分</span>',
                    '            </div>',
                    '            <h3>' + htmlEscape(movie.title) + '</h3>',
                    '            <p>' + htmlEscape(movie.oneLine) + '</p>',
                    '            <div class="movie-card__meta">',
                    '                <span>' + htmlEscape(movie.year) + '</span>',
                    '                <span>' + htmlEscape(movie.region) + '</span>',
                    '                <span>' + Number(movie.views).toLocaleString() + ' 观看</span>',
                    '            </div>',
                    '        </div>',
                    '    </a>',
                    '</article>'
                ].join('\n');
            }).join('\n');
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var query = input.value.trim();
            var nextUrl = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
            window.history.replaceState(null, '', nextUrl);
            render(query);
        });
        input.addEventListener('input', function () {
            render(input.value);
        });
        render(initialQuery);
    }

    function initPlayers() {
        $all('[data-player]').forEach(function (box) {
            var video = $('video', box);
            var startButton = $('.player-start', box);
            var status = $('.player-status', box);
            var src = box.getAttribute('data-src');
            var initialized = false;
            var hlsInstance = null;

            function setStatus(message) {
                if (status) {
                    status.textContent = message || '';
                }
            }

            function playVideo() {
                if (!video || !src) {
                    setStatus('视频源暂时不可用');
                    return;
                }
                if (startButton) {
                    startButton.classList.add('is-hidden');
                }
                if (initialized) {
                    video.play().catch(function () {
                        setStatus('请再次点击播放器开始播放');
                    });
                    return;
                }
                initialized = true;
                setStatus('正在加载高清播放源...');
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(src);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        setStatus('');
                        video.play().catch(function () {
                            setStatus('播放已就绪，请点击播放器开始');
                        });
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
                        if (!data || !data.fatal) {
                            return;
                        }
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            setStatus('网络加载异常，正在重试...');
                            hlsInstance.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            setStatus('媒体解码异常，正在恢复...');
                            hlsInstance.recoverMediaError();
                        } else {
                            setStatus('视频加载失败，请稍后重试');
                            hlsInstance.destroy();
                        }
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = src;
                    video.addEventListener('loadedmetadata', function () {
                        setStatus('');
                        video.play().catch(function () {
                            setStatus('播放已就绪，请点击播放器开始');
                        });
                    }, { once: true });
                } else {
                    setStatus('当前浏览器不支持 HLS 播放');
                }
            }

            if (startButton) {
                startButton.addEventListener('click', playVideo);
            }
            video.addEventListener('play', function () {
                if (startButton) {
                    startButton.classList.add('is-hidden');
                }
            });
        });
    }

    function initBackTop() {
        var button = document.createElement('button');
        button.className = 'back-top';
        button.type = 'button';
        button.setAttribute('aria-label', '返回顶部');
        button.textContent = '↑';
        document.body.appendChild(button);
        window.addEventListener('scroll', function () {
            button.classList.toggle('is-visible', window.scrollY > 560);
        });
        button.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initNavigation();
        initHero();
        initImageFallback();
        initFilters();
        initSearchPage();
        initPlayers();
        initBackTop();
    });
})();
