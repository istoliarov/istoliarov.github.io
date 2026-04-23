(function () {
  const app = window.PDFToolboxApp = window.PDFToolboxApp || {};

  const runtimeState = {
    'images-to-pdf': { status: 'stable', note: 'Supports drag-to-reorder, multiple formats, and fit options.' },
    'pdf-to-txt': { status: 'stable', note: 'Extracts selectable text from machine-readable PDFs in-browser.' },
    'pdf-to-images': { status: 'stable', note: 'Renders each page as a PNG; download individually or as a ZIP.' },
    'pdf-sanitize': { status: 'stable', note: 'Clears metadata fields and optionally flattens form fields locally.' },
    'pdf-rotate': { status: 'partial', note: 'Rotates pages; best for visual layout, not structural page edits.' },
    'pdf-watermark': { status: 'partial', note: 'Adds diagonal text watermark to every page.' },
    'pdf-sign': { status: 'partial', note: 'Adds a visual text annotation — not a cryptographic digital signature.' },
    'pdf-merge': { status: 'partial', note: 'Combines multiple PDFs into one file using in-browser processing.' },
    'pdf-compress': { status: 'partial', note: 'Reduces size by re-rendering pages as JPEG images.' },
    'docx-to-pdf': { status: 'partial', note: 'Converts Word documents via browser HTML reflow; complex layouts may vary.' },
    'txt-to-pdf': { status: 'stable', note: 'Converts plain text to a paginated PDF with configurable layout.' },
    'excel-to-pdf': { status: 'partial', note: 'Reads CSV and plain-text tabular data; binary XLSX support is limited.' },
    'pptx-to-pdf': { status: 'partial', note: 'Extracts slide text from PPTX XML; image-heavy slides are text-only.' },
    'pdf-to-docx': { status: 'partial', note: 'Exports extracted text as a DOC file; layout reconstruction is limited.' },
    'pdf-to-excel': { status: 'partial', note: 'Exports page text as CSV rows; table structure is best-effort.' },
    'pdf-to-pptx': { status: 'partial', note: 'Exports each page as an image slide; requires PptxGenJS to be loaded.' },
    'pdf-password': { status: 'limited', note: 'Provides a workflow checklist; browser-side AES encryption is not available.' }
  };

  function getGlobalAbilities() {
    return Array.isArray(window.PDF_TOOLBOX_ABILITIES) ? window.PDF_TOOLBOX_ABILITIES : [];
  }

  app.getTools = function getTools() {
    return getGlobalAbilities().map(function (tool) {
      const state = runtimeState[tool.url] || { status: 'planned', note: 'Coming soon.' };
      return Object.assign({}, tool, state, {
        route: '#/tool/' + tool.url
      });
    });
  };

  app.getToolBySlug = function getToolBySlug(slug) {
    const tools = app.getTools();
    for (let i = 0; i < tools.length; i += 1) {
      if (tools[i].url === slug) return tools[i];
    }
    return null;
  };

  app.getStatusLabel = function getStatusLabel(status) {
    switch (status) {
      case 'stable':
        return 'Ready';
      case 'partial':
        return 'Limited';
      case 'limited':
        return 'Guidance';
      case 'broken':
        return 'Unavailable';
      default:
        return 'Coming soon';
    }
  };
})();
