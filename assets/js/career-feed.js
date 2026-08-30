(() => {
  const root = document.documentElement;
  const themeTrigger = document.querySelector('.theme-trigger');
  const themeMenu = document.querySelector('.theme-menu');
  const themeLabel = document.querySelector('.theme-trigger-label');
  const themeOptions = [...document.querySelectorAll('[data-theme-choice]')];
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  const resolvedTheme = mode => mode === 'auto' ? (systemTheme.matches ? 'dark' : 'light') : mode;

  function applyTheme(mode, persist = true) {
    root.dataset.themeMode = mode;
    root.dataset.theme = resolvedTheme(mode);
    if (persist) localStorage.setItem('portfolio-theme', mode);
    document.querySelector('meta[name="theme-color"]').content = root.dataset.theme === 'dark' ? '#121212' : '#ffffff';
    themeLabel.textContent = mode[0].toUpperCase() + mode.slice(1);
    themeOptions.forEach(option => option.setAttribute('aria-checked', String(option.dataset.themeChoice === mode)));
  }

  applyTheme(root.dataset.themeMode || 'auto', false);
  systemTheme.addEventListener('change', () => {
    if (root.dataset.themeMode === 'auto') applyTheme('auto', false);
  });
  themeTrigger.addEventListener('click', () => {
    const open = themeTrigger.getAttribute('aria-expanded') === 'true';
    themeTrigger.setAttribute('aria-expanded', String(!open));
    themeMenu.hidden = open;
  });
  themeOptions.forEach(option => option.addEventListener('click', () => {
    applyTheme(option.dataset.themeChoice);
    themeMenu.hidden = true;
    themeTrigger.setAttribute('aria-expanded', 'false');
    themeTrigger.focus();
  }));
  document.addEventListener('click', event => {
    if (!event.target.closest('.theme-control')) {
      themeMenu.hidden = true;
      themeTrigger.setAttribute('aria-expanded', 'false');
    }
  });

  const menuButton = document.querySelector('.mobile-menu-button');
  const nav = document.querySelector('.primary-nav');
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    menuButton.setAttribute('aria-label', open ? 'Open navigation' : 'Close navigation');
    nav.classList.toggle('open', !open);
  });
  nav.addEventListener('click', event => {
    if (event.target.closest('a')) {
      nav.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open navigation');
    }
  });

  const search = document.querySelector('#experience-search');
  const chips = [...document.querySelectorAll('[data-filter]')];
  const items = [...document.querySelectorAll('.experience-item')];
  const resultCount = document.querySelector('.result-count');
  const empty = document.querySelector('.empty-results');
  let activeFilter = 'all';
  function updateResults() {
    const query = search.value.trim().toLowerCase();
    let visible = 0;
    items.forEach(item => {
      const categoryMatch = activeFilter === 'all' || item.dataset.categories.split(' ').includes(activeFilter);
      const textMatch = !query || item.dataset.search.toLowerCase().includes(query) || item.textContent.toLowerCase().includes(query);
      item.hidden = !(categoryMatch && textMatch);
      if (!item.hidden) visible += 1;
    });
    resultCount.textContent = visible;
    empty.hidden = visible !== 0;
  }
  chips.forEach(chip => chip.addEventListener('click', () => {
    activeFilter = chip.dataset.filter;
    chips.forEach(item => {
      item.classList.toggle('active', item === chip);
      item.setAttribute('aria-pressed', String(item === chip));
    });
    updateResults();
  }));
  search.addEventListener('input', updateResults);
  document.querySelector('.clear-filters').addEventListener('click', () => {
    search.value = '';
    activeFilter = 'all';
    chips.forEach(chip => chip.classList.toggle('active', chip.dataset.filter === 'all'));
    updateResults();
  });
  document.addEventListener('keydown', event => {
    if (event.key === '/' && document.activeElement !== search) { event.preventDefault(); search.focus(); }
    if (event.key === 'Escape') {
      themeMenu.hidden = true;
      themeTrigger.setAttribute('aria-expanded', 'false');
      nav.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
    }
  });
  document.querySelector('.print-button').addEventListener('click', () => window.print());
  document.querySelector('.print-button-mobile').addEventListener('click', () => window.print());
  document.querySelector('#current-year').textContent = new Date().getFullYear();
  updateResults();
})();
