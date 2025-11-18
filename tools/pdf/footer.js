// Insert footer HTML and initialize it
function loadFooter() {
  const footerHTML = `
    <div class="page-footer">Created in 2025 by Igor Stoliarov<br><small><a href="./copyright/" style="color:#666;text-decoration:none;font-size:.75rem">© Copyright & License</a></small></div>
    <div class="seo-bar"><span class="seo-text">PDF Toolbox — client-side PDF utilities. Convert images, text and Word to PDF and back. Files never leave your browser.</span></div>
  `;
  const footerContainer = document.getElementById('footer-container');
  if (footerContainer) {
    footerContainer.innerHTML = footerHTML;
  } else {
    document.body.insertAdjacentHTML('beforeend', footerHTML);
  }
}

// Auto-load footer when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadFooter);
} else {
  loadFooter();
}
