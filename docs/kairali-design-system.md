# Kairali Ayurvedic Products — Luxury Design System (2026)

## Overview & Philosophy
The Kairali design system establishes an authentic **Modern Ayurvedic Luxury** aesthetic. Inspired by classical Kerala wellness wisdom and contemporary digital luxury standards, it balances generous negative space, warm organic neutrals, botanical deep greens, and restrained typography.

### Guiding Principles
1. **Authentic, Not Simulated**: Reflects Kairali's 118-year Ayurvedic legacy (Since 1908).
2. **Restrained Luxury**: Whitespace, proportion, and quiet confidence over noisy gold gradients or cluttered sales badges.
3. **Additive & Non-Destructive**: Defined entirely under the `--kp-*` CSS variable namespace and `.kp-*` class namespace, leaving existing theme operations stable.

---

## 1. Color Palette

### Primary Swatches
| Token | Hex | Role |
| :--- | :--- | :--- |
| `--kp-color-deep-forest` | `#0D2D20` | Primary brand grounding color. Used for dark sections, primary buttons, high-contrast headings. |
| `--kp-color-warm-ivory` | `#FBF8F0` | Brand base background. Replaces harsh clinical pure white with warm, organic calm. |
| `--kp-color-warm-charcoal`| `#191816` | Primary body typography color. Provides deep contrast without the harshness of `#000000`. |
| `--kp-color-muted-sage` | `#A9BD9E` | Secondary botanical tone for accents, tags, and subtle badges. |
| `--kp-color-sandstone` | `#F5F2EB` | Secondary surface background for cards, alternating editorial panels, and containers. |
| `--kp-color-muted-gold` | `#C9A45C` | Sacred accent. Reserved strictly for seals, eyebrows, star ratings, and subtle insignia. |

### Semantic System
* `--kp-color-background`: `var(--kp-color-warm-ivory)`
* `--kp-color-surface`: `#FFFFFF`
* `--kp-color-surface-alt`: `var(--kp-color-sandstone)`
* `--kp-color-surface-dark`: `var(--kp-color-deep-forest)`
* `--kp-color-text`: `var(--kp-color-warm-charcoal)`
* `--kp-color-text-muted`: `rgba(25, 24, 22, 0.68)`
* `--kp-color-border`: `rgba(25, 24, 22, 0.12)`
* `--kp-color-success`: `#1A5B33`
* `--kp-color-error`: `#B43A3A`

### Usage Principles
* **WHEN TO USE Muted Gold (`#C9A45C`)**: Use as a deliberate accent for legacy emblems ("Since 1908"), ritual step numbers, star reviews, and category eyebrows.
* **WHEN NOT TO USE Muted Gold**: Never use gold for broad background panels, primary CTA buttons, or long text paragraphs. Avoid gold gradients.

---

## 2. Typography System

### Font Stacks
* **Display / Editorial**: `--kp-font-display: "Cormorant Garamond", "Playfair Display", "Cinzel", "Georgia", "Baskerville", serif;`
* **Headings / Contemporary Display**: `--kp-font-display-alt: "Jost", "Inter", sans-serif;`
* **Body**: `--kp-font-body: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;`
* **Labels / Eyebrows**: `--kp-font-label: "Inter", -apple-system, sans-serif;`

### Fluid Type Scale (Responsive clamp across 375px to 1920px)
* `Display XL` (`--kp-text-display-xl`): `clamp(2.75rem, 5.2vw + 1rem, 4.75rem)` (44px – 76px) — Luxury hero headline.
* `Display L` (`--kp-text-display-l`): `clamp(2.15rem, 3.8vw + 0.8rem, 3.75rem)` (34px – 60px) — Editorial narrative headers.
* `Display M` (`--kp-text-display-m`): `clamp(1.85rem, 2.8vw + 0.6rem, 2.75rem)` (30px – 44px) — Section main titles.
* `Heading XL` (`--kp-text-heading-xl`): `clamp(1.5rem, 2.1vw + 0.5rem, 2.25rem)` (24px – 36px) — Product title, key feature title.
* `Heading L` (`--kp-text-heading-l`): `clamp(1.25rem, 1.4vw + 0.5rem, 1.75rem)` (20px – 28px) — Card titles, drawer headers.
* `Heading M` (`--kp-text-heading-m`): `clamp(1.125rem, 0.8vw + 0.6rem, 1.375rem)` (18px – 22px) — Tab titles, modal subtitles.
* `Heading S` (`--kp-text-heading-s`): `clamp(1rem, 0.4vw + 0.65rem, 1.1875rem)` (16px – 19px) — Card subheadings.
* `Body L` (`--kp-text-body-l`): `clamp(1.0625rem, 0.3vw + 0.75rem, 1.1875rem)` (17px – 19px) — Editorial lead paragraphs.
* `Body M` (`--kp-text-body-m`): `1rem` (16px) — Standard body, product descriptions.
* `Body S` (`--kp-text-body-s`): `0.875rem` (14px) — Compact cards, helper text.
* `Caption` (`--kp-text-caption`): `0.75rem` (12px) — Disclaimers, timestamps, badges.
* `Label / Eyebrow` (`--kp-text-label`): `0.6875rem` (11px, tracked uppercase, letter-spacing 0.18em) — Category identifiers, badge pill text.

