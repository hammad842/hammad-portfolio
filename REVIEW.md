# Portfolio review — 18 November 2026

## Fixed
- Custom cursor now moves into the active modal dialog, so it stays visible above the menu.
- Cursor coordinates account for dialog borders, scrolling and entrance animation.
- Cursor remains visible when motion is paused.
- Carhartt inline previews now receive the motion setting, including after switching versions.
- CSS/JS version parameters refresh cached assets.

## Verification completed
- Menu open, close and Escape; cursor returns to the page after closing.
- Light and dark menu cursor; cursor coordinates on both sides; EXPLORE hover state.
- Four category tabs: 20 websites, 13 social, 15 branding, 7 posters.
- Search: matching, empty and reset states.
- Direct project detail navigation, Desigxx full design, artwork collections and Carhartt version switch.
- Motion pause/play; cursor stays visible with motion disabled.
- Responsive layouts at 375, 768 and 1280 pixel frame widths; 1/2/3 columns; no horizontal document overflow. Mobile menu fits its viewport.
- 698 local media/link checks: no missing files. JavaScript syntax checks passed.
- Thumbnail editor loads all 20 projects; editor JavaScript syntax passed.

## Scope
Browser checks used Chrome and responsive frames, not physical phones or Safari. External email/WhatsApp links were reviewed without sending messages. Thumbnail uploads and deployment to a personal GitHub account require your local action. Standard GitHub Pages hosting is public; the existing hosted portfolio access was preserved.
