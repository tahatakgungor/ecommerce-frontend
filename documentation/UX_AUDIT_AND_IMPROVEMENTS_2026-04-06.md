# UX Audit and Improvement Backlog (Storefront + Admin)

Date: 2026-04-06  
Scope: `harri-front-end` + `harri-admin-panel` (web + mobile)

This document follows the requested format for every finding:
- **Impact level**
- **Root cause**
- **Implementation fix**
- **Acceptance test criteria**

---

## Storefront Findings

### 1) Review modal typography / button rhythm mismatch
- Impact level: **High**
- Root cause: Review modal relied on many inline styles without a shared scale.
- Implementation fix: Move to class-based modal style layer (`quick-review-modal__*`), unify heading/label/helper/button sizes, enforce primary vs secondary button hierarchy, normalize mobile spacing and title clamp.
- Acceptance test criteria:
  - At `360x917` and `390x844`, title, labels, inputs, helper text and buttons look proportionate.
  - `Kapat` appears as secondary; `Kaydet/Güncelle` appears as primary with stable width while loading.

### 2) Product card rating + review count not fitting card rhythm
- Impact level: **High**
- Root cause: Rating meta used rigid single-line behavior and truncation assumptions.
- Implementation fix: Keep rating under title as fixed meta zone; on mobile allow controlled wrap (`meta` wraps, count can break line), keep stars readable and review-count link behavior intact.
- Acceptance test criteria:
  - On home/shop cards at `360` and `390`, rating row remains readable and does not overflow card.
  - Review count remains clickable and navigates to `?tab=reviews#reviews`.

### 3) View-all CTA hierarchy confusion
- Impact level: **Medium**
- Root cause: `View All Products` CTA was attached to the offer/deal block instead of the main product exploration zone.
- Implementation fix: Place CTA beside Popular Products heading and keep offer section focused on campaign content.
- Acceptance test criteria:
  - CTA appears in Popular Products header on desktop.
  - CTA remains discoverable on mobile without pushing tab controls off-screen.

### 4) Header icon visual drift across breakpoints
- Impact level: **Medium**
- Root cause: Mobile header had ad-hoc icon box/hamburger offsets separate from desktop icon rhythm.
- Implementation fix: Align icon scale and badge rhythm with desktop visual language, fix hamburger baseline alignment, avoid extra ornamental boxes.
- Acceptance test criteria:
  - Mobile header icons align on a single baseline.
  - Hamburger does not appear visually lower/higher than sibling icons.

---

## Admin Panel Findings

### 5) Main layout overflow risk (sidebar + content width)
- Impact level: **High**
- Root cause: Content wrapper width was hard-calculated globally and could conflict with mobile/sidebar states.
- Implementation fix: Make main content `w-full` by default, apply calc widths only at `lg/xl`, enforce `min-w-0` and `overflow-x-hidden` guardrails.
- Acceptance test criteria:
  - On mobile/tablet, opening and closing sidebar never causes horizontal page overflow.
  - No clipped header/content after sidebar transition.

### 6) Table responsiveness inconsistent across modules
- Impact level: **High**
- Root cause: Mixed table wrappers (`overflow-scroll`, fixed width containers like `w-[975px]`, `w-[1500px]`).
- Implementation fix: Introduce unified shell pattern (`admin-table-shell`) with horizontal scrolling and controlled min table widths; apply to Orders, Reviews, Newsletter, Customers, Brand, Category, Coupon screens.
- Acceptance test criteria:
  - At `390` and `768`, tables remain operable via horizontal scroll.
  - Action buttons remain tappable and readable when rows wrap.

### 7) Fixed-width auth form blocks on small screens
- Impact level: **Medium**
- Root cause: Pages used hard widths (`w-[500px]`) and large fixed paddings.
- Implementation fix: Convert to `w-full max-w-[500px]`, reduce top/vertical paddings on mobile.
- Acceptance test criteria:
  - Login/Register/Forgot screens fit without clipping at `360x800`.
  - Form controls preserve comfortable touch targets.

### 8) Body content spacing too rigid for mobile
- Impact level: **Medium**
- Root cause: Most pages used fixed `px-8 py-8` page containers.
- Implementation fix: Add global `.body-content` responsive spacing policy.
- Acceptance test criteria:
  - Page cards are not cramped on mobile.
  - No unnecessary side gutters causing content squeeze.

---

## Cross-App Component Contract (UI Standardization)

### Buttons
- Primary: height `40-44px`, weight `600`, clear loading state, stable min width.
- Secondary (`tp-btn-border`): same vertical rhythm as primary.
- Tertiary/icon button: minimum target `36x36` on mobile.

### Inputs and Form Text
- Label: `12px / 600`
- Input text: `13-14px`
- Helper/Error: `11-12px`
- Vertical rhythm: `label 4px gap input`, grouped sections with `10-14px` spacing.

### Card Skeleton
- Title zone: clamp (1-2 lines based on context)
- Meta zone (rating/status): must not overlap with action zone
- Action zone: fixed target sizes and predictable alignment

### Badge/Chip System
- Status chips: consistent font (`11-12px`), rounded shape, semantic color mapping
- Count badges: fixed square/circle tokens and predictable offsets

---

## Verification Matrix

### Breakpoints
- `360`, `390`, `768`, `1024`, `1280`

### Critical flow checks
1. Storefront
- Product cards: title + rating + review-count + price alignment
- Review modal: readability, action hierarchy, star selection usability
- Review-count navigation: always opens review tab

2. Admin
- Sidebar open/close: no horizontal overflow
- Orders/Reviews/Newsletter/Customers tables: scroll + actions usable
- Auth pages: no clipping, no fixed-width breakage

3. Regression
- `harri-front-end`: lint + build pass
- `harri-admin-panel`: lint + build pass