### Usage Principles
* **WHEN TO USE Display Serif**: Use `--kp-font-display` on grand narrative moments: Hero, "Since 1908", "Ayurveda, Rooted in Tradition", and editorial storytelling.
* **WHEN NOT TO USE Display Serif**: Do not use serif fonts on compact purchase controls, variant dropdowns, checkout labels, or dense table data.

---

## 3. Spacing Scale

Rhythm is based on an 8px base grid with 4px half-steps:
* `--kp-space-1`: `4px` — Micro gap, inline badge margin
* `--kp-space-2`: `8px` — Icon-to-text gap, compact stack
* `--kp-space-3`: `12px` — Field inner padding, button icon spacing
* `--kp-space-4`: `16px` — Card inner padding (mobile), standard gap
* `--kp-space-5`: `24px` — Card inner padding (desktop), stack distance
* `--kp-space-6`: `32px` — Sub-section margins, grid track gap
* `--kp-space-7`: `48px` — Major component separation
* `--kp-space-8`: `64px` — Section vertical rhythm (mobile/tablet)
* `--kp-space-9`: `96px` — Section vertical rhythm (desktop)
* `--kp-space-10`: `128px` — Hero & milestone section separation

---

## 4. Container System

Containers control horizontal bounds and guttering without impacting global body rules:
* `--kp-container-sm` (`640px`): Editorial reading column, testimonial quotes.
* `--kp-container-md` (`960px`): Educational guides, ritual sequences.
* `--kp-container-lg` (`1200px`): Standard 3-to-4 column product grids.
* `--kp-container-xl` (`1440px`): Balanced luxury viewport with generous breathing room.
* `--kp-container-wide` (`1600px`): Full luxury storefront width matching theme limits.
* `--kp-gutter`: `clamp(16px, 4vw, 48px)` — Responsive screen edge padding.

---

## 5. Radius System

Subtle, architectural edges preserve a high-end luxury feel:
* `--kp-radius-none`: `0px` — Edge-to-edge full width images
* `--kp-radius-sm`: `4px` — Compact chips, input fields
* `--kp-radius-md`: `8px` — Product cards, modal overlays
* `--kp-radius-lg`: `12px` — Feature containers, editorial picture cards
* `--kp-radius-pill`: `9999px` — CTA buttons, category filter pills, concern tags

### Usage Principles
* **WHEN TO USE Pill Radius**: Category pills ("Hair Fall", "Dry Skin"), CTA buttons ("Add to Bag", "Explore Rituals").
* **WHEN NOT TO USE Pill Radius**: Do not use pill radius on rectangular product cards or imagery.

---

## 6. Shadow System

Soft, diffused natural ambient depth that mimics soft ambient light:
* `--kp-shadow-soft`: `0 2px 10px rgba(25, 24, 22, 0.04), 0 1px 3px rgba(25, 24, 22, 0.02)`
* `--kp-shadow-card`: `0 8px 24px rgba(13, 45, 32, 0.06), 0 2px 6px rgba(13, 45, 32, 0.03)`
* `--kp-shadow-floating`: `0 20px 48px rgba(13, 45, 32, 0.12), 0 4px 12px rgba(13, 45, 32, 0.04)`

---

## 7. Motion & Transitions

Calm, dignified transitions that enhance rather than distract:
* `--kp-duration-fast`: `150ms` (Micro interactions, buttons, hover)
* `--kp-duration-normal`: `250ms` (Dropdowns, card lifts, tabs)
* `--kp-duration-slow`: `400ms` (Drawers, modals, accordion reveals)
* `--kp-ease-luxury`: `cubic-bezier(0.2, 0.0, 0.1, 1)` (Deceleration with poise)
* **Accessibility**: Automatically falls back to `0.01ms` under `@media (prefers-reduced-motion: reduce)`.

---

## 8. Button Foundations

* **Primary (`.kp-btn--primary`)**: Deep Forest background (`#0D2D20`), Warm Ivory text (`#FBF8F0`), pill radius, 48px touch target.
* **Secondary (`.kp-btn--secondary`)**: Transparent background, 1px Deep Forest border, Deep Forest text. Inverts smoothly on hover.
* **Tertiary (`.kp-btn--tertiary`)**: Underlined link style, zero padding, Deep Forest text transitioning to classical bronze on hover.

---

## 9. Breakpoint Strategy

Consistent responsive reference points:
* Mobile S/M: `375px` – `390px`
* Mobile L: `480px`
* Tablet: `768px`
* Desktop: `1024px`
* Desktop L: `1440px`
* Desktop XL / Ultra-wide: `1920px`
