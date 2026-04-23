(function () {
  const app = window.PDFToolboxApp = window.PDFToolboxApp || {};

  function render() {
    if (typeof app.renderApp === 'function' && typeof app.getRoute === 'function') {
      app.renderApp(app.getRoute());
    }
  }

  window.addEventListener('hashchange', render);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }

  render();
})();
