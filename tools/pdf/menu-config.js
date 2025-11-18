// Shared menu configuration for PDF Toolbox
const PDF_TOOLBOX_ABILITIES = [
  { title: 'Images → PDF', desc: 'Convert images to PDF', tags: ['converter', 'image'], url: 'images-to-pdf', icon: '🖼️' },
  { title: 'TXT → PDF', desc: 'Convert text to PDF', tags: ['converter', 'text'], url: 'txt-to-pdf', icon: '📝' },
  { title: 'DOCX → PDF', desc: 'Convert Word to PDF', tags: ['converter', 'document'], url: 'docx-to-pdf', icon: '📄' },
  { title: 'PPTX → PDF', desc: 'Convert slides to PDF', tags: ['converter', 'presentation'], url: 'pptx-to-pdf', icon: '📊' },
  { title: 'Excel → PDF', desc: 'Convert spreadsheet to PDF', tags: ['converter', 'spreadsheet'], url: 'excel-to-pdf', icon: '📈' },
  { title: 'PDF → Images', desc: 'Extract pages as images', tags: ['extraction', 'image'], url: 'pdf-to-images', icon: '🖼️' },
  { title: 'PDF → TXT', desc: 'Extract text from PDF', tags: ['extraction', 'text'], url: 'pdf-to-txt', icon: '🔤' },
  { title: 'PDF → DOCX', desc: 'Convert PDF to Word', tags: ['extraction', 'document'], url: 'pdf-to-docx', icon: '🧾' },
  { title: 'PDF → PPTX', desc: 'Convert PDF to slides', tags: ['extraction', 'presentation'], url: 'pdf-to-pptx', icon: '📊' },
  { title: 'PDF → Excel', desc: 'Convert PDF to spreadsheet', tags: ['extraction', 'spreadsheet'], url: 'pdf-to-excel', icon: '📈' },
  { title: 'Sign PDF', desc: 'Add digital signature', tags: ['utility', 'security'], url: 'pdf-sign', icon: '✍️' },
  { title: 'Compress PDF', desc: 'Reduce PDF file size', tags: ['utility', 'optimize'], url: 'pdf-compress', icon: '🗜️' },
  { title: 'Add Password', desc: 'Protect PDF with password (info)', tags: ['utility', 'security'], url: 'pdf-password', icon: '🔒' },
  { title: 'Sanitize PDF', desc: 'Remove metadata and personal info', tags: ['utility', 'privacy'], url: 'pdf-sanitize', icon: '🧹' },
  { title: 'Merge PDF', desc: 'Merge multiple PDFs into one', tags: ['utility', 'merge'], url: 'pdf-merge', icon: '🔗' },
  { title: 'Watermark', desc: 'Add watermark to PDF', tags: ['utility', 'security'], url: 'pdf-watermark', icon: '💧' },
  { title: 'Rotate PDF', desc: 'Rotate PDF pages', tags: ['utility', 'editing'], url: 'pdf-rotate', icon: '🔄' }
];

function populateToolsDropdown(basePath = '') {
  const dropdown = document.getElementById('toolsDropdown');
  if (!dropdown) return;
  
  const pathPrefix = basePath ? basePath + '/' : '';
  dropdown.innerHTML = '<div class="tools-grid">' + 
    PDF_TOOLBOX_ABILITIES.map(a => `<a href="${pathPrefix}${a.url}/" class="tool-item">${a.title}</a>`).join('') +
    '</div>';
}

