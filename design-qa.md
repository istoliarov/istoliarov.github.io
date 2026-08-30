# Design QA

## Career Feed home

- Source visual truth: `assets/design/career-feed-concept.png`
- Responsive references: `assets/design/career-feed-mobile-light.png`, `assets/design/career-feed-mobile-dark.png`, `assets/design/career-feed-desktop-dark.png`
- Intended implementation URL: `http://127.0.0.1:4173/`
- Target viewports: desktop `1440 × 1024`; mobile `390 × 844`
- States: desktop light/dark; mobile light/dark; theme mode `auto`
- Implementation pixels: unavailable

The in-app Browser runtime exits before opening the page. Static checks passed, but rendered visual comparison remains blocked.

## Apps & projects

- Source visual truth: `assets/design/apps-concept-desktop-light.png`
- Responsive references: `assets/design/apps-concept-desktop-dark.png`, `assets/design/apps-concept-mobile-light.png`, `assets/design/apps-concept-mobile-dark.png`
- Product assets: `assets/images/apps/simplecard-light.png`, `assets/images/apps/simplecard-dark.png`, `assets/images/apps/easy-share-light.png`, `assets/images/apps/easy-share-dark.png`
- Intended implementation URL: `http://127.0.0.1:4173/apps/`
- Target viewports: desktop `1440 × 1024`; mobile `390 × 844`
- States: desktop light/dark; mobile light/dark; theme modes `auto`, `light`, `dark`; search/filter empty state; mobile navigation
- Implementation pixels: unavailable
- Density normalization: blocked before capture

### Full-view comparison evidence

The selected desktop and mobile references and all final raster assets are stored in the project. The in-app Browser runtime exited during startup before a rendered screenshot could be captured, so no pixel-level comparison is claimed.

### Focused comparison evidence

Blocked for the same reason. Code inspection confirms the intended page structure, breakpoints, theme image switching and interaction states, but it is not a substitute for rendered evidence.

### Checks completed

- The local `/apps/` page responds with HTTP 200.
- JavaScript syntax check passed.
- `git diff --check` passed.
- JSON-LD parses successfully and describes both live products.
- Every local image, stylesheet and script reference resolves.
- Light, dark and auto theme modes use the shared `portfolio-theme` preference.
- Search, technology filters, result count, empty state, `/` shortcut and mobile navigation are implemented.
- Product previews are real raster assets rather than CSS art.

### Findings

- [P0] Browser-rendered evidence is unavailable.
  - Location: `/apps/`, all target viewports and themes.
  - Evidence: the in-app Browser process exits during startup.
  - Impact: visual fidelity, image crop, font rendering, overflow and interaction behavior cannot be signed off.
  - Fix: with explicit user approval, use the Playwright fallback to capture all four viewport/theme combinations, compare them with the stored references and iterate on visible P0/P1/P2 differences.

### Comparison history

- Initial pass: blocked before the first browser capture; no visual fixes are claimed without rendered evidence.

## Final result

final result: blocked
