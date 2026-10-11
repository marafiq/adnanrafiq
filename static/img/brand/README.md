# Adnan Rafiq identity

The AR ligature shares one diagonal: the A’s right side also forms the R’s stem. A broad crossbar and compact bowl keep the silhouette clear at small sizes. Flat rust and peach match the existing blog palette; the outlined Georgia name keeps its editorial character.

## Integration

- `docusaurus.config.js`: use `img/logo.svg` and `img/logo-dark.svg` for the navbar’s native light/dark sources; keep the visible `Adnan Rafiq` title and use an empty image alt to avoid repeating its accessible name.
- `src/css/custom.css`: remove the old dark-mode image inversion so the supplied peach variant retains its color. Existing logo height remains 28px.
- `static/img/favicon.ico`: replace the former 2560px PNG disguised as an ICO with a real multi-image ICO containing native 16, 32 and 48px images. The existing favicon configuration already points here.
- `static/img/favicon.svg`: scalable charcoal tile / paper monogram; optional SVG favicon source.
- `static/img/brand/adnan-rafiq-lockup.svg` and `adnan-rafiq-lockup-dark.svg`: standalone name lockups with all lettering outlined. No font files or runtime font dependency.
- `static/img/brand/ar-monogram-ink.svg` and `ar-monogram-paper.svg`: monochrome marks for one-color use.
- `static/img/brand/favicon-{16,32,48,180,192,512}.png`: raster derivatives, including an optional 180px Apple touch icon. No manifest or head-tag changes are introduced.

Preserve the aspect ratio. Keep at least one stroke-width of clear space. Use the full name alongside the monogram when identifying the author; use the tile for favicon/avatar contexts. Do not recolor with CSS filters or add outlines, shadows, gradients, or code brackets.

## Validation

Built from main commit `ccbb738badb9ead68e0eb09233291475e6078179` in an isolated checkout. `npm run typecheck` and `npm run build` passed. SVG paths and raster exports were visually inspected in a rendered proof showing the header at its configured 28px canvas size, light/dark variants, native 16/32/48px favicons and enlarged pixel grids. The header proof is a reconstruction using the site’s geometry and palette; it is not a browser screenshot. Browser rendering, menu layout, and live favicon caching have not been verified because Chrome access remained unresolved. The approved release uses the existing GitHub-to-Vercel workflow. Browser checks require Computer Use permission; the in-app browser is unavailable.
