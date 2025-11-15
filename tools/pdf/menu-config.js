// Shared menu configuration for PDF Toolbox
const PDF_TOOLBOX_ABILITIES = [
  { title: 'Images → PDF', desc: 'Convert images to PDF', tags: ['converter', 'image'], url: 'images-to-pdf' },
  { title: 'TXT → PDF', desc: 'Convert text to PDF', tags: ['converter', 'text'], url: 'txt-to-pdf' },
  { title: 'DOCX → PDF', desc: 'Convert Word to PDF', tags: ['converter', 'document'], url: 'docx-to-pdf' },
  { title: 'PPTX → PDF', desc: 'Convert slides to PDF', tags: ['converter', 'presentation'], url: 'pptx-to-pdf' },
  { title: 'Excel → PDF', desc: 'Convert spreadsheet to PDF', tags: ['converter', 'spreadsheet'], url: 'excel-to-pdf' },
  { title: 'PDF → Images', desc: 'Extract pages as images', tags: ['extraction', 'image'], url: 'pdf-to-images' },
  { title: 'PDF → TXT', desc: 'Extract text from PDF', tags: ['extraction', 'text'], url: 'pdf-to-txt' },
  { title: 'PDF → DOCX', desc: 'Convert PDF to Word', tags: ['extraction', 'document'], url: 'pdf-to-docx' },
  { title: 'PDF → PPTX', desc: 'Convert PDF to slides', tags: ['extraction', 'presentation'], url: 'pdf-to-pptx' },
  { title: 'PDF → Excel', desc: 'Convert PDF to spreadsheet', tags: ['extraction', 'spreadsheet'], url: 'pdf-to-excel' },
  { title: 'Sign PDF', desc: 'Add digital signature', tags: ['utility', 'security'], url: 'pdf-sign' },
  { title: 'Watermark', desc: 'Add watermark to PDF', tags: ['utility', 'security'], url: 'pdf-watermark' },
  { title: 'Rotate PDF', desc: 'Rotate PDF pages', tags: ['utility', 'editing'], url: 'pdf-rotate' }
];

function populateToolsDropdown(basePath = '') {
  const dropdown = document.getElementById('toolsDropdown');
  if (!dropdown) return;
  
  const pathPrefix = basePath ? basePath + '/' : '';
  dropdown.innerHTML = '<div class="tools-grid">' + 
    PDF_TOOLBOX_ABILITIES.map(a => `<a href="${pathPrefix}${a.url}/" class="tool-item">${a.title}</a>`).join('') +
    '</div>';
}

