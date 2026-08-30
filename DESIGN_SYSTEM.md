Ниже — версия именно для coding-агента: её можно положить в `DESIGN_SYSTEM.md` или добавить в system prompt проекта.

# DESIGN_SYSTEM.md

## Avito-inspired Product Design System

Build the interface using an Avito-inspired visual language: a mature consumer marketplace/product UI that is bright, friendly, highly functional, content-first, and easy to scan.

Do NOT copy Avito's logo, proprietary illustrations, exact layouts, icons, or branded assets. Reproduce the design principles and overall visual character.

---

# 1. Design principles

The UI should feel:

* friendly;
* simple;
* fast;
* trustworthy;
* colorful but controlled;
* rounded;
* product-oriented rather than editorial;
* optimized for large amounts of content.

Core visual formula:

White / neutral surfaces

* bold rounded typography
* vivid accent colors
* generous rounded corners
* clean marketplace cards
* simple geometric icons
* strong search/navigation
* minimal shadows
* clear information hierarchy.

Avoid:

* glassmorphism;
* excessive gradients;
* heavy shadows;
* luxury/minimal beige aesthetics;
* overly thin typography;
* tiny controls;
* excessive animation;
* decorative UI that hurts usability.

---

# 2. Design tokens

Use CSS variables as the single source of truth.

```css
:root {
  /* Backgrounds */
  --bg-primary: #ffffff;
  --bg-secondary: #f7f7f7;
  --bg-tertiary: #f2f2f2;
  --bg-hover: #f5f5f5;

  /* Text */
  --text-primary: #0f0f0f;
  --text-secondary: #5c5c5c;
  --text-tertiary: #858585;
  --text-inverse: #ffffff;

  /* Borders */
  --border-default: #e5e5e5;
  --border-strong: #d6d6d6;

  /* Brand-like accents */
  --accent-blue: #009cf0;
  --accent-blue-hover: #008bd6;

  --accent-purple: #965eeb;
  --accent-red: #ff4053;
  --accent-green: #00b67a;
  --accent-cyan: #00c7d9;
  --accent-yellow: #ffb800;

  /* Semantic */
  --success: #00a86b;
  --warning: #e89b00;
  --danger: #e82c41;
  --info: #008ed6;

  /* Radius */
  --radius-xs: 6px;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-2xl: 24px;
  --radius-pill: 999px;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 64px;
  --space-9: 96px;

  /* Shadows */
  --shadow-xs: 0 1px 2px rgb(0 0 0 / 0.04);
  --shadow-sm: 0 2px 8px rgb(0 0 0 / 0.06);
  --shadow-md: 0 8px 24px rgb(0 0 0 / 0.08);

  /* Layout */
  --container-width: 1280px;
  --container-padding: 24px;

  /* Motion */
  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --duration-slow: 250ms;

  --ease-default: cubic-bezier(0.2, 0, 0, 1);
}
```

Accent colors are approximate design tokens, not an instruction to reproduce Avito's proprietary brand palette exactly.

---

# 3. Typography

Preferred character:

* geometric sans-serif;
* slightly rounded;
* substantial weight;
* friendly rather than corporate;
* highly readable.

Do not depend on proprietary Avito fonts.

Good implementation options:

```css
font-family:
  Inter,
  "Manrope",
  "Arial",
  sans-serif;
```

If Manrope is available, prefer it for an especially friendly geometric appearance.

Base typography:

```css
body {
  font-family: Inter, Arial, sans-serif;
  font-size: 16px;
  line-height: 1.45;
  color: var(--text-primary);
  -webkit-font-smoothing: antialiased;
}
```

Typography scale:

```css
.display {
  font-size: clamp(40px, 5vw, 64px);
  line-height: 1.02;
  font-weight: 700;
  letter-spacing: -0.035em;
}

.h1 {
  font-size: clamp(32px, 4vw, 48px);
  line-height: 1.08;
  font-weight: 700;
  letter-spacing: -0.025em;
}

.h2 {
  font-size: clamp(28px, 3vw, 36px);
  line-height: 1.12;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.h3 {
  font-size: 24px;
  line-height: 1.2;
  font-weight: 650;
}

.h4 {
  font-size: 20px;
  line-height: 1.25;
  font-weight: 650;
}

.body-lg {
  font-size: 18px;
  line-height: 1.5;
}

.body {
  font-size: 16px;
  line-height: 1.45;
}

.body-sm {
  font-size: 14px;
  line-height: 1.4;
}

.caption {
  font-size: 12px;
  line-height: 1.35;
}
```

Headlines should look substantial.

Do not use `font-weight: 300` for important interface elements.

---

# 4. Layout

Use a centered responsive container.

```css
.container {
  width: min(
    calc(100% - var(--container-padding) * 2),
    var(--container-width)
  );

  margin-inline: auto;
}
```

