(function () {
    'use strict';

    var root = document.documentElement;
    var themeButton = document.querySelector('.theme-button');
    var themeMenu = document.querySelector('.theme-menu');
    var themeLabel = document.querySelector('.theme-label');
    var themeOptions = Array.prototype.slice.call(document.querySelectorAll('[data-theme-value]'));
    var media = window.matchMedia('(prefers-color-scheme: dark)');

    function preference() { return localStorage.getItem('portfolio-theme') || 'auto'; }
    function resolvedTheme(value) { return value === 'auto' ? (media.matches ? 'dark' : 'light') : value; }
    function applyTheme(value) {
        root.dataset.themePreference = value;
        root.dataset.theme = resolvedTheme(value);
        themeLabel.textContent = value.charAt(0).toUpperCase() + value.slice(1);
        document.querySelector('meta[name="theme-color"]').setAttribute('content', root.dataset.theme === 'dark' ? '#101112' : '#ffffff');
        themeOptions.forEach(function (option) {
            option.setAttribute('aria-selected', String(option.dataset.themeValue === value));
        });
    }
    function closeThemeMenu() {
        themeMenu.hidden = true;
        themeButton.setAttribute('aria-expanded', 'false');
    }
    applyTheme(preference());
    themeButton.addEventListener('click', function () {
        var willOpen = themeMenu.hidden;
        themeMenu.hidden = !willOpen;
        themeButton.setAttribute('aria-expanded', String(willOpen));
    });
    themeOptions.forEach(function (option) {
        option.addEventListener('click', function () {
            localStorage.setItem('portfolio-theme', option.dataset.themeValue);
            applyTheme(option.dataset.themeValue);
            closeThemeMenu();
        });
    });
    media.addEventListener('change', function () { if (preference() === 'auto') applyTheme('auto'); });
    document.addEventListener('click', function (event) { if (!event.target.closest('.theme-control')) closeThemeMenu(); });

    var navToggle = document.querySelector('.nav-toggle');
    var nav = document.querySelector('.site-nav');
    navToggle.addEventListener('click', function () {
        var open = nav.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', String(open));
        navToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
        navToggle.innerHTML = '<i class="fas fa-' + (open ? 'times' : 'bars') + '" aria-hidden="true"></i>';
    });
    nav.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () { nav.classList.remove('open'); navToggle.setAttribute('aria-expanded', 'false'); });
    });

    var search = document.getElementById('product-search');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.product-card'));
    var chips = Array.prototype.slice.call(document.querySelectorAll('.filter-chip'));
    var count = document.getElementById('result-count');
    var word = document.getElementById('result-word');
    var empty = document.getElementById('empty-state');
    var activeFilter = 'all';

    function filterProducts() {
        var query = search.value.trim().toLowerCase();
        var visible = 0;
        cards.forEach(function (card) {
            var matchesText = !query || card.dataset.search.indexOf(query) !== -1;
            var matchesTag = activeFilter === 'all' || card.dataset.tags.split(' ').indexOf(activeFilter) !== -1;
            card.hidden = !(matchesText && matchesTag);
            if (!card.hidden) visible += 1;
        });
        count.textContent = visible;
        word.textContent = visible === 1 ? 'product' : 'products';
        empty.hidden = visible !== 0;
    }
    chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
            activeFilter = chip.dataset.filter;
            chips.forEach(function (item) {
                var selected = item === chip;
                item.classList.toggle('active', selected);
                item.setAttribute('aria-pressed', String(selected));
            });
            filterProducts();
        });
    });
    search.addEventListener('input', filterProducts);
    document.getElementById('reset-filters').addEventListener('click', function () {
        search.value = '';
        activeFilter = 'all';
        chips.forEach(function (item) { var selected = item.dataset.filter === 'all'; item.classList.toggle('active', selected); item.setAttribute('aria-pressed', String(selected)); });
        filterProducts();
        search.focus();
    });
    document.addEventListener('keydown', function (event) {
        if (event.key === '/' && document.activeElement !== search) { event.preventDefault(); search.focus(); }
        if (event.key === 'Escape') { closeThemeMenu(); nav.classList.remove('open'); search.blur(); }
    });
    document.getElementById('current-year').textContent = new Date().getFullYear();
}());
