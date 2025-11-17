// Insert navbar HTML and initialize it
function loadNavbar(homeHref = './') {
  const navbarHTML = `
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
  
  // Insert at the beginning of body
  const navContainer = document.getElementById('navbar-container');
  if (navContainer) {
    navContainer.innerHTML = navbarHTML;
  } else {
    // Fallback: insert before first child
    document.body.insertAdjacentHTML('afterbegin', navbarHTML);
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