Desktop:

* maximum content width: 1200–1400px;
* default target: 1280px;
* use a 12-column grid;
* gap: 20–24px.

Tablet:

* 8-column grid;
* horizontal padding: 20–24px.

Mobile:

* 4-column grid;
* horizontal padding: 16px;
* avoid unnecessarily nested containers.

Section spacing:

```css
.section {
  padding-block: 64px;
}

@media (max-width: 768px) {
  .section {
    padding-block: 40px;
  }
}
```

Prefer visual grouping through spacing instead of excessive borders.

---

# 5. Header

The header should be functional rather than decorative.

Recommended structure:

Logo / brand
→ primary navigation
→ search or location
→ favorites/account
→ primary CTA.

Desktop height:

```css
--header-height: 72px;
```

Keep the header visually light.

Avoid giant floating navigation bars and excessive glass effects.

Sticky behavior is acceptable:

```css
header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgb(255 255 255 / 0.96);
}
```

---

# 6. Search

Search is a first-class component.

For marketplace/directory/product interfaces it should often be one of the strongest elements on the page.

```css
.search {
  min-height: 52px;
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  border: 2px solid transparent;

  display: flex;
  align-items: center;

  transition:
    border-color var(--duration-fast),
    background var(--duration-fast);
}

.search:focus-within {
  background: #fff;
  border-color: var(--accent-blue);
}
```

Large hero search can use:

```css
.hero-search {
  min-height: 60px;
  border-radius: var(--radius-lg);
}
```

Search CTA should be visually obvious.

---

# 7. Buttons

Minimum interactive height:

```css
min-height: 44px;
```

Preferred standard:

```css
.button {
  min-height: 44px;
  padding: 0 20px;

  border: 0;
  border-radius: var(--radius-md);

  font-size: 15px;
  font-weight: 600;

  cursor: pointer;

  transition:
    background var(--duration-fast),
    transform var(--duration-fast);
}
```

Primary:

```css
.button-primary {
  background: var(--accent-blue);
  color: white;
}

.button-primary:hover {
  background: var(--accent-blue-hover);
}
```

Secondary:

```css
.button-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.button-secondary:hover {
  background: #e9e9e9;
}
```

Do not make every action primary.

One visual region should normally contain one obvious primary action.

---

# 8. Inputs

Inputs:

```css
.input {
  width: 100%;
  min-height: 48px;

  padding: 0 16px;

  background: var(--bg-secondary);

  border: 2px solid transparent;
  border-radius: var(--radius-md);

  font: inherit;
  color: var(--text-primary);

  outline: none;
}

.input:hover {
  background: #f2f2f2;
}

.input:focus {
  background: white;
  border-color: var(--accent-blue);
}
```

Textarea:

```css
textarea.input {
  min-height: 120px;
  padding-block: 14px;
  resize: vertical;
}
```

Always provide visible labels for important forms.

Do not rely exclusively on placeholders.

---

# 9. Cards

Cards are content-first.

Do not automatically put every piece of content inside a floating white box.

Recommended product card:

```css
.card {
  border-radius: var(--radius-lg);
  background: var(--bg-primary);
}

.card-media {
  overflow: hidden;
  border-radius: var(--radius-lg);
  background: var(--bg-secondary);
  aspect-ratio: 4 / 3;
}

.card-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

Product grid:

```css
.product-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 32px 20px;
}

@media (max-width: 1024px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px 12px;
  }
}
```

Typical hierarchy:

Image

Title

Price / primary value

Metadata

Location / time / status.

Example:

```text
MacBook Air 13"
85 000 ₽
M2 · 16 GB · 512 GB
Москва · сегодня
```

Primary value should be immediately visible.

---

# 10. Images

Use:

```css
object-fit: cover;
```

Prefer:

* authentic product photography;
* clear subjects;
* simple compositions;
* useful imagery.

Avoid:

* generic SaaS stock photography;
* random abstract 3D renders unless the product requires them;
* decorative images with no informational purpose.

---

# 11. Category components

Categories are an opportunity to introduce more color.

Use:

* circular icons;
* colored backgrounds;
* simple illustrations;
* concise labels.

Example structure:

```text
[ icon ]  Electronics
[ icon ]  Transport
[ icon ]  Services
[ icon ]  Property
```

Category icon containers:

```css
.category-icon {
  width: 56px;
  height: 56px;

  display: grid;
  place-items: center;

  border-radius: 50%;
}
```

Different categories may use different accent colors.

---

# 12. Chips

Use chips for:

* filters;
* categories;
* quick selections;
* active criteria.

```css
.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;

  min-height: 36px;
  padding: 0 14px;

  border-radius: var(--radius-pill);

  background: var(--bg-secondary);

  font-size: 14px;
  font-weight: 500;
}

