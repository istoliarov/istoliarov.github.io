(function () {
  const app = window.PDFToolboxApp = window.PDFToolboxApp || {};

  app.getRoute = function getRoute() {
    const hash = window.location.hash || '#/';
    const normalized = hash.charAt(0) === '#' ? hash.slice(1) : hash;
    const parts = normalized.split('/').filter(Boolean);

    if (parts[0] === 'tool' && parts[1]) {
      return { name: 'tool', slug: parts[1] };
    }

    return { name: 'home' };
  };

  app.navigateTo = function navigateTo(route) {
    if (window.location.hash !== route) {
      window.location.hash = route;
    }
  };
})();
