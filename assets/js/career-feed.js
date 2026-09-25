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

  const navLinks = [...nav.querySelectorAll('a[href^="#"]')];
  const navSections = new Map(navLinks.map(link => {
    const id = link.getAttribute('href').slice(1);
    return [id, document.getElementById(id)];
  }).filter(([, section]) => section));
  let lockedNavTarget = null;
  let scrollEndTimer = 0;
  let scrollFrame = 0;

  function setActiveNav(id) {
    navLinks.forEach(link => {
      const active = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  function normalDocumentTop(element) {
    let top = 0;
    let node = element;
    while (node) {
      top += node.offsetTop;
      node = node.offsetParent;
    }
    return top;
  }

  function hashSection() {
    const id = window.location.hash.slice(1);
    return navSections.has(id) ? id : '';
  }

  function activeSectionFromScroll() {
    if (lockedNavTarget) return lockedNavTarget;

    const header = document.querySelector('.site-header');
    const headerOffset = (header ? header.offsetHeight : 0) + 48;
    const scrollPoint = window.scrollY + headerOffset;
    const education = navSections.get('education');
    const awards = navSections.get('awards');
    const lowerSectionTop = Math.min(
      education ? normalDocumentTop(education) : Number.POSITIVE_INFINITY,
      awards ? normalDocumentTop(awards) : Number.POSITIVE_INFINITY
    );
    const currentHash = hashSection();
    const atPageBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;

    if (atPageBottom) {
      return currentHash === 'education' || currentHash === 'awards' ? currentHash : 'awards';
    }
    if (scrollPoint >= lowerSectionTop) {
      return currentHash === 'awards' ? 'awards' : 'education';
    }
    if ((currentHash === 'skills' || currentHash === 'about') && scrollPoint >= normalDocumentTop(navSections.get('experience'))) {
      return currentHash;
    }
    return 'experience';
  }

  function syncActiveNav() {
    scrollFrame = 0;
    setActiveNav(activeSectionFromScroll());
  }

  navLinks.forEach(link => link.addEventListener('click', () => {
    lockedNavTarget = link.getAttribute('href').slice(1);
    setActiveNav(lockedNavTarget);
  }));

  window.addEventListener('scroll', () => {
    window.clearTimeout(scrollEndTimer);
    scrollEndTimer = window.setTimeout(() => {
      lockedNavTarget = null;
      syncActiveNav();
    }, 180);
    if (!scrollFrame) scrollFrame = window.requestAnimationFrame(syncActiveNav);
  }, { passive: true });

  window.addEventListener('hashchange', () => {
    const id = hashSection();
    if (id) setActiveNav(id);
  });

  syncActiveNav();

  const search = document.querySelector('#experience-search');
  const chips = [...document.querySelectorAll('[data-filter]')];
  const items = [...document.querySelectorAll('.experience-item')];
  const totalExperience = document.querySelector('.experience-total');

  function parseYearMonth(value) {
    const match = /^(\d{4})-(\d{2})$/.exec(value || '');
    if (!match) return null;
    return { year: Number(match[1]), month: Number(match[2]) };
  }

  function inclusiveMonthCount(start, end) {
    return Math.max(1, (end.year - start.year) * 12 + end.month - start.month + 1);
  }

  function formatDuration(totalMonths) {
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;
    const parts = [];
    if (years) parts.push(`${years} ${years === 1 ? 'yr' : 'yrs'}`);
    if (months) parts.push(`${months} ${months === 1 ? 'mo' : 'mos'}`);
    return parts.join(' ') || '1 mo';
  }

  function updateExperienceDurations() {
    const now = new Date();
    const currentMonth = { year: now.getFullYear(), month: now.getMonth() + 1 };

    items.forEach(item => {
      const start = parseYearMonth(item.dataset.start);
      const end = parseYearMonth(item.dataset.end) || currentMonth;
      const output = item.querySelector('[data-role-duration]');
      if (!start || !output) return;

      const formatted = formatDuration(inclusiveMonthCount(start, end));
      const approximate = item.dataset.durationApproximate === 'true';
      output.querySelector('[data-duration-label]').textContent = `${approximate ? '~' : ''}${formatted}`;
      output.setAttribute('aria-label', `${approximate ? 'Approximately ' : ''}${formatted} in this role`);
    });

    const careerStart = parseYearMonth(totalExperience?.dataset.careerStart);
    if (careerStart && totalExperience) {
      const formatted = formatDuration(inclusiveMonthCount(careerStart, currentMonth));
      totalExperience.querySelector('strong').textContent = formatted;
      totalExperience.setAttribute('aria-label', `Total professional experience: ${formatted}`);
    }
  }
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
  updateExperienceDurations();
  updateResults();
})();