.chip:hover {
  background: var(--bg-tertiary);
}

.chip-active {
  background: var(--text-primary);
  color: white;
}
```

On mobile, chip collections may horizontally scroll instead of wrapping into many rows.

---

# 13. Badges

Keep badges small.

```css
.badge {
  display: inline-flex;
  align-items: center;

  min-height: 24px;
  padding: 0 8px;

  border-radius: var(--radius-xs);

  font-size: 12px;
  font-weight: 600;
}
```

Use them only for useful states:

* new;
* verified;
* promoted;
* discount;
* delivery;
* status.

---

# 14. Icons

Use one consistent icon family.

Recommended:

* Lucide;
* custom simple SVG icons.

Properties:

```text
stroke-width ≈ 1.75–2px
rounded line caps
simple geometry
minimal internal detail
```

Common sizes:

```text
16px
20px
24px
32px
```

Do not mix multiple unrelated icon styles.

---

# 15. Border radius strategy

Rounded geometry is a core characteristic.

Use radius consistently:

```text
small controls       8px
inputs/buttons       12px
cards                16px
large panels         20–24px
chips                 999px
avatars/categories    50%
```

Do not randomly assign different radii to adjacent components.

---

# 16. Shadows

Use shadows sparingly.

Default cards generally should NOT need shadows.

Use shadows primarily for:

* dropdowns;
* popovers;
* floating menus;
* modals;
* temporary elevated UI.

Example:

```css
.dropdown {
  box-shadow: var(--shadow-md);
}
```

Avoid:

```css
box-shadow: 0 20px 80px rgba(...);
```

on normal content cards.

---

# 17. Dropdowns / popovers

```css
.popover {
  padding: 8px;

  background: white;
  border-radius: var(--radius-lg);

  box-shadow: var(--shadow-md);
}
```

Menu item:

```css
.menu-item {
  min-height: 40px;
  padding: 0 12px;

  display: flex;
  align-items: center;
  gap: 10px;

  border-radius: var(--radius-sm);
}

.menu-item:hover {
  background: var(--bg-secondary);
}
```

---

# 18. Modal

```css
.modal {
  width: min(520px, calc(100vw - 32px));

  padding: 24px;

  background: white;
  border-radius: var(--radius-xl);

  box-shadow: var(--shadow-md);
}
```

Backdrop:

```css
.modal-backdrop {
  background: rgb(0 0 0 / 0.45);
}
```

Mobile modals can become bottom sheets.

---

# 19. Empty states

Empty states should be friendly and concise.

Structure:

Simple icon / illustration

Short headline

One-sentence explanation

Primary action.

Avoid large corporate illustrations and excessive explanatory text.

---

# 20. Interaction states

Every interactive component must implement:

```text
default
hover
active
focus-visible
disabled
loading where applicable
```

Focus:

```css
:focus-visible {
  outline: 3px solid rgb(0 156 240 / 0.28);
  outline-offset: 2px;
}
```

Do not remove keyboard focus indicators.

---

# 21. Motion

Keep transitions fast.

```css
transition-duration: 150ms–250ms;
```

Recommended:

```css
transition:
  background 150ms,
  border-color 150ms,
  opacity 150ms,
  transform 150ms;
```

Hover movement should be tiny:

```css
transform: translateY(-1px);
```

Do NOT use large card zooms.

Respect reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
```

---

# 22. Responsive behavior

Desktop-first visual richness, mobile-first usability.

Breakpoints:

```css
--bp-sm: 480px;
--bp-md: 768px;
--bp-lg: 1024px;
--bp-xl: 1280px;
```

At `<768px`:

* reduce section spacing;
* simplify navigation;
* use 16px page gutters;
* preserve large touch targets;
* allow horizontally scrollable chips;
* convert complex modals to bottom sheets where appropriate;
* prioritize search and primary actions;
* remove nonessential secondary information.

Never simply scale the desktop UI down.

---

# 23. Accessibility

Target WCAG AA.

Requirements:

* sufficient text contrast;
* keyboard navigation;
* visible focus states;
* semantic HTML;
* proper form labels;
* alt text for meaningful images;
* buttons must be actual `<button>` elements;
* links must be actual `<a>` elements;
* minimum practical touch target around 44×44px.

Do not communicate important state using color alone.

---

# 24. Content hierarchy

Every screen should answer these questions immediately:

1. Where am I?
2. What is available here?
3. What is the primary action?
4. How do I search/filter?
5. What information matters most?

Prefer:

```text
primary information
↓
secondary information
↓
metadata
↓
optional actions
```

Do not give all text equal visual weight.

---

# 25. Hero sections

Avoid generic SaaS landing-page heroes such as:

```text
tiny badge

Huge revolutionary headline
centered paragraph
two CTA buttons

floating dashboard
```
