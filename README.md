# Shuhao Li — Personal Academic Website

A multi-page academic homepage showcasing research themes, projects, publications, and CV.
Hosted via GitHub Pages → [https://coldzera-010825.github.io/coldzera.github.io/](https://coldzera-010825.github.io/coldzera.github.io/)

Research focus: **geospatial data science, urban sustainability, and social equity in cities** — using multi-source data fusion, machine learning, and geospatial modelling to inform smarter, more inclusive urban policy.

## Site map

- **Home** (`index.html`) — Hero with a rotating procedural Earth (Three.js) and four life-points marked
- **About** (`about.html`) — Four research-theme cards that expand into fullscreen modals, plus a Leaflet map of education / work anchors (Ganzhou → Bristol → Wenzhou → Beijing)
- **Projects** (`projects.html`) — Seven projects in an Embla carousel
- **Publications** (`publications.html`) — Year-grouped list with DOI links
- **CV** (`CV.html`) — Embedded PDF + download

## Tech stack

| Layer | Choice |
|---|---|
| Markup | Static multi-page HTML (no build step) |
| Styling | Hand-written CSS — OKLCH design tokens, fluid `clamp()` typography, `@media` mobile overrides |
| Type | Google Fonts: Playfair Display (display serif), Cormorant SC (small-caps eyebrow), Space Grotesk (body) |
| JS | Vanilla — IIFE modules; no bundler, no framework |
| Visuals | **Three.js 0.158** (Hero globe) · **Leaflet 1.9 + OpenStreetMap** (bio map) · **Embla Carousel 8** (projects) |
| Deployment | GitHub Pages |

Design language is borrowed from [yc-lin.com](https://yc-lin.com) (Sea-level, Climate and Data Science Lab, CityU SEE).

## File layout

```
coldzera.github.io/
├─ index.html
├─ about.html
├─ projects.html
├─ publications.html
├─ CV.html
└─ assets/
   ├─ css/design-system.css        # tokens · type · components · mobile
   ├─ js/
   │  ├─ globe.js                  # Three.js procedural Earth
   │  ├─ reveal-words.js           # IntersectionObserver word-mask animation
   │  ├─ research-modal.js         # research grid + FLIP modal
   │  ├─ projects-carousel.js      # Embla project slides
   │  └─ bio-map.js                # Leaflet life-anchor map
   └─ fig/
      ├─ pic.jpg / pic2.jpg        # portraits
      └─ Shuhao LI_CV 4docx.pdf    # CV PDF
```

## Local preview

Open `index.html` directly in any modern browser. No build, no server required.

```powershell
start index.html
```

## Contact

- **Email** · [lishuhao010825@163.com](mailto:lishuhao010825@163.com)
- **GitHub** · [Coldzera-010825](https://github.com/Coldzera-010825)
- **LinkedIn** · [shuhao-li](https://www.linkedin.com/in/shuhao-li-3a347a31b/)
