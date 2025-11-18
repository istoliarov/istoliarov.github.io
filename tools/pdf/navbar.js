// Insert navbar HTML and initialize it
function loadNavbar(homeHref = './') {
  // If a nav config exists (PDF_TOOLBOX_NAV), render from it; otherwise fall back to the original static markup.
  let navHtml = '';

  if (typeof PDF_TOOLBOX_NAV !== 'undefined' && Array.isArray(PDF_TOOLBOX_NAV)) {
    navHtml += '<nav class="navbar"><div class="nav-content">';
    navHtml += `<h2><a class="brand" href="${homeHref}">PDF Toolbox</a></h2>`;
    navHtml += '<div class="navbar-menu">';

    PDF_TOOLBOX_NAV.forEach(item => {
      if (item.dropdown) {
        navHtml += `
          <div class="navbar-menu-item">
            <a href="javascript:void(0)">${item.title} ▼</a>
            <div class="tools-dropdown" id="toolsDropdown"></div>
          </div>`;
      } else {
        const href = (item.href === undefined || item.href === null) ? homeHref : (homeHref + item.href);
        // mark 'Main' when href is empty as current by default
        const isCurrent = (item.href === '' || item.href === '/' || item.href === './');
        navHtml += `<a href="${href}" class="${isCurrent ? 'current' : ''}">${item.title}</a>`;
      }
    });

    navHtml += '</div></div></nav>';
  } else {
    // original fallback markup
    navHtml = `
      <nav class="navbar">
        <div class="nav-content">
          <h2><a class="brand" href="${homeHref}">PDF Toolbox</a></h2>
          <div class="navbar-menu">
            <a href="${homeHref}" class="current">Main</a>
            <div class="navbar-menu-item">
              <a href="javascript:void(0)">Tools ▼</a>
              <div class="tools-dropdown" id="toolsDropdown"></div>
            </div>
          </div>
        </div>
      </nav>
    `;
  }

  // Insert at the beginning of body
  const navContainer = document.getElementById('navbar-container');
  if (navContainer) {
    navContainer.innerHTML = navHtml;
  } else {
    document.body.insertAdjacentHTML('afterbegin', navHtml);
  }

  // Initialize toolbar dropdown
  if (typeof populateToolsDropdown === 'function') {
    populateToolsDropdown();
  }
}

// Auto-load navbar when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Determine home link based on current path
    const pathDepth = window.location.pathname.split('/').filter(p => p).length;
    const homeHref = pathDepth > 3 ? '../' : './';
    loadNavbar(homeHref);
  });
} else {
  // DOM already loaded
  const pathDepth = window.location.pathname.split('/').filter(p => p).length;
  const homeHref = pathDepth > 3 ? '../' : './';
  loadNavbar(homeHref);
}
