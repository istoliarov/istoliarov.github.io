(function () {
  const app = window.PDFToolboxApp = window.PDFToolboxApp || {};

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 10000);
  }

  function setMessage(target, type, text) {
    if (!target) return;
    if (!text) {
      target.innerHTML = '';
      return;
    }
    target.innerHTML = '<div class="message ' + type + '">' + text + '</div>';
  }

  function setProgress(target, percent, text) {
    if (!target) return;
    target.innerHTML = '<div class="progress-container"><div class="progress-bar"><div class="progress-fill" style="width:' + percent + '%"></div></div><div class="progress-text">' + text + '</div></div>';
  }

  function clearProgress(target) {
    if (target) target.innerHTML = '';
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatFileSize(bytes) {
    if (!bytes) return '0 Bytes';
    const units = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + units[i];
  }

  function getPdfJsLib() {
    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    if (!pdfjsLib) return null;
    if (!window.__PDF_TOOLBOX_PDFJS_WORKER_SET__) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = './dist/pdf.js/2.16.105/pdf.worker.min.js';
      window.__PDF_TOOLBOX_PDFJS_WORKER_SET__ = true;
    }
    return pdfjsLib;
  }

  function getPdfLib() {
    return window.PDFLib || null;
  }

  function getJSZip() {
    return window.JSZip || null;
  }

  function loadImageFile(file) {
    return new Promise(function (resolve, reject) {
      const reader = new FileReader();
      reader.onload = function () {
        const image = new Image();
        image.onload = function () {
          resolve(image);
        };
        image.onerror = reject;
        image.src = String(reader.result || '');
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function dataUrlToBlob(dataUrl) {
    const arr = dataUrl.split(',');
    const mimeMatch = arr[0] && arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    const binary = atob(arr[1] || '');
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new Blob([bytes], { type: mime });
  }

  function uniqueId(prefix) {
    return prefix + '-' + Math.random().toString(36).slice(2, 9);
  }

  async function extractPdfText(pdfjsLib, arrayBuffer) {
    const doc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let output = '';
    for (let pageIndex = 1; pageIndex <= doc.numPages; pageIndex += 1) {
      const page = await doc.getPage(pageIndex);
      const content = await page.getTextContent();
      const text = content.items.map(function (item) {
        return item.str;
      }).join(' ');
      output += text + '\n\n';
    }
    return { text: output, pages: doc.numPages };
  }

  function setupDropzone(dropzoneEl, fileInputEl, onFiles) {
    ['dragenter', 'dragover'].forEach(function (ev) {
      dropzoneEl.addEventListener(ev, function (e) { e.preventDefault(); e.stopPropagation(); dropzoneEl.classList.add('is-dragover'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      dropzoneEl.addEventListener(ev, function (e) { e.preventDefault(); e.stopPropagation(); dropzoneEl.classList.remove('is-dragover'); });
    });
    dropzoneEl.addEventListener('click', function () { fileInputEl.click(); });
    dropzoneEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputEl.click(); }
    });
    dropzoneEl.addEventListener('drop', function (e) { onFiles(e.dataTransfer && e.dataTransfer.files); });
    fileInputEl.addEventListener('change', function (e) { onFiles(e.target.files); fileInputEl.value = ''; });
  }

  app.renderMigratedTool = function renderMigratedTool(slug) {
    if (slug === 'txt-to-pdf') {
      return `
        <section class="glass-panel spa-detail spa-tool-runtime">
          <p class="spa-eyebrow">Browser Tool</p>
          <div class="spa-detail-head">
            <div class="spa-tool-icon is-large" aria-hidden="true">📝</div>
            <div>
              <h1>TXT to PDF</h1>
              <p class="lead">Convert plain text into a PDF directly inside the new SPA shell.</p>
            </div>
          </div>
          <div class="spa-runtime-grid">
            <section class="spa-runtime-card">
              <label class="spa-field-label" for="spaTxtFile">Upload text file</label>
              <input id="spaTxtFile" type="file" accept="text/plain,.txt" class="spa-input">
              <label class="spa-field-label" for="spaTxtContent">Or paste text</label>
              <textarea id="spaTxtContent" class="spa-textarea" rows="12" placeholder="Paste plain text here"></textarea>
            </section>
            <section class="spa-runtime-card">
              <div class="spa-form-grid">
                <label class="spa-field">
                  <span class="spa-field-label">Page size</span>
                  <select id="spaTxtPageSize" class="spa-input">
                    <option value="a4">A4</option>
                    <option value="letter">Letter</option>
                    <option value="legal">Legal</option>
                    <option value="a3">A3</option>
                    <option value="a5">A5</option>
                  </select>
                </label>
                <label class="spa-field">
                  <span class="spa-field-label">Orientation</span>
                  <select id="spaTxtOrientation" class="spa-input">
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </label>
                <label class="spa-field">
                  <span class="spa-field-label">Font size</span>
                  <input id="spaTxtFontSize" class="spa-input" type="number" value="12" min="6" max="36">
                </label>
                <label class="spa-field">
                  <span class="spa-field-label">Margin (pt)</span>
                  <input id="spaTxtMargin" class="spa-input" type="number" value="40" min="10" max="100">
                </label>
              </div>
              <div class="spa-actions">
                <button class="spa-button" id="spaTxtConvert" type="button">Convert to PDF</button>
                <button class="spa-button is-secondary" id="spaTxtClear" type="button">Clear</button>
              </div>
              <div id="spaTxtMeta" class="spa-runtime-meta"></div>
              <div id="spaTxtMessage"></div>
              <div id="spaTxtProgress"></div>
            </section>
          </div>
        </section>`;
    }

    if (slug === 'pdf-to-txt') {
      return `
        <section class="glass-panel spa-detail spa-tool-runtime">
          <p class="spa-eyebrow">Browser Tool</p>
          <div class="spa-detail-head">
            <div class="spa-tool-icon is-large" aria-hidden="true">🔤</div>
            <div>
              <h1>PDF to TXT</h1>
              <p class="lead">Extract selectable text from PDF pages and download it as a plain text file in-browser.</p>
            </div>
          </div>
          <div class="spa-runtime-grid">
            <section class="spa-runtime-card">
              <label class="spa-field-label" for="spaPdfTxtFile">Upload PDF file</label>
              <div id="spaPdfTxtDropzone" class="spa-dropzone" role="button" tabindex="0" aria-controls="spaPdfTxtFile">
                <div class="spa-dropzone-icon" aria-hidden="true">📄</div>
                <div>
                  <p class="spa-dropzone-title">Drop a PDF here or click to browse</p>
                  <p class="spa-dropzone-note">Text extraction works best on machine-readable PDFs</p>
                </div>
              </div>
              <input id="spaPdfTxtFile" type="file" accept="application/pdf" class="spa-input" hidden>
              <div id="spaPdfTxtMeta" class="spa-runtime-meta"></div>
            </section>
            <section class="spa-runtime-card">
              <div class="spa-inline-actions">
                <button class="spa-button" id="spaPdfTxtExtract" type="button" disabled>Extract Text</button>
                <button class="spa-button is-secondary" id="spaPdfTxtDownload" type="button" disabled>Download TXT</button>
                <button class="spa-button is-secondary" id="spaPdfTxtClear" type="button">Clear</button>
              </div>
              <label class="spa-field-label" for="spaPdfTxtPreview">Preview</label>
              <textarea id="spaPdfTxtPreview" class="spa-textarea spa-output-text" readonly placeholder="Extracted text preview will appear here"></textarea>
              <div id="spaPdfTxtMessage"></div>
              <div id="spaPdfTxtProgress"></div>
            </section>
          </div>
        </section>`;
    }

    if (slug === 'images-to-pdf') {
      return `
        <section class="glass-panel spa-detail spa-tool-runtime">
          <p class="spa-eyebrow">Browser Tool</p>
          <div class="spa-detail-head">
            <div class="spa-tool-icon is-large" aria-hidden="true">🖼️</div>
            <div>
              <h1>Images to PDF</h1>
              <p class="lead">Build a single PDF from multiple images, reorder pages, and download instantly in the browser.</p>
            </div>
          </div>
          <div class="spa-runtime-grid">
            <section class="spa-runtime-card">
              <label class="spa-field-label" for="spaImagesPdfInput">Upload images</label>
              <div id="spaImagesDropzone" class="spa-dropzone" role="button" tabindex="0" aria-controls="spaImagesPdfInput">
                <div class="spa-dropzone-icon" aria-hidden="true">📁</div>
                <div>
                  <p class="spa-dropzone-title">Drop image files here or click to browse</p>
                  <p class="spa-dropzone-note">Supports JPG, PNG, GIF, WebP and most browser-readable formats</p>
                </div>
              </div>
              <input id="spaImagesPdfInput" type="file" accept="image/*" multiple hidden>
              <div id="spaImagesPreview" class="spa-images-preview"></div>
            </section>
            <section class="spa-runtime-card">
              <div class="spa-form-grid">
                <label class="spa-field">
                  <span class="spa-field-label">Page size</span>
                  <select id="spaImagesPageSize" class="spa-input">
                    <option value="a4">A4</option>
                    <option value="letter">Letter</option>
                    <option value="legal">Legal</option>
                    <option value="a3">A3</option>
                    <option value="a5">A5</option>
                  </select>
                </label>
                <label class="spa-field">
                  <span class="spa-field-label">Orientation</span>
                  <select id="spaImagesOrientation" class="spa-input">
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </label>
                <label class="spa-field">
                  <span class="spa-field-label">Fit mode</span>
                  <select id="spaImagesFitMode" class="spa-input">
                    <option value="fit">Fit to page</option>
                    <option value="original">Original size</option>
                    <option value="stretch">Stretch to fill</option>
                  </select>
                </label>
              </div>
              <div id="spaImagesLayoutPreview" class="spa-layout-preview" hidden>
                <p class="spa-preview-label">Page layout preview</p>
                <canvas id="spaImagesLayoutCanvas" class="spa-preview-canvas"></canvas>
              </div>
              <div class="spa-inline-actions">
                <button class="spa-button" id="spaImagesConvert" type="button" disabled>Convert to PDF</button>
                <button class="spa-button is-secondary" id="spaImagesClear" type="button">Clear</button>
              </div>
              <div id="spaImagesMeta" class="spa-runtime-meta"></div>
              <div id="spaImagesMessage"></div>
              <div id="spaImagesProgress"></div>
            </section>
          </div>
        </section>`;
    }

    if (slug === 'pdf-to-images') {
      return `
        <section class="glass-panel spa-detail spa-tool-runtime">
          <p class="spa-eyebrow">Browser Tool</p>
          <div class="spa-detail-head">
            <div class="spa-tool-icon is-large" aria-hidden="true">🖼️</div>
            <div>
              <h1>PDF to Images</h1>
              <p class="lead">Render PDF pages as PNG images in-browser, download per-page or bundle all images as ZIP.</p>
            </div>
          </div>
          <div class="spa-runtime-grid">
            <section class="spa-runtime-card">
              <label class="spa-field-label" for="spaPdfImagesFile">Upload PDF file</label>
              <div id="spaPdfImagesDropzone" class="spa-dropzone" role="button" tabindex="0" aria-controls="spaPdfImagesFile">
                <div class="spa-dropzone-icon" aria-hidden="true">📄</div>
                <div>
                  <p class="spa-dropzone-title">Drop a PDF here or click to browse</p>
                  <p class="spa-dropzone-note">Rendered images are generated locally and never uploaded</p>
                </div>
              </div>
              <input id="spaPdfImagesFile" type="file" accept="application/pdf" hidden>
              <div id="spaPdfImagesMeta" class="spa-runtime-meta"></div>
            </section>
            <section class="spa-runtime-card">
              <div class="spa-form-grid">
                <label class="spa-field">
                  <span class="spa-field-label">Image scale</span>
                  <select id="spaPdfImagesScale" class="spa-input">
                    <option value="1.0">1x (Standard)</option>
                    <option value="1.5" selected>1.5x (Recommended)</option>
                    <option value="2.0">2x (High quality)</option>
                    <option value="3.0">3x (Very high quality)</option>
                  </select>
                </label>
              </div>
              <div class="spa-inline-actions">
                <button class="spa-button" id="spaPdfImagesExtract" type="button" disabled>Extract Pages</button>
                <button class="spa-button is-secondary" id="spaPdfImagesZip" type="button" disabled>Download ZIP</button>
                <button class="spa-button is-secondary" id="spaPdfImagesClear" type="button">Clear</button>
              </div>
              <div id="spaPdfImagesMessage"></div>
              <div id="spaPdfImagesProgress"></div>
            </section>
          </div>
          <div id="spaPdfImagesThumbs" class="spa-thumbnails"></div>
        </section>`;
    }

    if (slug === 'pdf-sanitize') {
      return `
        <section class="glass-panel spa-detail spa-tool-runtime">
          <p class="spa-eyebrow">Browser Tool</p>
          <div class="spa-detail-head">
            <div class="spa-tool-icon is-large" aria-hidden="true">🧹</div>
            <div>
              <h1>Sanitize PDF</h1>
              <p class="lead">Remove common metadata fields and optionally flatten form fields in a local browser-only workflow.</p>
            </div>
          </div>
          <div class="spa-runtime-grid">
            <section class="spa-runtime-card">
              <label class="spa-field-label" for="spaSanitizeFile">Upload PDF file</label>
              <div id="spaSanitizeDropzone" class="spa-dropzone" role="button" tabindex="0" aria-controls="spaSanitizeFile">
                <div class="spa-dropzone-icon" aria-hidden="true">🧾</div>
                <div>
                  <p class="spa-dropzone-title">Drop a PDF here or click to browse</p>
                  <p class="spa-dropzone-note">Sanitization runs fully on-device using local pdf-lib runtime</p>
                </div>
              </div>
              <input id="spaSanitizeFile" type="file" accept="application/pdf" hidden>
              <div id="spaSanitizeMeta" class="spa-runtime-meta"></div>
            </section>
            <section class="spa-runtime-card">
              <label class="spa-checkbox-row"><input id="spaSanitizeMetaCheck" type="checkbox" checked> Clear metadata fields (title, author, subject, keywords)</label>
              <label class="spa-checkbox-row"><input id="spaSanitizeFormsCheck" type="checkbox"> Flatten form fields</label>
              <div class="spa-inline-actions">
                <button class="spa-button" id="spaSanitizeRun" type="button" disabled>Sanitize PDF</button>
                <button class="spa-button is-secondary" id="spaSanitizeClear" type="button">Clear</button>
              </div>
              <div id="spaSanitizeMessage"></div>
              <div id="spaSanitizeProgress"></div>
            </section>
          </div>
        </section>`;
    }

    if (slug === 'pdf-rotate') {
      return `
        <section class="glass-panel spa-detail spa-tool-runtime">
          <p class="spa-eyebrow">Browser Tool</p>
          <div class="spa-detail-head">
            <div class="spa-tool-icon is-large" aria-hidden="true">🔄</div>
            <div><h1>Rotate PDF</h1><p class="lead">Rotate all pages by the chosen angle. Preview updates live before you download.</p></div>
          </div>
          <div class="spa-runtime-grid">
            <section class="spa-runtime-card">
              <label class="spa-field-label" for="spaRotateFile">Upload PDF file</label>
              <div id="spaRotateDropzone" class="spa-dropzone" role="button" tabindex="0" aria-controls="spaRotateFile">
                <div class="spa-dropzone-icon" aria-hidden="true">📄</div>
                <div><p class="spa-dropzone-title">Drop a PDF here or click to browse</p><p class="spa-dropzone-note">Preview renders the first page with rotation applied</p></div>
              </div>
              <input id="spaRotateFile" type="file" accept="application/pdf" hidden>
              <div id="spaRotateMeta" class="spa-runtime-meta"></div>
              <div id="spaRotatePreview" class="spa-canvas-preview" hidden>
                <p class="spa-preview-label">Preview — first page</p>
                <canvas id="spaRotateCanvas" class="spa-preview-canvas"></canvas>
              </div>
            </section>
            <section class="spa-runtime-card">
              <div class="spa-form-grid">
                <label class="spa-field"><span class="spa-field-label">Rotate by</span>
                  <select id="spaRotateAngle" class="spa-input">
                    <option value="90">90° clockwise</option>
                    <option value="180">180°</option>
                    <option value="270">270° (90° counter-clockwise)</option>
                  </select>
                </label>
              </div>
              <div class="spa-inline-actions">
                <button class="spa-button" id="spaRotateRun" type="button" disabled>Rotate &amp; Download</button>
                <button class="spa-button is-secondary" id="spaRotateClear" type="button">Clear</button>
              </div>
              <div id="spaRotateMessage"></div>
              <div id="spaRotateProgress"></div>
            </section>
          </div>
        </section>`;
    }

    if (slug === 'pdf-watermark') {
      return `
        <section class="glass-panel spa-detail spa-tool-runtime">
          <p class="spa-eyebrow">Browser Tool</p>
          <div class="spa-detail-head">
            <div class="spa-tool-icon is-large" aria-hidden="true">💧</div>
            <div><h1>Watermark PDF</h1><p class="lead">Add a diagonal text watermark to every page. Preview updates live as you type.</p></div>
          </div>
          <div class="spa-runtime-grid">
            <section class="spa-runtime-card">
              <label class="spa-field-label" for="spaWatermarkFile">Upload PDF file</label>
              <div id="spaWatermarkDropzone" class="spa-dropzone" role="button" tabindex="0" aria-controls="spaWatermarkFile">
                <div class="spa-dropzone-icon" aria-hidden="true">📄</div>
                <div><p class="spa-dropzone-title">Drop a PDF here or click to browse</p><p class="spa-dropzone-note">Preview updates when you change watermark settings</p></div>
              </div>
              <input id="spaWatermarkFile" type="file" accept="application/pdf" hidden>
              <div id="spaWatermarkMeta" class="spa-runtime-meta"></div>
              <div id="spaWatermarkPreview" class="spa-canvas-preview" hidden>
                <p class="spa-preview-label">Preview — first page</p>
                <canvas id="spaWatermarkCanvas" class="spa-preview-canvas"></canvas>
              </div>
            </section>
            <section class="spa-runtime-card">
              <div class="spa-form-grid">
                <label class="spa-field"><span class="spa-field-label">Watermark text</span><input id="spaWatermarkText" class="spa-input" type="text" value="CONFIDENTIAL"></label>
                <label class="spa-field"><span class="spa-field-label">Font size</span><input id="spaWatermarkSize" class="spa-input" type="number" value="42" min="12" max="120"></label>
                <label class="spa-field"><span class="spa-field-label">Opacity (%)</span><input id="spaWatermarkOpacity" class="spa-input" type="number" value="25" min="5" max="100"></label>
              </div>
              <div class="spa-inline-actions">
                <button class="spa-button" id="spaWatermarkRun" type="button" disabled>Apply &amp; Download</button>
                <button class="spa-button is-secondary" id="spaWatermarkClear" type="button">Clear</button>
              </div>
              <div id="spaWatermarkMessage"></div>
              <div id="spaWatermarkProgress"></div>
            </section>
          </div>
        </section>`;
    }

    if (slug === 'pdf-merge') {
      return `
        <section class="glass-panel spa-detail spa-tool-runtime">
          <p class="spa-eyebrow">Browser Tool</p>
          <div class="spa-detail-head">
            <div class="spa-tool-icon is-large" aria-hidden="true">🔗</div>
            <div><h1>Merge PDF</h1><p class="lead">Combine multiple PDFs into one. Each file shows a first-page thumbnail — drag to reorder, then download.</p></div>
          </div>
          <div class="spa-runtime-grid">
            <section class="spa-runtime-card">
              <label class="spa-field-label" for="spaMergeInput">Upload PDF files</label>
              <div id="spaMergeDropzone" class="spa-dropzone" role="button" tabindex="0" aria-controls="spaMergeInput">
                <div class="spa-dropzone-icon" aria-hidden="true">📦</div>
                <div><p class="spa-dropzone-title">Drop PDF files here or click to browse</p><p class="spa-dropzone-note">Add multiple files — drag cards to reorder pages</p></div>
              </div>
              <input id="spaMergeInput" type="file" accept="application/pdf" multiple hidden>
              <div id="spaMergeMeta" class="spa-runtime-meta"></div>
              <div id="spaMergeList" class="spa-merge-list"></div>
            </section>
            <section class="spa-runtime-card">
              <div class="spa-inline-actions">
                <button class="spa-button" id="spaMergeRun" type="button" disabled>Merge &amp; Download</button>
                <button class="spa-button is-secondary" id="spaMergeClear" type="button">Clear all</button>
              </div>
              <div id="spaMergeMessage"></div>
              <div id="spaMergeProgress"></div>
            </section>
          </div>
        </section>`;
    }

    if (slug === 'pdf-sign') {
      return `
        <section class="glass-panel spa-detail spa-tool-runtime">
          <p class="spa-eyebrow">Browser Tool</p>
          <div class="spa-detail-head">
            <div class="spa-tool-icon is-large" aria-hidden="true">✍️</div>
            <div><h1>Sign PDF</h1><p class="lead">Draw your signature or upload an image. Preview shows placement on the first page before you download.</p></div>
          </div>
          <div class="spa-runtime-grid">
            <section class="spa-runtime-card">
              <label class="spa-field-label" for="spaSignFile">Upload PDF file</label>
              <div id="spaSignDropzone" class="spa-dropzone" role="button" tabindex="0" aria-controls="spaSignFile">
                <div class="spa-dropzone-icon" aria-hidden="true">📄</div>
                <div><p class="spa-dropzone-title">Drop a PDF here or click to browse</p><p class="spa-dropzone-note">Preview shows signature placement on the first page</p></div>
              </div>
              <input id="spaSignFile" type="file" accept="application/pdf" hidden>
              <div id="spaSignMeta" class="spa-runtime-meta"></div>
              <div id="spaSignPreview" class="spa-canvas-preview" hidden>
                <p class="spa-preview-label">Preview — first page with signature</p>
                <canvas id="spaSignCanvas" class="spa-preview-canvas"></canvas>
              </div>
            </section>
            <section class="spa-runtime-card">
              <p class="spa-field-label">Signature</p>
              <div class="spa-sig-tabs">
                <button class="spa-sig-tab is-active" id="spaSignTabDraw" type="button">Draw</button>
                <button class="spa-sig-tab" id="spaSignTabUpload" type="button">Upload image</button>
              </div>
              <div id="spaSignPadWrap" class="spa-sig-pad-wrap">
                <canvas id="spaSignPad" class="spa-sig-pad" width="380" height="120"></canvas>
                <button class="spa-button is-secondary" id="spaSignPadClear" type="button" style="width:100%">Clear signature</button>
              </div>
              <div id="spaSignUploadWrap" class="spa-sig-pad-wrap" hidden>
                <label class="spa-field-label" for="spaSignImgInput">Signature image (PNG with transparency recommended)</label>
                <input id="spaSignImgInput" type="file" accept="image/*" class="spa-input">
                <div id="spaSignImgPreview" class="spa-sig-img-preview"></div>
              </div>
              <div class="spa-form-grid" style="margin-top:14px">
                <label class="spa-field"><span class="spa-field-label">Signer name</span><input id="spaSignerName" class="spa-input" type="text" value=""></label>
              </div>
              <div class="spa-inline-actions">
                <button class="spa-button" id="spaSignRun" type="button" disabled>Sign &amp; Download</button>
                <button class="spa-button is-secondary" id="spaSignClear" type="button">Clear</button>
              </div>
              <div id="spaSignMessage"></div>
              <div id="spaSignProgress"></div>
            </section>
          </div>
        </section>`;
    }

    if (slug === 'pdf-compress') {
      return `
        <section class="glass-panel spa-detail spa-tool-runtime">
          <p class="spa-eyebrow">Browser Tool</p>
          <div class="spa-detail-head">
            <div class="spa-tool-icon is-large" aria-hidden="true">🗜️</div>
            <div><h1>Compress PDF</h1><p class="lead">Reduce file size by re-rendering pages as JPEG. Estimated output size updates as you adjust settings.</p></div>
          </div>
          <div class="spa-runtime-grid">
            <section class="spa-runtime-card">
              <label class="spa-field-label" for="spaCompressFile">Upload PDF file</label>
              <div id="spaCompressDropzone" class="spa-dropzone" role="button" tabindex="0" aria-controls="spaCompressFile">
                <div class="spa-dropzone-icon" aria-hidden="true">📄</div>
                <div><p class="spa-dropzone-title">Drop a PDF here or click to browse</p><p class="spa-dropzone-note">Estimated output size updates as you adjust settings</p></div>
              </div>
              <input id="spaCompressFile" type="file" accept="application/pdf" hidden>
              <div id="spaCompressMeta" class="spa-runtime-meta"></div>
            </section>
            <section class="spa-runtime-card">
              <div class="spa-form-grid">
                <label class="spa-field"><span class="spa-field-label">Image quality</span>
                  <select id="spaCompressQuality" class="spa-input">
                    <option value="0.45">Low — smallest file</option>
                    <option value="0.65">Medium</option>
                    <option value="0.75" selected>Balanced</option>
                    <option value="0.88">High</option>
                  </select>
                </label>
                <label class="spa-field"><span class="spa-field-label">Render scale</span>
                  <select id="spaCompressScale" class="spa-input">
                    <option value="1">1× — draft</option>
                    <option value="1.5" selected>1.5× — recommended</option>
                    <option value="2">2× — sharp</option>
                  </select>
                </label>
              </div>
              <div id="spaCompressEstimate" class="spa-compress-estimate" hidden>
                <span class="spa-estimate-label">Estimated output</span>
                <span id="spaCompressEstimateValue" class="spa-estimate-value">—</span>
              </div>
              <div class="spa-inline-actions">
                <button class="spa-button" id="spaCompressRun" type="button" disabled>Compress &amp; Download</button>
                <button class="spa-button is-secondary" id="spaCompressClear" type="button">Clear</button>
              </div>
              <div id="spaCompressMessage"></div>
              <div id="spaCompressProgress"></div>
            </section>
          </div>
        </section>`;
    }

    if (
      slug === 'docx-to-pdf' ||
      slug === 'excel-to-pdf' ||
      slug === 'pptx-to-pdf' ||
      slug === 'pdf-to-docx' ||
      slug === 'pdf-to-excel' ||
      slug === 'pdf-to-pptx' ||
      slug === 'pdf-password'
    ) {
      const accept = (
        slug === 'docx-to-pdf' ? '.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document' :
        slug === 'excel-to-pdf' ? '.csv,.txt,.xlsx,.xls,text/csv,text/plain,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel' :
        slug === 'pptx-to-pdf' ? '.pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation' :
        'application/pdf'
      );

      const extraControls =
        (slug === 'pdf-password' ? '<div class="spa-tool-note">Browser-safe strong PDF encryption is not available in this build. Use this screen as a secure workflow checklist.</div>' : '') +
        (slug === 'pdf-to-pptx' ? '<label class="spa-field"><span class="spa-field-label">Slide scale</span><select id="spaGenericPptxScale" class="spa-input"><option value="1">1x</option><option value="1.5" selected>1.5x</option><option value="2">2x</option></select></label>' : '');

      return `
        <section class="glass-panel spa-detail spa-tool-runtime">
          <p class="spa-eyebrow">Browser Tool</p>
          <div class="spa-runtime-grid">
            <section class="spa-runtime-card">
              <label class="spa-field-label" for="spaGenericFile">Input file</label>
              <div id="spaGenericDropzone" class="spa-dropzone" role="button" tabindex="0" aria-controls="spaGenericFile">
                <div class="spa-dropzone-icon" aria-hidden="true">📦</div>
                <div>
                  <p class="spa-dropzone-title">Drop a file here or click to browse</p>
                  <p class="spa-dropzone-note">Tool: ${escapeHtml(slug)}</p>
                </div>
              </div>
              <input id="spaGenericFile" type="file" accept="${escapeHtml(accept)}" hidden>
              <div id="spaGenericMeta" class="spa-runtime-meta"></div>
            </section>
            <section class="spa-runtime-card">
              <div class="spa-form-grid">${extraControls}</div>
              <div class="spa-inline-actions">
                <button class="spa-button" id="spaGenericRun" type="button" disabled>Run Tool</button>
                <button class="spa-button is-secondary" id="spaGenericClear" type="button">Clear</button>
              </div>
              <div id="spaGenericMessage"></div>
              <div id="spaGenericProgress"></div>
              <textarea id="spaGenericOutput" class="spa-textarea spa-output-text" readonly placeholder="Tool output details will appear here"></textarea>
            </section>
          </div>
        </section>`;
    }

    return '';
  };

  app.mountMigratedTool = function mountMigratedTool(slug) {
    if (slug === 'images-to-pdf') {
      const jsPDFRef = window.jspdf && window.jspdf.jsPDF;
      const fileInput = document.getElementById('spaImagesPdfInput');
      const dropzone = document.getElementById('spaImagesDropzone');
      const preview = document.getElementById('spaImagesPreview');
      const pageSize = document.getElementById('spaImagesPageSize');
      const orientation = document.getElementById('spaImagesOrientation');
      const fitMode = document.getElementById('spaImagesFitMode');
      const convertButton = document.getElementById('spaImagesConvert');
      const clearButton = document.getElementById('spaImagesClear');
      const meta = document.getElementById('spaImagesMeta');
      const message = document.getElementById('spaImagesMessage');
      const progress = document.getElementById('spaImagesProgress');
      let items = [];
      let draggedIndex = -1;

      function revokeAllUrls() {
        for (let i = 0; i < items.length; i += 1) {
          if (items[i].url) URL.revokeObjectURL(items[i].url);
        }
      }

      function updateMeta() {
        const totalBytes = items.reduce(function (sum, item) {
          return sum + (item.file.size || 0);
        }, 0);
        meta.innerHTML = items.length
          ? '<span><strong>Images:</strong> ' + items.length + '</span><span><strong>Total:</strong> ' + formatFileSize(totalBytes) + '</span><span><strong>Tip:</strong> drag cards to reorder pages</span>'
          : '';
      }

      function renderPreview() {
        if (!preview) return;
        if (!items.length) {
          preview.innerHTML = '<div class="spa-empty">No images selected yet.</div>';
          convertButton.disabled = true;
          updateMeta();
          return;
        }

        preview.innerHTML = items.map(function (item, index) {
          return '<article class="spa-image-item" draggable="true" data-index="' + index + '"><img src="' + escapeHtml(item.url) + '" alt="' + escapeHtml(item.file.name || 'image') + '"><div class="spa-image-item-info">' + escapeHtml(item.file.name || 'image') + ' (' + formatFileSize(item.file.size || 0) + ')</div><button class="spa-image-item-remove" type="button" data-remove-index="' + index + '" aria-label="Remove image">×</button></article>';
        }).join('');

        convertButton.disabled = false;
        updateMeta();

        const cards = preview.querySelectorAll('.spa-image-item');
        for (let i = 0; i < cards.length; i += 1) {
          const card = cards[i];
          card.addEventListener('dragstart', function () {
            draggedIndex = parseInt(card.getAttribute('data-index'), 10);
            card.classList.add('is-dragging');
          });
          card.addEventListener('dragend', function () {
            draggedIndex = -1;
            card.classList.remove('is-dragging');
          });
          card.addEventListener('dragover', function (event) {
            event.preventDefault();
            card.classList.add('is-dragover');
          });
          card.addEventListener('dragleave', function () {
            card.classList.remove('is-dragover');
          });
          card.addEventListener('drop', function (event) {
            event.preventDefault();
            card.classList.remove('is-dragover');
            const toIndex = parseInt(card.getAttribute('data-index'), 10);
            if (Number.isNaN(draggedIndex) || draggedIndex < 0 || draggedIndex === toIndex) return;
            const moved = items.splice(draggedIndex, 1)[0];
            items.splice(toIndex, 0, moved);
            renderPreview();
          });
        }
      }

      function addImageFiles(fileList) {
        const files = Array.from(fileList || []).filter(function (file) {
          return file.type && file.type.indexOf('image/') === 0;
        });

        if (!files.length) {
          setMessage(message, 'error', 'Please add valid image files.');
          return;
        }

        for (let i = 0; i < files.length; i += 1) {
          const file = files[i];
          const duplicate = items.some(function (entry) {
            return entry.file.name === file.name && entry.file.size === file.size;
          });
          if (!duplicate) {
            items.push({ file: file, url: URL.createObjectURL(file) });
          }
        }

        setMessage(message, '', '');
        renderPreview();
      }

      preview.addEventListener('click', function (event) {
        const button = event.target.closest('[data-remove-index]');
        if (!button) return;
        const index = parseInt(button.getAttribute('data-remove-index'), 10);
        if (Number.isNaN(index) || !items[index]) return;
        if (items[index].url) URL.revokeObjectURL(items[index].url);
        items.splice(index, 1);
        renderPreview();
      });

      ['dragenter', 'dragover'].forEach(function (eventName) {
        dropzone.addEventListener(eventName, function (event) {
          event.preventDefault();
          event.stopPropagation();
          dropzone.classList.add('is-dragover');
        });
      });

      ['dragleave', 'drop'].forEach(function (eventName) {
        dropzone.addEventListener(eventName, function (event) {
          event.preventDefault();
          event.stopPropagation();
          dropzone.classList.remove('is-dragover');
        });
      });

      dropzone.addEventListener('click', function () {
        fileInput.click();
      });
      dropzone.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          fileInput.click();
        }
      });
      dropzone.addEventListener('drop', function (event) {
        addImageFiles(event.dataTransfer && event.dataTransfer.files);
      });

      fileInput.addEventListener('change', function (event) {
        addImageFiles(event.target.files);
        fileInput.value = '';
      });

      convertButton.addEventListener('click', async function () {
        if (!jsPDFRef) {
          setMessage(message, 'error', 'jsPDF is not available in the SPA shell.');
          return;
        }
        if (!items.length) {
          setMessage(message, 'error', 'Add at least one image first.');
          return;
        }

        try {
          setMessage(message, '', '');
          setProgress(progress, 5, 'Preparing document...');
          const pdf = new jsPDFRef({ unit: 'pt', format: pageSize.value, orientation: orientation.value });

          for (let i = 0; i < items.length; i += 1) {
            setProgress(progress, Math.round((i / items.length) * 90), 'Processing image ' + (i + 1) + ' of ' + items.length + '...');
            const image = await loadImageFile(items[i].file);
            const pageW = pdf.internal.pageSize.getWidth();
            const pageH = pdf.internal.pageSize.getHeight();
            const imgW = image.naturalWidth;
            const imgH = image.naturalHeight;
            let x = 0;
            let y = 0;
            let w = pageW;
            let h = pageH;

            if (fitMode.value === 'fit') {
              const ratio = Math.min(pageW / imgW, pageH / imgH);
              w = imgW * ratio;
              h = imgH * ratio;
              x = (pageW - w) / 2;
              y = (pageH - h) / 2;
            } else if (fitMode.value === 'original') {
              w = imgW;
              h = imgH;
              x = (pageW - w) / 2;
              y = (pageH - h) / 2;
            }

            if (i > 0) pdf.addPage();
            pdf.addImage(image, 'JPEG', x, y, w, h);
          }

          setProgress(progress, 96, 'Generating download...');
          const blob = pdf.output('blob');
          downloadBlob(blob, 'images-to-pdf-' + Date.now() + '.pdf');
          clearProgress(progress);
          setMessage(message, 'success', 'PDF generated from ' + items.length + ' image(s).');
        } catch (error) {
          clearProgress(progress);
          setMessage(message, 'error', 'Conversion failed: ' + escapeHtml(error.message || 'Unknown error'));
        }
      });

      clearButton.addEventListener('click', function () {
        revokeAllUrls();
        items = [];
        renderPreview();
        setMessage(message, '', '');
        clearProgress(progress);
      });

      renderPreview();
      return;
    }

    if (slug === 'pdf-to-images') {
      const pdfjsLib = getPdfJsLib();
      const JSZipRef = getJSZip();
      const fileInput = document.getElementById('spaPdfImagesFile');
      const dropzone = document.getElementById('spaPdfImagesDropzone');
      const meta = document.getElementById('spaPdfImagesMeta');
      const scaleSelect = document.getElementById('spaPdfImagesScale');
      const extractButton = document.getElementById('spaPdfImagesExtract');
      const zipButton = document.getElementById('spaPdfImagesZip');
      const clearButton = document.getElementById('spaPdfImagesClear');
      const thumbs = document.getElementById('spaPdfImagesThumbs');
      const message = document.getElementById('spaPdfImagesMessage');
      const progress = document.getElementById('spaPdfImagesProgress');
      let pdfDoc = null;
      let fileName = 'document';
      let extracted = [];

      function resetState() {
        pdfDoc = null;
        fileName = 'document';
        extracted = [];
        extractButton.disabled = true;
        zipButton.disabled = true;
        meta.innerHTML = '';
        thumbs.innerHTML = '';
        setMessage(message, JSZipRef ? '' : 'info', JSZipRef ? '' : 'ZIP is unavailable because JSZip is not loaded.');
        clearProgress(progress);
      }

      async function loadPdfFile(file) {
        if (!pdfjsLib) {
          setMessage(message, 'error', 'pdf.js is not available in the SPA shell.');
          return;
        }

        try {
          setProgress(progress, 15, 'Loading PDF document...');
          const arrayBuf = await file.arrayBuffer();
          pdfDoc = await pdfjsLib.getDocument({ data: arrayBuf }).promise;
          fileName = (file.name || 'document').replace(/\.pdf$/i, '') || 'document';
          extracted = [];
          extractButton.disabled = false;
          zipButton.disabled = true;
          thumbs.innerHTML = '';
          meta.innerHTML = '<span><strong>File:</strong> ' + escapeHtml(file.name || 'document.pdf') + '</span><span><strong>Size:</strong> ' + formatFileSize(file.size || 0) + '</span><span><strong>Pages:</strong> ' + pdfDoc.numPages + '</span>';
          clearProgress(progress);
          setMessage(message, JSZipRef ? 'info' : 'info', JSZipRef ? 'PDF loaded. Extract pages to generate PNG files.' : 'PDF loaded. Extract pages; ZIP download remains unavailable.');
        } catch (error) {
          clearProgress(progress);
          setMessage(message, 'error', 'Failed to load PDF: ' + escapeHtml(error.message || 'Unknown error'));
        }
      }

      function renderThumbs() {
        if (!extracted.length) {
          thumbs.innerHTML = '';
          return;
        }
        thumbs.innerHTML = extracted.map(function (item, index) {
          return '<article class="spa-thumb"><img src="' + escapeHtml(item.dataUrl) + '" alt="Page ' + (index + 1) + '"><div class="spa-thumb-info">Page ' + (index + 1) + '</div><button class="spa-button is-secondary spa-thumb-download" type="button" data-thumb-index="' + index + '">Download PNG</button></article>';
        }).join('');
      }

      thumbs.addEventListener('click', function (event) {
        const button = event.target.closest('[data-thumb-index]');
        if (!button) return;
        const index = parseInt(button.getAttribute('data-thumb-index'), 10);
        if (Number.isNaN(index) || !extracted[index]) return;
        downloadBlob(dataUrlToBlob(extracted[index].dataUrl), extracted[index].name);
      });

      ['dragenter', 'dragover'].forEach(function (eventName) {
        dropzone.addEventListener(eventName, function (event) {
          event.preventDefault();
          event.stopPropagation();
          dropzone.classList.add('is-dragover');
        });
      });
      ['dragleave', 'drop'].forEach(function (eventName) {
        dropzone.addEventListener(eventName, function (event) {
          event.preventDefault();
          event.stopPropagation();
          dropzone.classList.remove('is-dragover');
        });
      });
      dropzone.addEventListener('click', function () {
        fileInput.click();
      });
      dropzone.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          fileInput.click();
        }
      });
      dropzone.addEventListener('drop', function (event) {
        const file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
        if (!file) return;
        if (file.type === 'application/pdf' || /\.pdf$/i.test(file.name || '')) loadPdfFile(file);
        else setMessage(message, 'error', 'Please drop a valid PDF file.');
      });
      fileInput.addEventListener('change', function (event) {
        const file = event.target.files && event.target.files[0];
        if (!file) return;
        loadPdfFile(file);
        fileInput.value = '';
      });

      extractButton.addEventListener('click', async function () {
        if (!pdfDoc) {
          setMessage(message, 'error', 'Upload a PDF file first.');
          return;
        }

        try {
          extracted = [];
          thumbs.innerHTML = '';
          const scale = parseFloat(scaleSelect.value || '1.5');
          const totalPages = pdfDoc.numPages;
          setMessage(message, '', '');

          for (let pageIndex = 1; pageIndex <= totalPages; pageIndex += 1) {
            setProgress(progress, Math.round((pageIndex / totalPages) * 88), 'Rendering page ' + pageIndex + ' of ' + totalPages + '...');
            const page = await pdfDoc.getPage(pageIndex);
            const viewport = page.getViewport({ scale: scale });
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d');
            await page.render({ canvasContext: ctx, viewport: viewport }).promise;
            extracted.push({
              name: fileName + '-page-' + pageIndex + '.png',
              dataUrl: canvas.toDataURL('image/png')
            });
          }

          renderThumbs();
          zipButton.disabled = !(JSZipRef && extracted.length);
          clearProgress(progress);
          setMessage(message, 'success', 'Extracted ' + extracted.length + ' page image(s). Click a card button to download PNG.');
        } catch (error) {
          clearProgress(progress);
          setMessage(message, 'error', 'Extraction failed: ' + escapeHtml(error.message || 'Unknown error'));
        }
      });

      zipButton.addEventListener('click', async function () {
        if (!JSZipRef || !extracted.length) return;
        try {
          const zip = new JSZipRef();
          setProgress(progress, 8, 'Preparing ZIP archive...');
          for (let i = 0; i < extracted.length; i += 1) {
            zip.file(extracted[i].name, dataUrlToBlob(extracted[i].dataUrl));
            setProgress(progress, 10 + Math.round(((i + 1) / extracted.length) * 72), 'Adding ' + extracted[i].name + '...');
          }
          const zipBlob = await zip.generateAsync({ type: 'blob' }, function (metaInfo) {
            setProgress(progress, 84 + Math.round(metaInfo.percent / 6.3), 'Compressing ' + Math.round(metaInfo.percent) + '%...');
          });
          downloadBlob(zipBlob, fileName + '-pages.zip');
          clearProgress(progress);
          setMessage(message, 'success', 'ZIP archive downloaded successfully.');
        } catch (error) {
          clearProgress(progress);
          setMessage(message, 'error', 'ZIP creation failed: ' + escapeHtml(error.message || 'Unknown error'));
        }
      });

      clearButton.addEventListener('click', function () {
        resetState();
        if (fileInput) fileInput.value = '';
      });

      resetState();
      return;
    }

    if (slug === 'pdf-sanitize') {
      const pdfLib = getPdfLib();
      const PDFDocument = pdfLib && pdfLib.PDFDocument;
      const fileInput = document.getElementById('spaSanitizeFile');
      const dropzone = document.getElementById('spaSanitizeDropzone');
      const meta = document.getElementById('spaSanitizeMeta');
      const clearMetaCheckbox = document.getElementById('spaSanitizeMetaCheck');
      const flattenFormsCheckbox = document.getElementById('spaSanitizeFormsCheck');
      const runButton = document.getElementById('spaSanitizeRun');
      const clearButton = document.getElementById('spaSanitizeClear');
      const message = document.getElementById('spaSanitizeMessage');
      const progress = document.getElementById('spaSanitizeProgress');
      let fileData = null;

      function resetState() {
        fileData = null;
        runButton.disabled = true;
        meta.innerHTML = '';
        setMessage(message, '', '');
        clearProgress(progress);
      }

      async function loadPdfFile(file) {
        fileData = file;
        runButton.disabled = false;
        meta.innerHTML = '<span><strong>File:</strong> ' + escapeHtml(file.name || 'document.pdf') + '</span><span><strong>Size:</strong> ' + formatFileSize(file.size || 0) + '</span>';
        setMessage(message, 'info', 'PDF loaded. Configure options and run sanitize.');
      }

      ['dragenter', 'dragover'].forEach(function (eventName) {
        dropzone.addEventListener(eventName, function (event) {
          event.preventDefault();
          event.stopPropagation();
          dropzone.classList.add('is-dragover');
        });
      });
      ['dragleave', 'drop'].forEach(function (eventName) {
        dropzone.addEventListener(eventName, function (event) {
          event.preventDefault();
          event.stopPropagation();
          dropzone.classList.remove('is-dragover');
        });
      });
      dropzone.addEventListener('click', function () {
        fileInput.click();
      });
      dropzone.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          fileInput.click();
        }
      });
      dropzone.addEventListener('drop', function (event) {
        const file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
        if (!file) return;
        if (file.type === 'application/pdf' || /\.pdf$/i.test(file.name || '')) loadPdfFile(file);
        else setMessage(message, 'error', 'Please drop a valid PDF file.');
      });
      fileInput.addEventListener('change', function (event) {
        const file = event.target.files && event.target.files[0];
        if (!file) return;
        loadPdfFile(file);
        fileInput.value = '';
      });

      runButton.addEventListener('click', async function () {
        if (!fileData) {
          setMessage(message, 'error', 'Upload a PDF file first.');
          return;
        }
        if (!PDFDocument) {
          setMessage(message, 'error', 'pdf-lib is not available in the SPA shell.');
          return;
        }

        try {
          setMessage(message, '', '');
          setProgress(progress, 20, 'Loading PDF in sanitizer...');
          const inputBytes = await fileData.arrayBuffer();
          const pdfDoc = await PDFDocument.load(inputBytes);

          if (clearMetaCheckbox.checked) {
            pdfDoc.setTitle('');
            pdfDoc.setAuthor('');
            pdfDoc.setSubject('');
            pdfDoc.setKeywords([]);
            pdfDoc.setProducer('');
            pdfDoc.setCreator('');
          }

          if (flattenFormsCheckbox.checked) {
            try {
              const form = pdfDoc.getForm();
              form.flatten();
            } catch (error) {
              // ignore when document has no forms
            }
          }

          setProgress(progress, 85, 'Saving sanitized PDF...');
          const outBytes = await pdfDoc.save();
          downloadBlob(
            new Blob([outBytes], { type: 'application/pdf' }),
            (fileData.name || 'document').replace(/\.pdf$/i, '') + '-sanitized.pdf'
          );
          clearProgress(progress);
          setMessage(message, 'success', 'Sanitized PDF generated and downloaded.');
        } catch (error) {
          clearProgress(progress);
          setMessage(message, 'error', 'Sanitization failed: ' + escapeHtml(error.message || 'Unknown error'));
        }
      });

      clearButton.addEventListener('click', function () {
        resetState();
        if (fileInput) fileInput.value = '';
      });

      resetState();
      return;
    }

    // ── PDF Rotate ──────────────────────────────────────────────────────────────
    if (slug === 'pdf-rotate') {
      const pdfjsLib = getPdfJsLib();
      const pdfLib = getPdfLib();
      const fileInput = document.getElementById('spaRotateFile');
      const dropzone = document.getElementById('spaRotateDropzone');
      const meta = document.getElementById('spaRotateMeta');
      const previewWrap = document.getElementById('spaRotatePreview');
      const previewCanvas = document.getElementById('spaRotateCanvas');
      const angleSelect = document.getElementById('spaRotateAngle');
      const runButton = document.getElementById('spaRotateRun');
      const clearButton = document.getElementById('spaRotateClear');
      const message = document.getElementById('spaRotateMessage');
      const progress = document.getElementById('spaRotateProgress');
      let pdfDoc = null;
      let fileData = null;

      function renderRotatePreview() {
        if (!pdfjsLib || !pdfDoc || !previewCanvas) return;
        const angle = parseInt(angleSelect.value, 10) || 90;
        pdfDoc.getPage(1).then(function (page) {
          const vp = page.getViewport({ scale: 1.2 });
          const rad = angle * Math.PI / 180;
          const cos = Math.abs(Math.cos(rad));
          const sin = Math.abs(Math.sin(rad));
          const rotW = Math.round(vp.width * cos + vp.height * sin);
          const rotH = Math.round(vp.width * sin + vp.height * cos);
          const off = document.createElement('canvas');
          off.width = vp.width; off.height = vp.height;
          page.render({ canvasContext: off.getContext('2d'), viewport: vp }).promise.then(function () {
            previewCanvas.width = rotW; previewCanvas.height = rotH;
            const ctx = previewCanvas.getContext('2d');
            ctx.save();
            ctx.translate(rotW / 2, rotH / 2);
            ctx.rotate(rad);
            ctx.drawImage(off, -vp.width / 2, -vp.height / 2);
            ctx.restore();
            previewWrap.hidden = false;
          });
        });
      }

      async function loadRotateFile(file) {
        if (!pdfjsLib) { setMessage(message, 'error', 'pdf.js is not available.'); return; }
        try {
          setProgress(progress, 20, 'Loading PDF...');
          fileData = file;
          pdfDoc = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
          meta.innerHTML = '<span><strong>File:</strong> ' + escapeHtml(file.name) + '</span><span><strong>Pages:</strong> ' + pdfDoc.numPages + '</span><span><strong>Size:</strong> ' + formatFileSize(file.size) + '</span>';
          runButton.disabled = false;
          clearProgress(progress);
          setMessage(message, 'info', 'PDF loaded. Choose rotation angle — preview updates instantly.');
          renderRotatePreview();
        } catch (e) {
          clearProgress(progress); setMessage(message, 'error', 'Failed to load: ' + escapeHtml(e.message));
        }
      }

      setupDropzone(dropzone, fileInput, function (files) {
        const f = files && files[0];
        if (!f) return;
        if (f.type === 'application/pdf' || /\.pdf$/i.test(f.name)) loadRotateFile(f);
        else setMessage(message, 'error', 'Please upload a PDF file.');
      });

      angleSelect.addEventListener('change', function () { if (pdfDoc) renderRotatePreview(); });

      runButton.addEventListener('click', async function () {
        if (!fileData || !pdfLib || !pdfLib.PDFDocument) { setMessage(message, 'error', 'pdf-lib is not available.'); return; }
        try {
          setMessage(message, '', '');
          setProgress(progress, 20, 'Processing...');
          const degrees = parseInt(angleSelect.value, 10) || 90;
          const doc = await pdfLib.PDFDocument.load(await fileData.arrayBuffer());
          doc.getPages().forEach(function (p) {
            p.setRotation(pdfLib.degrees((p.getRotation().angle + degrees) % 360));
          });
          setProgress(progress, 85, 'Saving...');
          const out = await doc.save();
          downloadBlob(new Blob([out], { type: 'application/pdf' }), 'rotated-' + Date.now() + '.pdf');
          clearProgress(progress);
          setMessage(message, 'success', 'Rotated ' + doc.getPageCount() + ' page(s) by ' + degrees + '°.');
        } catch (e) {
          clearProgress(progress); setMessage(message, 'error', 'Failed: ' + escapeHtml(e.message));
        }
      });

      clearButton.addEventListener('click', function () {
        pdfDoc = null; fileData = null; meta.innerHTML = ''; previewWrap.hidden = true;
        runButton.disabled = true; setMessage(message, '', ''); clearProgress(progress); fileInput.value = '';
      });

      runButton.disabled = true;
      return;
    }

    // ── PDF Watermark ────────────────────────────────────────────────────────────
    if (slug === 'pdf-watermark') {
      const pdfjsLib = getPdfJsLib();
      const pdfLib = getPdfLib();
      const fileInput = document.getElementById('spaWatermarkFile');
      const dropzone = document.getElementById('spaWatermarkDropzone');
      const meta = document.getElementById('spaWatermarkMeta');
      const previewWrap = document.getElementById('spaWatermarkPreview');
      const previewCanvas = document.getElementById('spaWatermarkCanvas');
      const textInput = document.getElementById('spaWatermarkText');
      const sizeInput = document.getElementById('spaWatermarkSize');
      const opacityInput = document.getElementById('spaWatermarkOpacity');
      const runButton = document.getElementById('spaWatermarkRun');
      const clearButton = document.getElementById('spaWatermarkClear');
      const message = document.getElementById('spaWatermarkMessage');
      const progress = document.getElementById('spaWatermarkProgress');
      let pdfDoc = null;
      let fileData = null;
      const pageOffCanvas = document.createElement('canvas');

      function renderWatermarkPreview() {
        if (!pdfDoc || !previewCanvas) return;
        pdfDoc.getPage(1).then(function (page) {
          const vp = page.getViewport({ scale: 1.2 });
          pageOffCanvas.width = vp.width; pageOffCanvas.height = vp.height;
          page.render({ canvasContext: pageOffCanvas.getContext('2d'), viewport: vp }).promise.then(function () {
            previewCanvas.width = vp.width; previewCanvas.height = vp.height;
            const ctx = previewCanvas.getContext('2d');
            ctx.drawImage(pageOffCanvas, 0, 0);
            const text = textInput.value || 'CONFIDENTIAL';
            const size = parseInt(sizeInput.value, 10) || 42;
            const opacity = (parseInt(opacityInput.value, 10) || 25) / 100;
            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.font = 'bold ' + size + 'px Arial, sans-serif';
            ctx.fillStyle = '#222';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.translate(previewCanvas.width / 2, previewCanvas.height / 2);
            ctx.rotate(-25 * Math.PI / 180);
            ctx.fillText(text, 0, 0);
            ctx.restore();
            previewWrap.hidden = false;
          });
        });
      }

      async function loadWatermarkFile(file) {
        if (!pdfjsLib) { setMessage(message, 'error', 'pdf.js is not available.'); return; }
        try {
          setProgress(progress, 20, 'Loading PDF...');
          fileData = file;
          pdfDoc = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
          meta.innerHTML = '<span><strong>File:</strong> ' + escapeHtml(file.name) + '</span><span><strong>Pages:</strong> ' + pdfDoc.numPages + '</span><span><strong>Size:</strong> ' + formatFileSize(file.size) + '</span>';
          runButton.disabled = false;
          clearProgress(progress);
          setMessage(message, 'info', 'PDF loaded. Adjust settings — preview updates live.');
          renderWatermarkPreview();
        } catch (e) {
          clearProgress(progress); setMessage(message, 'error', 'Failed to load: ' + escapeHtml(e.message));
        }
      }

      setupDropzone(dropzone, fileInput, function (files) {
        const f = files && files[0];
        if (!f) return;
        if (f.type === 'application/pdf' || /\.pdf$/i.test(f.name)) loadWatermarkFile(f);
        else setMessage(message, 'error', 'Please upload a PDF file.');
      });

      [textInput, sizeInput, opacityInput].forEach(function (el) {
        el.addEventListener('input', function () { if (pdfDoc) renderWatermarkPreview(); });
      });

      runButton.addEventListener('click', async function () {
        if (!fileData || !pdfLib || !pdfLib.PDFDocument) { setMessage(message, 'error', 'pdf-lib is not available.'); return; }
        try {
          setMessage(message, '', '');
          setProgress(progress, 10, 'Applying watermark...');
          const text = textInput.value || 'CONFIDENTIAL';
          const size = parseInt(sizeInput.value, 10) || 42;
          const opacity = (parseInt(opacityInput.value, 10) || 25) / 100;
          const doc = await pdfLib.PDFDocument.load(await fileData.arrayBuffer());
          const pages = doc.getPages();
          for (let i = 0; i < pages.length; i += 1) {
            const page = pages[i];
            const { width, height } = page.getSize();
            page.drawText(text, { x: width * 0.15, y: height * 0.52, size: size, opacity: opacity, rotate: pdfLib.degrees(25) });
            setProgress(progress, 10 + Math.round(((i + 1) / pages.length) * 75), 'Page ' + (i + 1) + ' of ' + pages.length + '...');
          }
          setProgress(progress, 90, 'Saving...');
          const out = await doc.save();
          downloadBlob(new Blob([out], { type: 'application/pdf' }), 'watermarked-' + Date.now() + '.pdf');
          clearProgress(progress);
          setMessage(message, 'success', 'Watermark applied to ' + pages.length + ' page(s).');
        } catch (e) {
          clearProgress(progress); setMessage(message, 'error', 'Failed: ' + escapeHtml(e.message));
        }
      });

      clearButton.addEventListener('click', function () {
        pdfDoc = null; fileData = null; meta.innerHTML = ''; previewWrap.hidden = true;
        runButton.disabled = true; setMessage(message, '', ''); clearProgress(progress); fileInput.value = '';
      });

      runButton.disabled = true;
      return;
    }

    // ── PDF Merge ────────────────────────────────────────────────────────────────
    if (slug === 'pdf-merge') {
      const pdfjsLib = getPdfJsLib();
      const pdfLib = getPdfLib();
      const fileInput = document.getElementById('spaMergeInput');
      const dropzone = document.getElementById('spaMergeDropzone');
      const meta = document.getElementById('spaMergeMeta');
      const list = document.getElementById('spaMergeList');
      const runButton = document.getElementById('spaMergeRun');
      const clearButton = document.getElementById('spaMergeClear');
      const message = document.getElementById('spaMergeMessage');
      const progress = document.getElementById('spaMergeProgress');
      let items = [];
      let draggedIdx = -1;

      async function buildThumb(file) {
        if (!pdfjsLib) return null;
        try {
          const buf = await file.arrayBuffer();
          const doc = await pdfjsLib.getDocument({ data: buf }).promise;
          const page = await doc.getPage(1);
          const vp = page.getViewport({ scale: 0.35 });
          const c = document.createElement('canvas');
          c.width = vp.width; c.height = vp.height;
          await page.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
          return { dataUrl: c.toDataURL('image/jpeg', 0.7), pages: doc.numPages };
        } catch (e) { return null; }
      }

      function updateMergeMeta() {
        if (!items.length) { meta.innerHTML = ''; runButton.disabled = true; return; }
        const total = items.reduce(function (s, it) { return s + it.file.size; }, 0);
        meta.innerHTML = '<span><strong>Files:</strong> ' + items.length + '</span><span><strong>Total:</strong> ' + formatFileSize(total) + '</span><span><strong>Tip:</strong> drag to reorder</span>';
        runButton.disabled = false;
      }

      function renderMergeList() {
        if (!items.length) {
          list.innerHTML = '<div class="spa-empty">No PDF files added yet.</div>';
          updateMergeMeta(); return;
        }
        list.innerHTML = items.map(function (item, i) {
          const thumb = item.thumb
            ? '<img class="spa-merge-thumb" src="' + escapeHtml(item.thumb) + '" alt="p1">'
            : '<span class="spa-merge-thumb spa-merge-thumb-placeholder" aria-hidden="true"></span>';
          return '<div class="spa-merge-item" draggable="true" data-mi="' + i + '">' + thumb +
            '<div class="spa-merge-item-info"><div class="spa-merge-item-name">' + escapeHtml(item.file.name) + '</div>' +
            '<div class="spa-merge-item-size">' + formatFileSize(item.file.size) + (item.pages ? ' · ' + item.pages + ' pages' : '') + '</div></div>' +
            '<button class="spa-merge-item-remove" type="button" data-mr="' + i + '" aria-label="Remove">×</button></div>';
        }).join('');

        list.querySelectorAll('.spa-merge-item').forEach(function (el) {
          el.addEventListener('dragstart', function () { draggedIdx = parseInt(el.dataset.mi, 10); el.classList.add('is-dragging'); });
          el.addEventListener('dragend', function () { draggedIdx = -1; el.classList.remove('is-dragging'); });
          el.addEventListener('dragover', function (e) { e.preventDefault(); el.classList.add('is-dragover'); });
          el.addEventListener('dragleave', function () { el.classList.remove('is-dragover'); });
          el.addEventListener('drop', function (e) {
            e.preventDefault(); el.classList.remove('is-dragover');
            const to = parseInt(el.dataset.mi, 10);
            if (draggedIdx < 0 || draggedIdx === to) return;
            items.splice(to, 0, items.splice(draggedIdx, 1)[0]);
            renderMergeList();
          });
        });
        updateMergeMeta();
      }

      async function addMergeFiles(fileList) {
        const files = Array.from(fileList || []).filter(function (f) { return f.type === 'application/pdf' || /\.pdf$/i.test(f.name); });
        if (!files.length) { setMessage(message, 'error', 'Please upload PDF files.'); return; }
        setMessage(message, '', '');
        for (let i = 0; i < files.length; i += 1) {
          const file = files[i];
          if (items.some(function (it) { return it.file.name === file.name && it.file.size === file.size; })) continue;
          const entry = { file: file, thumb: null, pages: 0 };
          items.push(entry);
          renderMergeList();
          const info = await buildThumb(file);
          if (info) { entry.thumb = info.dataUrl; entry.pages = info.pages; }
          renderMergeList();
        }
      }

      list.addEventListener('click', function (e) {
        const btn = e.target.closest('[data-mr]');
        if (!btn) return;
        const idx = parseInt(btn.dataset.mr, 10);
        if (!isNaN(idx)) { items.splice(idx, 1); renderMergeList(); }
      });

      setupDropzone(dropzone, fileInput, addMergeFiles);

      runButton.addEventListener('click', async function () {
        if (!pdfLib || !pdfLib.PDFDocument) { setMessage(message, 'error', 'pdf-lib is not available.'); return; }
        if (!items.length) { setMessage(message, 'error', 'Add at least one PDF.'); return; }
        try {
          setMessage(message, '', '');
          const merged = await pdfLib.PDFDocument.create();
          for (let i = 0; i < items.length; i += 1) {
            setProgress(progress, Math.round((i / items.length) * 88), 'Merging ' + (i + 1) + ' of ' + items.length + '...');
            const doc = await pdfLib.PDFDocument.load(await items[i].file.arrayBuffer());
            const copied = await merged.copyPages(doc, doc.getPageIndices());
            copied.forEach(function (p) { merged.addPage(p); });
          }
          setProgress(progress, 92, 'Saving...');
          const out = await merged.save();
          downloadBlob(new Blob([out], { type: 'application/pdf' }), 'merged-' + Date.now() + '.pdf');
          clearProgress(progress);
          setMessage(message, 'success', 'Merged ' + items.length + ' PDF files.');
        } catch (e) {
          clearProgress(progress); setMessage(message, 'error', 'Merge failed: ' + escapeHtml(e.message));
        }
      });

      clearButton.addEventListener('click', function () {
        items = []; renderMergeList();
        setMessage(message, '', ''); clearProgress(progress); fileInput.value = '';
      });

      renderMergeList();
      return;
    }

    // ── PDF Sign ─────────────────────────────────────────────────────────────────
    if (slug === 'pdf-sign') {
      const pdfjsLib = getPdfJsLib();
      const pdfLib = getPdfLib();
      const fileInput = document.getElementById('spaSignFile');
      const dropzone = document.getElementById('spaSignDropzone');
      const meta = document.getElementById('spaSignMeta');
      const previewWrap = document.getElementById('spaSignPreview');
      const previewCanvas = document.getElementById('spaSignCanvas');
      const tabDraw = document.getElementById('spaSignTabDraw');
      const tabUpload = document.getElementById('spaSignTabUpload');
      const padWrap = document.getElementById('spaSignPadWrap');
      const pad = document.getElementById('spaSignPad');
      const padClear = document.getElementById('spaSignPadClear');
      const uploadWrap = document.getElementById('spaSignUploadWrap');
      const imgInput = document.getElementById('spaSignImgInput');
      const imgPreview = document.getElementById('spaSignImgPreview');
      const signerInput = document.getElementById('spaSignerName');
      const runButton = document.getElementById('spaSignRun');
      const clearButton = document.getElementById('spaSignClear');
      const message = document.getElementById('spaSignMessage');
      const progress = document.getElementById('spaSignProgress');

      let pdfDoc = null;
      let fileData = null;
      let pageOffCanvas = null;
      let uploadedSig = null;
      let activeTab = 'draw';
      let padDrawing = false;
      let padLastX = 0;
      let padLastY = 0;
      let padHasContent = false;
      let sigNormX = 0.55;
      let sigNormY = 0.08;
      let isDraggingSig = false;
      let sigDragOX = 0;
      let sigDragOY = 0;

      const padCtx = pad.getContext('2d');
      padCtx.strokeStyle = '#1e293b';
      padCtx.lineWidth = 2.2;
      padCtx.lineCap = 'round';
      padCtx.lineJoin = 'round';

      function padCoords(e, target) {
        const rect = target.getBoundingClientRect();
        const sx = target.width / rect.width;
        const sy = target.height / rect.height;
        const src = e.touches ? e.touches[0] : e;
        return { x: (src.clientX - rect.left) * sx, y: (src.clientY - rect.top) * sy };
      }

      pad.addEventListener('mousedown', function (e) {
        padDrawing = true;
        const p = padCoords(e, pad);
        padLastX = p.x; padLastY = p.y;
        padCtx.beginPath();
        padCtx.arc(p.x, p.y, 1, 0, Math.PI * 2);
        padCtx.fillStyle = '#1e293b'; padCtx.fill();
        padHasContent = true;
      });
      pad.addEventListener('mousemove', function (e) {
        if (!padDrawing) return;
        const p = padCoords(e, pad);
        padCtx.beginPath(); padCtx.moveTo(padLastX, padLastY); padCtx.lineTo(p.x, p.y); padCtx.stroke();
        padLastX = p.x; padLastY = p.y;
        padHasContent = true; updateSignPreview();
      });
      pad.addEventListener('mouseup', function () { padDrawing = false; });
      pad.addEventListener('mouseleave', function () { padDrawing = false; });
      pad.addEventListener('touchstart', function (e) {
        e.preventDefault(); padDrawing = true;
        const p = padCoords(e, pad); padLastX = p.x; padLastY = p.y;
        padCtx.beginPath(); padCtx.arc(p.x, p.y, 1, 0, Math.PI * 2);
        padCtx.fillStyle = '#1e293b'; padCtx.fill(); padHasContent = true;
      }, { passive: false });
      pad.addEventListener('touchmove', function (e) {
        if (!padDrawing) return; e.preventDefault();
        const p = padCoords(e, pad);
        padCtx.beginPath(); padCtx.moveTo(padLastX, padLastY); padCtx.lineTo(p.x, p.y); padCtx.stroke();
        padLastX = p.x; padLastY = p.y; padHasContent = true; updateSignPreview();
      }, { passive: false });
      pad.addEventListener('touchend', function () { padDrawing = false; });

      padClear.addEventListener('click', function () {
        padCtx.clearRect(0, 0, pad.width, pad.height); padHasContent = false; updateSignPreview();
      });

      tabDraw.addEventListener('click', function () {
        activeTab = 'draw';
        tabDraw.classList.add('is-active'); tabUpload.classList.remove('is-active');
        padWrap.hidden = false; uploadWrap.hidden = true;
        updateSignPreview();
      });
      tabUpload.addEventListener('click', function () {
        activeTab = 'upload';
        tabUpload.classList.add('is-active'); tabDraw.classList.remove('is-active');
        uploadWrap.hidden = false; padWrap.hidden = true;
        updateSignPreview();
      });

      imgInput.addEventListener('change', function (e) {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function () {
          const img = new Image();
          img.onload = function () {
            uploadedSig = img;
            imgPreview.innerHTML = '<img src="' + escapeHtml(img.src) + '" alt="Signature preview">';
            updateSignPreview();
          };
          img.src = String(reader.result);
        };
        reader.readAsDataURL(file);
      });

      function getSignatureSource() {
        if (activeTab === 'draw') return padHasContent ? pad : null;
        return uploadedSig || null;
      }

      function updateSignPreview() {
        if (!pageOffCanvas || !previewCanvas) return;
        previewCanvas.width = pageOffCanvas.width;
        previewCanvas.height = pageOffCanvas.height;
        const ctx = previewCanvas.getContext('2d');
        ctx.drawImage(pageOffCanvas, 0, 0);
        const sig = getSignatureSource();
        if (sig) {
          const sw = previewCanvas.width * 0.28;
          const sh = sw * ((sig.height || sig.naturalHeight) / (sig.width || sig.naturalWidth));
          const sx = sigNormX * previewCanvas.width;
          const sy = sigNormY * previewCanvas.height;
          ctx.drawImage(sig, sx, sy, sw, sh);
          const name = signerInput.value.trim();
          if (name) {
            ctx.font = '13px Arial, sans-serif';
            ctx.fillStyle = '#1e293b';
            ctx.fillText(name, sx, sy + sh + 16);
          }
          // drag handle hint
          ctx.save();
          ctx.strokeStyle = 'rgba(59,130,246,0.55)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 3]);
          ctx.strokeRect(sx - 2, sy - 2, sw + 4, sh + 4);
          ctx.restore();
        }
        previewWrap.hidden = false;
      }

      previewCanvas.style.cursor = 'move';
      previewCanvas.addEventListener('mousedown', function (e) {
        const rect = previewCanvas.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        const sig = getSignatureSource();
        if (!sig) return;
        const sw = 0.28;
        const sh = sw * ((sig.height || sig.naturalHeight) / (sig.width || sig.naturalWidth)) * (previewCanvas.width / previewCanvas.height);
        if (px >= sigNormX - 0.05 && px <= sigNormX + sw + 0.05 && py >= sigNormY - 0.05 && py <= sigNormY + sh + 0.05) {
          isDraggingSig = true;
          sigDragOX = px - sigNormX;
          sigDragOY = py - sigNormY;
        }
      });
      previewCanvas.addEventListener('mousemove', function (e) {
        if (!isDraggingSig) return;
        const rect = previewCanvas.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        sigNormX = Math.max(0, Math.min(0.7, px - sigDragOX));
        sigNormY = Math.max(0, Math.min(0.9, py - sigDragOY));
        updateSignPreview();
      });
      previewCanvas.addEventListener('mouseup', function () { isDraggingSig = false; });
      previewCanvas.addEventListener('mouseleave', function () { isDraggingSig = false; });

      signerInput.addEventListener('input', updateSignPreview);

      async function loadSignFile(file) {
        if (!pdfjsLib) { setMessage(message, 'error', 'pdf.js is not available.'); return; }
        try {
          setProgress(progress, 15, 'Loading PDF...');
          fileData = file;
          pdfDoc = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
          const page = await pdfDoc.getPage(1);
          const vp = page.getViewport({ scale: 1.2 });
          pageOffCanvas = document.createElement('canvas');
          pageOffCanvas.width = vp.width; pageOffCanvas.height = vp.height;
          await page.render({ canvasContext: pageOffCanvas.getContext('2d'), viewport: vp }).promise;
          meta.innerHTML = '<span><strong>File:</strong> ' + escapeHtml(file.name) + '</span><span><strong>Pages:</strong> ' + pdfDoc.numPages + '</span><span><strong>Size:</strong> ' + formatFileSize(file.size) + '</span>';
          runButton.disabled = false;
          clearProgress(progress);
          setMessage(message, 'info', 'Draw or upload a signature, then drag it to position on the preview.');
          updateSignPreview();
        } catch (e) {
          clearProgress(progress); setMessage(message, 'error', 'Failed to load: ' + escapeHtml(e.message));
        }
      }

      setupDropzone(dropzone, fileInput, function (files) {
        const f = files && files[0];
        if (!f) return;
        if (f.type === 'application/pdf' || /\.pdf$/i.test(f.name)) loadSignFile(f);
        else setMessage(message, 'error', 'Please upload a PDF file.');
      });

      runButton.addEventListener('click', async function () {
        if (!fileData || !pdfLib || !pdfLib.PDFDocument) { setMessage(message, 'error', 'pdf-lib is not available.'); return; }
        const sig = getSignatureSource();
        if (!sig) { setMessage(message, 'error', 'Please draw or upload a signature first.'); return; }
        try {
          setMessage(message, '', '');
          setProgress(progress, 10, 'Embedding signature...');

          const sigDataUrl = (sig instanceof HTMLCanvasElement) ? sig.toDataURL('image/png') : sig.src;
          const resp = await fetch(sigDataUrl);
          const sigBuf = await resp.arrayBuffer();

          const doc = await pdfLib.PDFDocument.load(await fileData.arrayBuffer());
          const page = doc.getPage(0);
          const { width, height } = page.getSize();

          let embeddedImg;
          try { embeddedImg = await doc.embedPng(sigBuf); }
          catch (e) { embeddedImg = await doc.embedJpg(sigBuf); }

          const sw = width * 0.28;
          const sh = sw * (embeddedImg.height / embeddedImg.width);
          const sx = sigNormX * width;
          const sy = (1 - sigNormY) * height - sh;

          page.drawImage(embeddedImg, { x: sx, y: sy, width: sw, height: sh });

          const signer = signerInput.value.trim();
          if (signer) page.drawText(signer, { x: sx, y: sy - 14, size: 10, opacity: 0.9 });

          setProgress(progress, 88, 'Saving...');
          const out = await doc.save();
          downloadBlob(new Blob([out], { type: 'application/pdf' }), 'signed-' + Date.now() + '.pdf');
          clearProgress(progress);
          setMessage(message, 'success', 'Signature embedded and PDF downloaded.');
        } catch (e) {
          clearProgress(progress); setMessage(message, 'error', 'Signing failed: ' + escapeHtml(e.message));
        }
      });

      clearButton.addEventListener('click', function () {
        pdfDoc = null; fileData = null; pageOffCanvas = null; uploadedSig = null;
        padHasContent = false; padCtx.clearRect(0, 0, pad.width, pad.height);
        imgPreview.innerHTML = ''; meta.innerHTML = ''; previewWrap.hidden = true;
        runButton.disabled = true; setMessage(message, '', ''); clearProgress(progress); fileInput.value = '';
      });

      runButton.disabled = true;
      return;
    }

    // ── PDF Compress ─────────────────────────────────────────────────────────────
    if (slug === 'pdf-compress') {
      const pdfjsLib = getPdfJsLib();
      const jsPDFRef = window.jspdf && window.jspdf.jsPDF;
      const fileInput = document.getElementById('spaCompressFile');
      const dropzone = document.getElementById('spaCompressDropzone');
      const meta = document.getElementById('spaCompressMeta');
      const qualitySelect = document.getElementById('spaCompressQuality');
      const scaleSelect = document.getElementById('spaCompressScale');
      const estimateWrap = document.getElementById('spaCompressEstimate');
      const estimateValue = document.getElementById('spaCompressEstimateValue');
      const runButton = document.getElementById('spaCompressRun');
      const clearButton = document.getElementById('spaCompressClear');
      const message = document.getElementById('spaCompressMessage');
      const progress = document.getElementById('spaCompressProgress');
      let pdfDoc = null;
      let fileData = null;

      async function updateCompressEstimate() {
        if (!pdfDoc || !pdfjsLib) return;
        try {
          const quality = parseFloat(qualitySelect.value);
          const scale = parseFloat(scaleSelect.value);
          const page = await pdfDoc.getPage(1);
          const vp = page.getViewport({ scale: scale });
          const c = document.createElement('canvas');
          c.width = vp.width; c.height = vp.height;
          await page.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
          const dataUrl = c.toDataURL('image/jpeg', quality);
          const b64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
          const bytesPerPage = Math.round(b64.length * 0.75);
          const total = bytesPerPage * pdfDoc.numPages;
          estimateValue.textContent = formatFileSize(total);
          estimateWrap.hidden = false;
        } catch (e) {}
      }

      async function loadCompressFile(file) {
        if (!pdfjsLib) { setMessage(message, 'error', 'pdf.js is not available.'); return; }
        try {
          setProgress(progress, 20, 'Loading PDF...');
          fileData = file;
          pdfDoc = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
          meta.innerHTML = '<span><strong>File:</strong> ' + escapeHtml(file.name) + '</span><span><strong>Pages:</strong> ' + pdfDoc.numPages + '</span><span><strong>Original size:</strong> ' + formatFileSize(file.size) + '</span>';
          runButton.disabled = false;
          clearProgress(progress);
          await updateCompressEstimate();
        } catch (e) {
          clearProgress(progress); setMessage(message, 'error', 'Failed to load: ' + escapeHtml(e.message));
        }
      }

      setupDropzone(dropzone, fileInput, function (files) {
        const f = files && files[0];
        if (!f) return;
        if (f.type === 'application/pdf' || /\.pdf$/i.test(f.name)) loadCompressFile(f);
        else setMessage(message, 'error', 'Please upload a PDF file.');
      });

      qualitySelect.addEventListener('change', function () { if (pdfDoc) updateCompressEstimate(); });
      scaleSelect.addEventListener('change', function () { if (pdfDoc) updateCompressEstimate(); });

      runButton.addEventListener('click', async function () {
        if (!fileData || !pdfjsLib || !jsPDFRef) { setMessage(message, 'error', 'pdf.js or jsPDF is not available.'); return; }
        try {
          setMessage(message, '', '');
          const quality = parseFloat(qualitySelect.value);
          const scale = parseFloat(scaleSelect.value);
          const source = await pdfjsLib.getDocument({ data: await fileData.arrayBuffer() }).promise;
          const pdf = new jsPDFRef({ unit: 'pt', format: 'a4', orientation: 'portrait' });
          for (let i = 1; i <= source.numPages; i += 1) {
            setProgress(progress, Math.round((i / source.numPages) * 86), 'Rasterizing page ' + i + ' of ' + source.numPages + '...');
            const page = await source.getPage(i);
            const vp = page.getViewport({ scale: scale });
            const c = document.createElement('canvas');
            c.width = vp.width; c.height = vp.height;
            await page.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
            const img = c.toDataURL('image/jpeg', quality);
            const w = pdf.internal.pageSize.getWidth();
            const h = pdf.internal.pageSize.getHeight();
            if (i > 1) pdf.addPage();
            pdf.addImage(img, 'JPEG', 0, 0, w, h);
          }
          setProgress(progress, 94, 'Generating download...');
          const blob = pdf.output('blob');
          downloadBlob(blob, 'compressed-' + Date.now() + '.pdf');
          clearProgress(progress);
          setMessage(message, 'success', 'Compression complete. Estimated: ' + estimateValue.textContent + ', actual: ' + formatFileSize(blob.size) + '.');
        } catch (e) {
          clearProgress(progress); setMessage(message, 'error', 'Compression failed: ' + escapeHtml(e.message));
        }
      });

      clearButton.addEventListener('click', function () {
        pdfDoc = null; fileData = null; meta.innerHTML = ''; estimateWrap.hidden = true;
        runButton.disabled = true; setMessage(message, '', ''); clearProgress(progress); fileInput.value = '';
      });

      runButton.disabled = true;
      return;
    }

    // ── Generic handler for remaining conversion tools ───────────────────────────
    if (
      slug === 'docx-to-pdf' ||
      slug === 'excel-to-pdf' ||
      slug === 'pptx-to-pdf' ||
      slug === 'pdf-to-docx' ||
      slug === 'pdf-to-excel' ||
      slug === 'pdf-to-pptx' ||
      slug === 'pdf-password'
    ) {
      const pdfjsLib = getPdfJsLib();
      const jsPDFRef = window.jspdf && window.jspdf.jsPDF;
      const pdfLib = getPdfLib();
      const JSZipRef = getJSZip();
      const mammothRef = window.mammoth;
      const html2canvasRef = window.html2canvas;
      const PptxGenRef = window.PptxGenJS;

      const fileInput = document.getElementById('spaGenericFile');
      const dropzone = document.getElementById('spaGenericDropzone');
      const meta = document.getElementById('spaGenericMeta');
      const runButton = document.getElementById('spaGenericRun');
      const clearButton = document.getElementById('spaGenericClear');
      const message = document.getElementById('spaGenericMessage');
      const progress = document.getElementById('spaGenericProgress');
      const output = document.getElementById('spaGenericOutput');
      let files = [];

      function updateMeta() {
        if (!files.length) { meta.innerHTML = ''; runButton.disabled = true; return; }
        const total = files.reduce(function (s, f) { return s + (f.size || 0); }, 0);
        meta.innerHTML = '<span><strong>Files:</strong> ' + files.length + '</span><span><strong>Total:</strong> ' + formatFileSize(total) + '</span>';
        runButton.disabled = false;
      }

      function reset() {
        files = []; fileInput.value = ''; output.value = '';
        clearProgress(progress); setMessage(message, '', ''); updateMeta();
      }

      function setFiles(newFiles) {
        files = Array.from(newFiles || []); updateMeta();
        if (files.length) setMessage(message, 'info', 'Loaded ' + files.length + ' file(s). Click "Run Tool" to process.');
      }

      setupDropzone(dropzone, fileInput, setFiles);
      clearButton.addEventListener('click', reset);

      runButton.addEventListener('click', async function () {
        if (!files.length) { setMessage(message, 'error', 'Please add a file first.'); return; }
        try {
          setMessage(message, '', ''); output.value = '';

          if (slug === 'pdf-password') {
            output.value = 'Password workflow checklist:\n1) Open your PDF in a trusted desktop editor with AES encryption support.\n2) Apply owner/user passwords and disable weak RC4 options.\n3) Re-upload here to verify the file opens only with password.\n4) Keep backups of unencrypted originals in secure storage.';
            setMessage(message, 'info', 'This build does not apply cryptographic PDF encryption in-browser.');
            return;
          }

          if (slug === 'pdf-to-docx' || slug === 'pdf-to-excel') {
            if (!pdfjsLib) throw new Error('pdf.js is not available.');
            setProgress(progress, 20, 'Extracting text...');
            const extraction = await extractPdfText(pdfjsLib, await files[0].arrayBuffer());
            if (slug === 'pdf-to-docx') {
              downloadBlob(new Blob(['<html><body><pre>' + escapeHtml(extraction.text) + '</pre></body></html>'], { type: 'application/msword' }), 'pdf-text-' + Date.now() + '.doc');
              output.value = extraction.text.slice(0, 12000);
              setMessage(message, 'success', 'Exported text-based DOC (limited reconstruction).');
            } else {
              const csv = extraction.text.split(/\r?\n/).map(function (line) { return '"' + String(line).replace(/"/g, '""') + '"'; }).join('\n');
              downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), 'pdf-text-' + Date.now() + '.csv');
              output.value = csv.slice(0, 12000);
              setMessage(message, 'success', 'Exported CSV-like text rows (best-effort).');
            }
            clearProgress(progress); return;
          }

          if (slug === 'pdf-to-pptx') {
            if (!pdfjsLib || !PptxGenRef) throw new Error('pdf.js or PptxGenJS is not available.');
            const scale = parseFloat(document.getElementById('spaGenericPptxScale').value || '1.5');
            const source = await pdfjsLib.getDocument({ data: await files[0].arrayBuffer() }).promise;
            const pptx = new PptxGenRef(); pptx.layout = 'LAYOUT_WIDE';
            for (let i = 1; i <= source.numPages; i += 1) {
              setProgress(progress, Math.round((i / source.numPages) * 85), 'Converting page ' + i + ' of ' + source.numPages + '...');
              const page = await source.getPage(i);
              const vp = page.getViewport({ scale: scale });
              const c = document.createElement('canvas'); c.width = vp.width; c.height = vp.height;
              await page.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
              pptx.addSlide().addImage({ data: c.toDataURL('image/png'), x: 0, y: 0, w: 13.33, h: 7.5 });
            }
            await pptx.writeFile({ fileName: 'pdf-to-pptx-' + Date.now() + '.pptx' });
            clearProgress(progress); setMessage(message, 'success', 'Generated PPTX from rendered PDF pages.'); return;
          }

          if (slug === 'docx-to-pdf') {
            if (!mammothRef || !html2canvasRef || !jsPDFRef) throw new Error('mammoth/html2canvas/jsPDF runtime is missing.');
            setProgress(progress, 15, 'Parsing DOCX...');
            const result = await mammothRef.convertToHtml({ arrayBuffer: await files[0].arrayBuffer() });
            const container = document.createElement('div');
            container.style.cssText = 'position:fixed;left:-10000px;top:0;width:900px;padding:24px;background:#fff;';
            container.innerHTML = result.value;
            document.body.appendChild(container);
            setProgress(progress, 60, 'Rendering document...');
            const canvas = await html2canvasRef(container, { scale: 2, backgroundColor: '#ffffff' });
            document.body.removeChild(container);
            const pdf = new jsPDFRef({ unit: 'pt', format: 'a4', orientation: 'portrait' });
            const w = pdf.internal.pageSize.getWidth();
            pdf.addImage(canvas.toDataURL('image/jpeg', 0.9), 'JPEG', 0, 0, w, (canvas.height * w) / canvas.width);
            downloadBlob(pdf.output('blob'), 'docx-to-pdf-' + Date.now() + '.pdf');
            clearProgress(progress);
            output.value = 'Warnings: ' + (result.messages || []).map(function (m) { return m.message; }).join(' | ');
            setMessage(message, 'success', 'Generated PDF from DOCX content (reflow-based).'); return;
          }

          if (slug === 'excel-to-pdf') {
            if (!jsPDFRef) throw new Error('jsPDF runtime is missing.');
            const lines = (await files[0].text()).split(/\r?\n/).slice(0, 300);
            const pdf = new jsPDFRef({ unit: 'pt', format: 'a4', orientation: 'portrait' });
            pdf.setFontSize(10); let y = 38;
            for (let i = 0; i < lines.length; i += 1) {
              if (y > 800) { pdf.addPage(); y = 38; }
              pdf.text(String(lines[i]).slice(0, 150), 28, y); y += 14;
            }
            downloadBlob(pdf.output('blob'), 'excel-to-pdf-' + Date.now() + '.pdf');
            output.value = 'Processed rows: ' + lines.length + '\nNote: CSV/TXT supported; binary XLSX requires additional parser.';
            setMessage(message, 'success', 'Generated PDF from tabular text content.'); return;
          }

          if (slug === 'pptx-to-pdf') {
            if (!JSZipRef || !jsPDFRef) throw new Error('JSZip or jsPDF runtime is missing.');
            const zip = await JSZipRef.loadAsync(await files[0].arrayBuffer());
            const slides = Object.keys(zip.files).filter(function (n) { return /^ppt\/slides\/slide\d+\.xml$/.test(n); })
              .sort(function (a, b) { return a.localeCompare(b, undefined, { numeric: true }); });
            const pdf = new jsPDFRef({ unit: 'pt', format: 'a4', orientation: 'portrait' });
            for (let i = 0; i < slides.length; i += 1) {
              setProgress(progress, Math.round((i / Math.max(slides.length, 1)) * 88), 'Reading slide ' + (i + 1) + '...');
              const xml = await zip.files[slides[i]].async('text');
              const parts = Array.from(xml.matchAll(/<a:t>(.*?)<\/a:t>/g)).map(function (m) { return m[1]; });
              if (i > 0) pdf.addPage();
              pdf.setFontSize(12); pdf.text('Slide ' + (i + 1), 32, 42);
              pdf.setFontSize(10); pdf.text(pdf.splitTextToSize(parts.join(' '), 530), 32, 62);
            }
            downloadBlob(pdf.output('blob'), 'pptx-to-pdf-' + Date.now() + '.pdf');
            output.value = 'Slides: ' + slides.length;
            clearProgress(progress); setMessage(message, 'success', 'Generated PDF from PPTX slide text.'); return;
          }

        } catch (error) {
          clearProgress(progress); setMessage(message, 'error', escapeHtml(error.message || 'Tool execution failed.'));
        }
      });

      reset();
      return;
    }

    if (slug === 'pdf-to-txt') {
      const pdfjsLib = getPdfJsLib();
      const fileInput = document.getElementById('spaPdfTxtFile');
      const dropzone = document.getElementById('spaPdfTxtDropzone');
      const extractButton = document.getElementById('spaPdfTxtExtract');
      const downloadButton = document.getElementById('spaPdfTxtDownload');
      const clearButton = document.getElementById('spaPdfTxtClear');
      const preview = document.getElementById('spaPdfTxtPreview');
      const meta = document.getElementById('spaPdfTxtMeta');
      const message = document.getElementById('spaPdfTxtMessage');
      const progress = document.getElementById('spaPdfTxtProgress');
      let pdfDoc = null;
      let fileName = 'document';
      let extractedText = '';

      function resetState() {
        pdfDoc = null;
        fileName = 'document';
        extractedText = '';
        if (meta) meta.innerHTML = '';
        if (preview) preview.value = '';
        if (extractButton) extractButton.disabled = true;
        if (downloadButton) downloadButton.disabled = true;
        setMessage(message, '', '');
        clearProgress(progress);
      }

      async function loadPdfFile(file) {
        if (!pdfjsLib) {
          setMessage(message, 'error', 'pdf.js is not available in the SPA shell.');
          return;
        }

        try {
          setMessage(message, '', '');
          setProgress(progress, 15, 'Loading PDF document...');
          const arrayBuf = await file.arrayBuffer();
          pdfDoc = await pdfjsLib.getDocument({ data: arrayBuf }).promise;
          fileName = (file.name || 'document').replace(/\.pdf$/i, '') || 'document';
          extractedText = '';
          preview.value = '';
          extractButton.disabled = false;
          downloadButton.disabled = true;
          meta.innerHTML = [
            '<span><strong>File:</strong> ' + escapeHtml(file.name || 'document.pdf') + '</span>',
            '<span><strong>Size:</strong> ' + formatFileSize(file.size || 0) + '</span>',
            '<span><strong>Pages:</strong> ' + pdfDoc.numPages + '</span>'
          ].join('');
          clearProgress(progress);
          setMessage(message, 'info', 'PDF loaded. Click "Extract Text" to process all pages.');
        } catch (error) {
          clearProgress(progress);
          setMessage(message, 'error', 'Failed to load PDF: ' + escapeHtml(error.message || 'Unknown error'));
        }
      }

      function triggerFilePicker() {
        if (fileInput) fileInput.click();
      }

      ['dragenter', 'dragover'].forEach(function (eventName) {
        dropzone.addEventListener(eventName, function (event) {
          event.preventDefault();
          event.stopPropagation();
          dropzone.classList.add('is-dragover');
        });
      });

      ['dragleave', 'drop'].forEach(function (eventName) {
        dropzone.addEventListener(eventName, function (event) {
          event.preventDefault();
          event.stopPropagation();
          dropzone.classList.remove('is-dragover');
        });
      });

      dropzone.addEventListener('click', triggerFilePicker);
      dropzone.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          triggerFilePicker();
        }
      });

      dropzone.addEventListener('drop', function (event) {
        const files = event.dataTransfer && event.dataTransfer.files;
        const file = files && files[0];
        if (!file) return;
        if (file.type === 'application/pdf' || /\.pdf$/i.test(file.name || '')) {
          loadPdfFile(file);
        } else {
          setMessage(message, 'error', 'Please drop a valid PDF file.');
        }
      });

      fileInput.addEventListener('change', function (event) {
        const file = event.target.files && event.target.files[0];
        if (!file) return;
        loadPdfFile(file);
        fileInput.value = '';
      });

      extractButton.addEventListener('click', async function () {
        if (!pdfDoc) {
          setMessage(message, 'error', 'Upload a PDF file first.');
          return;
        }

        try {
          extractedText = '';
          const totalPages = pdfDoc.numPages;
          setMessage(message, '', '');

          for (let pageIndex = 1; pageIndex <= totalPages; pageIndex += 1) {
            const pct = Math.round((pageIndex / totalPages) * 88);
            setProgress(progress, pct, 'Extracting page ' + pageIndex + ' of ' + totalPages + '...');
            const page = await pdfDoc.getPage(pageIndex);
            const content = await page.getTextContent();
            const text = content.items.map(function (item) {
              return item.str;
            }).join(' ');
            extractedText += text + '\n\n';
          }

          preview.value = extractedText.length > 14000
            ? extractedText.slice(0, 14000) + '\n\n... (preview truncated)'
            : extractedText;
          downloadButton.disabled = !extractedText.trim();
          setProgress(progress, 100, 'Extraction complete. Preparing result...');
          clearProgress(progress);
          setMessage(
            message,
            'success',
            'Extracted ' + extractedText.length.toLocaleString() + ' characters from ' + pdfDoc.numPages + ' page' + (pdfDoc.numPages !== 1 ? 's' : '') + '.'
          );

          if (extractedText.trim()) {
            const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
            downloadBlob(blob, fileName + '.txt');
          }
        } catch (error) {
          clearProgress(progress);
          setMessage(message, 'error', 'Text extraction failed: ' + escapeHtml(error.message || 'Unknown error'));
        }
      });

      downloadButton.addEventListener('click', function () {
        if (!extractedText.trim()) return;
        const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
        downloadBlob(blob, fileName + '.txt');
      });

      clearButton.addEventListener('click', function () {
        resetState();
        if (fileInput) fileInput.value = '';
      });

      resetState();
      return;
    }

    if (slug !== 'txt-to-pdf') return;
    const fileInput = document.getElementById('spaTxtFile');
    const textarea = document.getElementById('spaTxtContent');
    const convertButton = document.getElementById('spaTxtConvert');
    const clearButton = document.getElementById('spaTxtClear');
    const meta = document.getElementById('spaTxtMeta');
    const message = document.getElementById('spaTxtMessage');
    const progress = document.getElementById('spaTxtProgress');
    let fileName = 'text';

    function updateMeta() {
      const text = textarea.value || '';
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      const lines = text ? text.split(/\r?\n/).length : 0;
      meta.innerHTML = `
        <span><strong>Characters:</strong> ${text.length}</span>
        <span><strong>Words:</strong> ${words}</span>
        <span><strong>Lines:</strong> ${lines}</span>`;
    }

    fileInput.addEventListener('change', function (event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      fileName = (file.name || 'text').replace(/\.txt$/i, '') || 'text';
      const reader = new FileReader();
      reader.onload = function (loadEvent) {
        textarea.value = String(loadEvent.target.result || '');
        updateMeta();
        setMessage(message, 'info', 'Loaded text file: ' + escapeHtml(file.name));
      };
      reader.onerror = function () {
        setMessage(message, 'error', 'Failed to read the selected text file.');
      };
      reader.readAsText(file);
      fileInput.value = '';
    });

    textarea.addEventListener('input', updateMeta);

    clearButton.addEventListener('click', function () {
      textarea.value = '';
      fileName = 'text';
      updateMeta();
      setMessage(message, '', '');
      clearProgress(progress);
    });

    convertButton.addEventListener('click', function () {
      const text = textarea.value || '';
      const jsPDFRef = window.jspdf && window.jspdf.jsPDF;
      if (!text.trim()) {
        setMessage(message, 'error', 'Add some text or upload a .txt file first.');
        return;
      }
      if (!jsPDFRef) {
        setMessage(message, 'error', 'jsPDF is not available on this page.');
        return;
      }

      setMessage(message, '', '');
      setProgress(progress, 15, 'Preparing PDF document...');

      try {
        const pdf = new jsPDFRef({
          unit: 'pt',
          format: document.getElementById('spaTxtPageSize').value,
          orientation: document.getElementById('spaTxtOrientation').value
        });
        const fontSize = parseInt(document.getElementById('spaTxtFontSize').value, 10) || 12;
        const margin = parseInt(document.getElementById('spaTxtMargin').value, 10) || 40;
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const maxWidth = Math.max(pageWidth - margin * 2, 20);
        const lineHeight = fontSize * 1.4;
        let cursorY = margin;

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(fontSize);

        setProgress(progress, 45, 'Splitting text into printable lines...');
        const lines = pdf.splitTextToSize(text, maxWidth);

        for (let i = 0; i < lines.length; i += 1) {
          if (cursorY + lineHeight > pageHeight - margin) {
            pdf.addPage();
            cursorY = margin;
          }
          pdf.text(lines[i], margin, cursorY);
          cursorY += lineHeight;
        }

        setProgress(progress, 90, 'Generating download...');
        const blob = pdf.output('blob');
        downloadBlob(blob, fileName + '.pdf');
        clearProgress(progress);
        setMessage(message, 'success', 'TXT to PDF conversion complete. The file was downloaded automatically.');
      } catch (error) {
        clearProgress(progress);
        setMessage(message, 'error', 'Conversion failed: ' + escapeHtml(error.message || 'Unknown error'));
      }
    });

    updateMeta();
  };
})();
