(function () {
  const app = window.PDFToolboxApp = window.PDFToolboxApp || {};

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getActiveTag() {
    return document.body.getAttribute('data-active-tag') || '';
  }

  function setActiveTag(tag) {
    if (tag) {
      document.body.setAttribute('data-active-tag', tag);
    } else {
      document.body.removeAttribute('data-active-tag');
    }
  }

  function renderTags(tools, activeTag) {
    const tagMap = {};
    const tags = [];
    for (let i = 0; i < tools.length; i += 1) {
      const toolTags = tools[i].tags || [];
      for (let j = 0; j < toolTags.length; j += 1) {
        if (!tagMap[toolTags[j]]) {
          tagMap[toolTags[j]] = true;
          tags.push(toolTags[j]);
        }
      }
    }
    tags.sort();

    return '\n      <div class="spa-tags" role="tablist" aria-label="Tool filters">\n        <button class="spa-tag' + (activeTag ? '' : ' is-active') + '" data-tag="all" type="button">All</button>\n        ' + tags.map(function (tag) {
      return '<button class="spa-tag' + (activeTag === tag ? ' is-active' : '') + '" data-tag="' + escapeHtml(tag) + '" type="button">' + escapeHtml(tag) + '</button>';
    }).join('') + '\n      </div>\n    ';
  }

  function renderHome() {
    const activeTag = getActiveTag();
    const tools = app.getTools();
    const filtered = activeTag ? tools.filter(function (tool) {
      return (tool.tags || []).indexOf(activeTag) !== -1;
    }) : tools;

    return '\n      <section class="spa-hero glass-panel">\n        <div class="spa-hero-copy">\n          <p class="spa-eyebrow">Private Browser Tools</p>\n          <h1>PDF Toolbox</h1>\n          <p class="lead">All tools run directly in your browser. Your files are never uploaded to a server.</p>\n        </div>\n        <div class="spa-hero-meta">\n          <div class="spa-stat">\n            <strong>' + tools.length + '</strong>\n            <span>PDF tools available</span>\n          </div>\n          <div class="spa-stat">\n            <strong>Local-first</strong>\n            <span>All processing stays in your browser</span>\n          </div>\n        </div>\n      </section>\n\n      <section class="spa-section">\n        <div class="spa-section-head">\n          <h2>Tool Catalog</h2>\n          <p>Choose a tool below. Everything runs locally — no account needed, no data leaves your device.</p>\n        </div>\n        ' + renderTags(tools, activeTag) + '\n        <div class="spa-grid">\n          ' + filtered.map(function (tool) {
      return '\n            <article class="spa-tool-card glass-panel" data-slug="' + escapeHtml(tool.url) + '">\n              <button class="spa-tool-link" type="button" data-route="' + escapeHtml(tool.route) + '">\n                <span class="spa-tool-icon" aria-hidden="true">' + (tool.icon || 'PDF') + '</span>\n                <span class="spa-tool-title">' + escapeHtml(tool.title) + '</span>\n                <span class="spa-tool-desc">' + escapeHtml(tool.desc) + '</span>\n              </button>\n              <div class="spa-tool-meta">\n                <span class="spa-status is-' + escapeHtml(tool.status) + '">' + escapeHtml(app.getStatusLabel(tool.status)) + '</span>\n                <span class="spa-tool-note">' + escapeHtml(tool.note) + '</span>\n              </div>\n            </article>\n          ';
    }).join('') + '\n        </div>\n      </section>\n    ';
  }

  function renderTool(slug) {
    const tool = app.getToolBySlug(slug);

    if (!tool) {
      return '\n        <section class="glass-panel spa-detail">\n          <p class="spa-eyebrow">Not Found</p>\n          <h1>Tool not found</h1>\n          <p class="lead">The requested tool is not registered in the current PDF toolbox index.</p>\n          <div class="spa-actions">\n            <button class="spa-button" type="button" data-route="#/">Back to catalog</button>\n          </div>\n        </section>\n      ';
    }

    const migratedTool = app.renderMigratedTool ? app.renderMigratedTool(slug) : '';

    return '\n      <section class="glass-panel spa-detail">\n        <p class="spa-eyebrow">' + escapeHtml(app.getStatusLabel(tool.status)) + '</p>\n        <div class="spa-detail-head">\n          <div class="spa-tool-icon is-large" aria-hidden="true">' + (tool.icon || 'PDF') + '</div>\n          <div>\n            <h1>' + escapeHtml(tool.title) + '</h1>\n            <p class="lead">' + escapeHtml(tool.desc) + '</p>\n          </div>\n        </div>\n        <div class="spa-status-row">\n          <span class="spa-status is-' + escapeHtml(tool.status) + '">' + escapeHtml(app.getStatusLabel(tool.status)) + '</span>\n          <span class="spa-tool-note">' + escapeHtml(tool.note) + '</span>\n        </div>\n        <div class="spa-tag-row">' + (tool.tags || []).map(function (tag) {
      return '<span class="spa-tag-chip">' + escapeHtml(tag) + '</span>';
    }).join('') + '</div>\n        <div class="spa-actions">\n          <button class="spa-button is-secondary" type="button" data-route="#/">Back to catalog</button>\n        </div>\n        <p class="spa-detail-note">Your file is processed locally in your browser and is never uploaded to any server.</p>\n      </section>\n      ' + migratedTool;
  }

  app.renderApp = function renderApp(route) {
    const root = document.getElementById('app');
    if (!root) return;

    root.innerHTML = '\n      <div class="spa-shell">\n        <header class="spa-topbar glass-bar">\n          <button class="spa-brand" type="button" data-route="#/">PDF Toolbox</button>\n          <nav class="spa-nav" aria-label="Primary">\n            <button class="spa-nav-link" type="button" data-route="#/">Catalog</button>\n          </nav>\n        </header>\n        <main class="spa-main">\n          ' + (route.name === 'tool' ? renderTool(route.slug) : renderHome()) + '\n        </main>\n        <footer class="spa-footer">\n          <span>PDF tools that run entirely in your browser. No uploads, no accounts, no tracking.</span>\n          <a href="./copyright/">Copyright & License</a>\n        </footer>\n      </div>\n    ';

    const routeElements = root.querySelectorAll('[data-route]');
    for (let i = 0; i < routeElements.length; i += 1) {
      routeElements[i].addEventListener('click', function () {
        const routeTarget = this.getAttribute('data-route');
        if (routeTarget) app.navigateTo(routeTarget);
      });
    }

    const tagElements = root.querySelectorAll('[data-tag]');
    for (let i = 0; i < tagElements.length; i += 1) {
      tagElements[i].addEventListener('click', function () {
        const tag = this.getAttribute('data-tag');
        setActiveTag(tag === 'all' ? '' : (tag || ''));
        app.renderApp({ name: 'home' });
      });
    }

    if (route.name === 'tool' && app.mountMigratedTool) {
      app.mountMigratedTool(route.slug);
    }
  };
})();
