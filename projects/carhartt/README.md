# Carhartt website — Black & White

## Open the website

1. Extract the complete ZIP folder.
2. Open **index.html** in Chrome, Safari, Firefox or Edge.
3. **black.html** and **white.html** open each version directly.
4. Open the hamburger menu to switch between Black and White.

No installation, internet connection, framework, build step or web server is required. Keep the HTML files, styles.css, app.js and assets folder together.

## What is included

- Three HTML entry points: index.html (black), black.html and white.html.
- styles.css: theme colors, exact reference dimensions and page styling.
- app.js: proportional screen fitting, navigation, theme switching and preview dialogs.
- motion.js / motion.css: the portfolio animation layer.
- assets/: separate original product/campaign images, with transparency preserved, and reconstructed reference webfont subsets.
- design-layout.json: source coordinates and text mapping for developer handoff.

## Design fidelity

The website is built from individual HTML sections, image elements, selectable HTML text and SVG logo/icon assets. It is not a full-page screenshot. The original image crops, transparent hero overlap, rotated lookbook image, typography and spacing were reconstructed from both supplied PDFs.

The desktop composition uses the original 1920 × 8847 design coordinate system. It scales proportionally to the available screen width so the composition stays the same. A separate stacked mobile redesign is not included because the requirement was to preserve the supplied design exactly; small text consequently scales down on narrow screens.

The supplied PDF did not contain reusable standard font files. Small WOFF subsets were reconstructed from the supplied glyph artwork for the existing copy, preserving those letterforms. The original font family names and complete character sets are not available. For adding substantial new text, use the original licensed fonts or specify a suitable replacement.

## Editing

HTML sections are named masthead, hero, intro, products, footwear, collection, statement, looks, pattern and footer. Position values follow the PDF coordinates. Each text block has a copy-N ID and editable HTML character spans; their positions are retained for fidelity. design-layout.json documents the text and corresponding positions. Photos can be replaced in assets; retain the filenames or update the HTML source paths.

For more conventional flowing paragraphs, replace the glyph spans inside the corresponding .copy element with ordinary text and apply the original font. The current fixed positions intentionally preserve the supplied typography.

## Portfolio animations

- Staggered 3D letter entrance, cinematic hero-image reveal and portrait entrance.
- Layered hero parallax tied to natural page scrolling.
- Staggered image and text reveals as sections enter the screen.
- Product-image hover zoom, magnetic navigation controls and a floating VIEW cursor on mouse devices.
- Oversized continuous typography marquee, with pause on hover.
- Gentle scroll-linked movement on the original tilted lookbook photo.
- Animated menu and preview dialogs, gold footer hover accents and scroll progress.
- Circular Black/White transition on browsers supporting View Transitions, with an immediate theme-change fallback.

Animations run offline through native browser APIs. Scrolling remains native. Offscreen marquee motion pauses. Touch devices retain native interaction; operating-system Reduce Motion settings disable the motion effects. Print output remains static. The settled layout and original image transforms are preserved. Animation intensity and timings can be edited in motion.js and motion.css.

## Preview interactions

- The menu opens and navigates to homepage sections.
- Black/White switching works in the menu, or through ?theme=black / ?theme=white.
- Product cards open product previews.
- Footwear cards open collection previews.
- Lookbook navigates to the collection.
- Newsletter validates an email locally and shows a preview confirmation.
- Bag and account open clearly labeled previews.

This package implements the supplied homepage front end. Checkout, accounts, stock, newsletter delivery, legal/content pages and social destinations require separate integration. No personal data is sent or stored. Add approved destination URLs and services before publishing.

## Validation

Both HTML versions were rendered and compared with the supplied PDF designs. All bundled source references and JavaScript syntax were checked. Animation initialization, reveal triggers, both theme entry points, preview interactions and reduced-motion cleanup were checked in a DOM test environment. Pixel antialiasing can vary between browser engines and displays. The local headless Chromium process was unavailable in the build environment; print-engine rendering was used for visual checks.

The brand, photographs and original artwork come from the supplied PDFs; this package does not grant additional ownership or licensing rights.
