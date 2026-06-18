/* ================================================================
   research-modal.js — Research themes grid + FLIP-style modal
   Renders 4 theme cards into #research-grid; clicking a card
   expands its rectangle into a fullscreen modal via CSS transition,
   reverses on close. Vanilla JS, no framework.
   ================================================================ */
(function () {
  'use strict';

  const THEMES = [
    {
      id: 'uhi',
      title: 'Urban Heat Island & Vulnerability',
      kicker: 'Theme 01',
      accent: 'oklch(0.65 0.15 30)',     // warm coral
      accentSoft: 'oklch(0.94 0.025 30)',
      figure: {
        src: './assets/fig/Urban%20Heat%20Island%20%26%20Vulnerability.png',
        caption: 'Figure · Urban heat-island analysis — thermal anomalies over the city fabric',
      },
      tagline:
        'Mapping the disproportionate burden of urban heat on the people least equipped to escape it.',
      body: [
        'Heatwaves do not strike a city evenly. Working-class neighbourhoods, ageing high-rises, and communities far from green space absorb the worst of urban heat-island intensification — and the worst of the health consequences that follow.',
        'My work integrates Landsat thermal imagery, sociodemographic data, and machine-learning models (SAE, ANN, SVM) to surface the populations most exposed, and to predict how those patterns shift under continued urbanisation.',
      ],
      visual: 'uhi',
    },
    {
      id: 'justice',
      title: 'Environmental Justice & Access',
      kicker: 'Theme 02',
      accent: 'oklch(0.55 0.13 200)',    // teal
      accentSoft: 'oklch(0.94 0.022 200)',
      figure: {
        src: './assets/fig/Environmental%20Justice%20%26%20Access.png',
        caption: 'Figure · Spatial-access analysis — service-area mapping across the urban grid',
      },
      tagline:
        'Unequal access to infrastructure is a spatial fact. Geospatial data can name it precisely.',
      body: [
        'Who can walk to a clinic, a park, a safe transit stop? How does that change between a city centre and its periphery? Environmental justice research lives or dies on the answer.',
        'In Bristol I built U-Safety — a multi-source pipeline pairing crime statistics, traffic data, and spatial features with ML-derived safety indices, then routed student commutes through Dijkstra and A* to minimise exposure. The principle generalises: data infrastructure as policy infrastructure.',
      ],
      visual: 'justice',
    },
    {
      id: 'ml',
      title: 'Geospatial Machine Learning',
      kicker: 'Theme 03',
      accent: 'oklch(0.50 0.16 280)',    // indigo
      accentSoft: 'oklch(0.94 0.022 280)',
      figure: {
        src: './assets/fig/Geospatial%20Machine%20Learning.png',
        caption: 'Figure · Multi-source data fusion and interpretable modelling pipeline',
      },
      tagline:
        'Multi-source data fusion and interpretable ML for environmental-risk prediction.',
      body: [
        'A single satellite tells you something. A single census tract tells you something else. The work is in fusing them — gracefully, transparently, with respect for what each data source can and cannot say.',
        'Recent collaborations have used SHAP-interpretable models on carbon-emission grids across the Pearl River Basin, identifying forests as dominant carbon sinks and construction land as the fastest-growing emission source. Interpretability is not a luxury here; it is what makes results actionable.',
      ],
      visual: 'ml',
    },
    {
      id: 'rs',
      title: 'Remote Sensing & Urbanization',
      kicker: 'Theme 04',
      accent: 'oklch(0.55 0.13 145)',    // moss green
      accentSoft: 'oklch(0.94 0.022 145)',
      figure: {
        src: './assets/fig/Remote%20Sensing%20%26%20Urbanization.png',
        caption: 'Figure · Land-use classification and change detection from satellite imagery',
      },
      tagline:
        'Tracking land-use change at the pace cities actually grow.',
      body: [
        'CA-Markov simulations on Nanchang. CSLE soil-loss modelling on the Dongjiang basin. PM2.5 spatial-temporal differentiation between urban and rural Ganzhou.',
        'Each project is a different question about how the surface of a region is being remade — by construction, by erosion, by air. Together they form the dataset I keep returning to when asking what "sustainable" actually means in numbers.',
      ],
      visual: 'rs',
    },
  ];

  /* ---- Editorial SVG visuals — one bespoke composition per theme.
          800×600 viewBox, slice-fit so they fill any aspect ratio.
          Designed to read at card-size and stay tasteful when faded
          to ~18% opacity behind modal text. ---- */
  function renderVisual(theme) {
    // If a theme supplies its own image, prefer that (kept for future use).
    if (theme.image) {
      return `
        <div style="position:absolute;inset:0;background:${theme.accentSoft};">
          <img src="${theme.image}" alt="${theme.title}" loading="lazy"
               style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;display:block;" />
        </div>`;
    }

    const a = theme.accent;
    const aSoft = theme.accentSoft;
    const inkDim = 'oklch(0.45 0.008 275)';

    switch (theme.visual) {

      /* ---------- 01 Urban Heat Island ----------
       * Concentric isothermal bloom emanating from upper-right,
       * faint census-tract dot field below, a few accent-hot points. */
      case 'uhi': {
        const dots = [];
        for (let i = 0; i < 60; i++) {
          const x = 60 + Math.random() * 680;
          const y = 360 + Math.random() * 220;
          const r = 1.2 + Math.random() * 1.8;
          const hot = Math.random() < 0.18;
          dots.push(`<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(1)}" fill="${hot ? a : inkDim}" fill-opacity="${hot ? 0.85 : 0.28}"/>`);
        }
        return `
        <svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice"
             style="width:100%;height:100%;display:block;background:${aSoft};">
          <defs>
            <radialGradient id="uhi-bloom" cx="78%" cy="28%" r="62%">
              <stop offset="0%"  stop-color="${a}" stop-opacity="0.55"/>
              <stop offset="40%" stop-color="${a}" stop-opacity="0.22"/>
              <stop offset="100%" stop-color="${a}" stop-opacity="0"/>
            </radialGradient>
          </defs>
          <rect width="800" height="600" fill="url(#uhi-bloom)"/>
          ${[60,100,150,210,280,360,450,560].map((r,i)=>
            `<circle cx="624" cy="168" r="${r}" fill="none" stroke="${a}" stroke-opacity="${(0.38 - i*0.04).toFixed(2)}" stroke-width="0.6"/>`
          ).join('')}
          <line x1="0" y1="340" x2="800" y2="340" stroke="${inkDim}" stroke-opacity="0.10" stroke-width="0.5" stroke-dasharray="2 6"/>
          ${dots.join('')}
          <text x="40" y="62" font-family="'Cormorant SC', serif" font-weight="300" font-size="13" letter-spacing="0.3em" fill="${inkDim}" fill-opacity="0.55">ISOTHERMAL ANOMALY · °C</text>
          <text x="624" y="172" font-family="'Space Grotesk', sans-serif" font-weight="500" font-size="11" fill="${a}" text-anchor="middle">+4.8</text>
        </svg>`;
      }

      /* ---------- 02 Environmental Justice ----------
       * Schematic street grid with reachable / unreachable nodes,
       * a few curved walking-path connectors highlighted in accent. */
      case 'justice': {
        const nodes = [
          [140,180],[260,180],[380,180],[500,180],[620,180],
          [140,300],[260,300],[380,300],[500,300],[620,300],
          [140,420],[260,420],[380,420],[500,420],[620,420],
        ];
        const reachable = new Set(['1-1','1-2','1-3','0-2','0-3','2-2']);
        const paths = [
          'M260 300 Q 320 240 380 300 T 500 300',
          'M260 300 Q 260 240 260 180',
          'M380 300 Q 380 240 380 180',
        ];
        const grid = [];
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 5; c++) {
            const [x,y] = nodes[r*5+c];
            const isOn = reachable.has(`${r}-${c}`);
            grid.push(`<circle cx="${x}" cy="${y}" r="${isOn ? 6 : 4}" fill="${isOn ? a : 'none'}" stroke="${isOn ? a : inkDim}" stroke-width="${isOn ? 0 : 0.8}" stroke-opacity="${isOn ? 1 : 0.4}"/>`);
          }
        }
        return `
        <svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice"
             style="width:100%;height:100%;display:block;background:${aSoft};">
          <!-- thin street grid -->
          ${[140,260,380,500,620].map(x=>`<line x1="${x}" y1="120" x2="${x}" y2="480" stroke="${inkDim}" stroke-opacity="0.18" stroke-width="0.5"/>`).join('')}
          ${[180,300,420].map(y=>`<line x1="80" y1="${y}" x2="720" y2="${y}" stroke="${inkDim}" stroke-opacity="0.18" stroke-width="0.5"/>`).join('')}
          <!-- reachable paths -->
          ${paths.map(d=>`<path d="${d}" fill="none" stroke="${a}" stroke-opacity="0.55" stroke-width="1.2" stroke-linecap="round"/>`).join('')}
          <!-- nodes -->
          ${grid.join('')}
          <!-- callout -->
          <text x="40" y="62" font-family="'Cormorant SC', serif" font-weight="300" font-size="13" letter-spacing="0.3em" fill="${inkDim}" fill-opacity="0.55">ACCESS · 15-MIN WALKSHED</text>
          <text x="660" y="180" font-family="'Space Grotesk', sans-serif" font-weight="500" font-size="11" fill="${a}">CLINIC</text>
          <text x="660" y="305" font-family="'Space Grotesk', sans-serif" font-weight="500" font-size="11" fill="${a}">PARK</text>
        </svg>`;
      }

      /* ---------- 03 Geospatial Machine Learning ----------
       * Three stacked translucent raster-layer rectangles with subtle
       * inner pattern, vertical feature-extraction pipes through all,
       * a small node graph in the lower right. */
      case 'ml': {
        const features = [180, 280, 380, 480, 580];
        return `
        <svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice"
             style="width:100%;height:100%;display:block;background:${aSoft};">
          <defs>
            <pattern id="ml-dots" width="14" height="14" patternUnits="userSpaceOnUse">
              <circle cx="7" cy="7" r="0.9" fill="${inkDim}" fill-opacity="0.35"/>
            </pattern>
            <pattern id="ml-grid" width="16" height="16" patternUnits="userSpaceOnUse">
              <path d="M16 0 H0 V16" fill="none" stroke="${inkDim}" stroke-opacity="0.30" stroke-width="0.5"/>
            </pattern>
            <pattern id="ml-hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="10" stroke="${inkDim}" stroke-opacity="0.32" stroke-width="0.6"/>
            </pattern>
          </defs>

          <!-- three stacked raster layers -->
          <g transform="translate(120 130)">
            <rect width="420" height="90" fill="url(#ml-dots)"  stroke="${a}" stroke-opacity="0.45" stroke-width="0.8"/>
            <rect y="110" width="420" height="90" fill="url(#ml-grid)"  stroke="${a}" stroke-opacity="0.45" stroke-width="0.8"/>
            <rect y="220" width="420" height="90" fill="url(#ml-hatch)" stroke="${a}" stroke-opacity="0.45" stroke-width="0.8"/>

            <!-- layer labels -->
            <text x="-12" y="48"  text-anchor="end" font-family="'Cormorant SC', serif" font-weight="300" font-size="11" letter-spacing="0.22em" fill="${inkDim}">LANDSAT</text>
            <text x="-12" y="158" text-anchor="end" font-family="'Cormorant SC', serif" font-weight="300" font-size="11" letter-spacing="0.22em" fill="${inkDim}">CENSUS</text>
            <text x="-12" y="268" text-anchor="end" font-family="'Cormorant SC', serif" font-weight="300" font-size="11" letter-spacing="0.22em" fill="${inkDim}">ROAD · POI</text>

            <!-- feature pipes through all 3 layers -->
            ${features.map(x => `<line x1="${x-120}" y1="-12" x2="${x-120}" y2="322" stroke="${a}" stroke-opacity="0.45" stroke-width="0.8" stroke-dasharray="2 4"/>`).join('')}
            ${features.map(x => `<circle cx="${x-120}" cy="-12" r="2.5" fill="${a}"/>`).join('')}
          </g>

          <!-- node graph (model) -->
          <g transform="translate(540 460)">
            ${(()=>{
              const xs = [0,40,80,120], ys = [-30,-10,10,30,50];
              const layers = [
                xs.slice(0,1).map(x=>ys.slice(1,4).map(y=>[x,y])).flat(),
                xs.slice(1,2).map(x=>ys.map(y=>[x,y])).flat(),
                xs.slice(2,3).map(x=>ys.map(y=>[x,y])).flat(),
                xs.slice(3,4).map(x=>[[xs[3], 10]]).flat(),
              ];
              let out = '';
              for (let i = 0; i < layers.length - 1; i++) {
                for (const [x1,y1] of layers[i]) {
                  for (const [x2,y2] of layers[i+1]) {
                    out += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${inkDim}" stroke-opacity="0.22" stroke-width="0.4"/>`;
                  }
                }
              }
              for (const layer of layers) {
                for (const [x,y] of layer) {
                  out += `<circle cx="${x}" cy="${y}" r="2.5" fill="${a}" fill-opacity="0.7"/>`;
                }
              }
              return out;
            })()}
          </g>

          <text x="40" y="62" font-family="'Cormorant SC', serif" font-weight="300" font-size="13" letter-spacing="0.3em" fill="${inkDim}" fill-opacity="0.55">MULTI-SOURCE FUSION → MODEL</text>
        </svg>`;
      }

      /* ---------- 04 Remote Sensing & Urbanization ----------
       * Coarse pixel-grid satellite imagery on the left transitioning
       * to vector urban-footprint polygons on the right; a thin
       * time-arrow with tick markers along the bottom. */
      case 'rs': {
        const cells = [];
        const cols = 20, rows = 12;
        const cellW = 800 / cols, cellH = 400 / rows;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            // Imagery on the left third, fading into vector world on the right
            const fade = Math.max(0, Math.min(1, 1 - (c - 8) / 6));
            if (fade <= 0) continue;
            const x = c * cellW, y = 60 + r * cellH;
            const intensity = 0.08 + Math.random() * 0.32 * fade;
            const useAccent = Math.random() < 0.18 && fade > 0.5;
            cells.push(`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${cellW.toFixed(1)}" height="${cellH.toFixed(1)}" fill="${useAccent ? a : inkDim}" fill-opacity="${intensity.toFixed(2)}"/>`);
          }
        }
        // Vector urban footprint polygons on the right side
        const polys = [
          'M540 180 L580 168 L620 172 L640 200 L630 240 L590 248 L555 232 Z',
          'M560 280 L600 270 L640 290 L644 320 L612 340 L572 332 Z',
          'M520 380 L560 372 L600 390 L592 420 L548 428 L516 410 Z',
          'M620 200 L660 196 L688 220 L680 250 L644 252 Z',
        ];
        return `
        <svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice"
             style="width:100%;height:100%;display:block;background:${aSoft};">
          ${cells.join('')}
          ${polys.map(d=>`<path d="${d}" fill="${a}" fill-opacity="0.18" stroke="${a}" stroke-width="0.8"/>`).join('')}
          <!-- time arrow -->
          <line x1="60" y1="530" x2="740" y2="530" stroke="${inkDim}" stroke-opacity="0.4" stroke-width="0.6"/>
          <polygon points="740,530 732,526 732,534" fill="${inkDim}" fill-opacity="0.5"/>
          ${['2000','2010','2020'].map((label, i) => {
            const x = 120 + i * 290;
            return `<line x1="${x}" y1="524" x2="${x}" y2="536" stroke="${inkDim}" stroke-opacity="0.45" stroke-width="0.6"/>
                    <text x="${x}" y="552" text-anchor="middle" font-family="'Space Grotesk', sans-serif" font-weight="500" font-size="10" fill="${inkDim}" fill-opacity="0.6">${label}</text>`;
          }).join('')}
          <!-- scan line over imagery -->
          <line x1="0" y1="58" x2="540" y2="58" stroke="${a}" stroke-opacity="0.55" stroke-width="0.8"/>
          <text x="40" y="44" font-family="'Cormorant SC', serif" font-weight="300" font-size="13" letter-spacing="0.3em" fill="${inkDim}" fill-opacity="0.55">RASTER → VECTOR · LAND USE</text>
        </svg>`;
      }

      default:
        return `<div style="width:100%;height:100%;background:${aSoft};"></div>`;
    }
  }

  /* ---- Render grid ---- */
  const grid = document.getElementById('research-grid');
  if (!grid) return;

  THEMES.forEach((theme, idx) => {
    const card = document.createElement('div');
    card.className = 'research-box';
    card.dataset.themeId = theme.id;
    card.style.transitionDelay = (idx * 80) + 'ms';
    card.innerHTML = `
      <div class="research-box-visual">${renderVisual(theme)}</div>
      <span class="research-box-cue">Open&nbsp;→</span>
      <div class="research-box-meta">
        <span class="research-box-title">${theme.title}</span>
      </div>
    `;
    card.addEventListener('click', () => openModal(theme, card));
    grid.appendChild(card);
  });

  /* ---- Modal mechanics (FLIP) ---- */
  const modalRoot = document.getElementById('research-modal-root');
  let activeCard = null;

  function openModal(theme, cardEl) {
    if (activeCard) return;
    activeCard = cardEl;
    const r = cardEl.getBoundingClientRect();

    // Build overlay + frame
    const overlay = document.createElement('div');
    overlay.className = 'research-modal-overlay';
    modalRoot.appendChild(overlay);

    const frame = document.createElement('div');
    frame.className = 'pw-research-modal-frame';
    frame.style.cssText = `
      top: ${r.top}px; left: ${r.left}px;
      width: ${r.width}px; height: ${r.height}px;
      transition: top 620ms var(--ease), left 620ms var(--ease),
                  width 620ms var(--ease), height 620ms var(--ease);
    `;
    frame.innerHTML = `
      <div style="position:absolute;inset:0;opacity:1;transition:opacity 620ms ease;">
        ${renderVisual(theme)}
      </div>
      <button class="research-modal-close" type="button" aria-label="Close">
        <span>Close</span>
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
          <line x1="2" y1="2" x2="12" y2="12" stroke="currentColor" stroke-width="1"/>
          <line x1="12" y1="2" x2="2" y2="12" stroke="currentColor" stroke-width="1"/>
        </svg>
      </button>
      <div class="pw-research-modal-inner" data-inner>
        <div class="modal-content" style="padding: 96px 0 64px;">
          <header class="modal-header">
            <p class="eyebrow" style="margin-bottom: 18px;">${theme.kicker}</p>
            <h2>${theme.title}</h2>
            <div class="modal-rule" style="background:${theme.accent};"></div>
            <p style="font-weight: 500;">${theme.tagline}</p>
          </header>

          <div class="modal-split">
            <div class="modal-text">
              ${theme.body.map((p) => `<p>${p}</p>`).join('')}
              <p style="margin-top: 32px;">
                <a href="./projects.html" style="color: ${theme.accent}; border-bottom: 0.5px solid ${theme.accent}; padding-bottom: 2px;">See related projects ↗</a>
              </p>
            </div>

            ${theme.figure ? `
              <figure class="modal-figure">
                <img src="${theme.figure.src}" alt="${theme.title}" loading="lazy" />
                ${theme.figure.caption ? `<figcaption>${theme.figure.caption}</figcaption>` : ''}
              </figure>` : ''}
          </div>
        </div>
      </div>
    `;
    modalRoot.appendChild(frame);

    // Initial inner state: hidden
    const inner = frame.querySelector('[data-inner]');
    const visual = frame.querySelector('div[style*="opacity:1"]');
    inner.style.opacity = '0';
    inner.style.transition = 'opacity 420ms ease 200ms';
    inner.style.overflowY = 'hidden';
    inner.style.pointerEvents = 'none';

    document.body.style.overflow = 'hidden';
    cardEl.style.visibility = 'hidden';

    // Trigger FLIP: next frame
    requestAnimationFrame(() => {
      overlay.classList.add('is-open');
      frame.classList.add('is-full');
      frame.style.top = '0px';
      frame.style.left = '0px';
      frame.style.width = '100vw';
      frame.style.height = '100vh';
      visual.style.opacity = '0.18';
      // Reveal inner after frame finishes growing
      setTimeout(() => {
        inner.style.opacity = '1';
        inner.style.overflowY = 'auto';
        inner.style.pointerEvents = 'auto';
      }, 320);
    });

    const close = () => closeModal(theme, cardEl, overlay, frame, visual, inner, r);
    overlay.addEventListener('click', close);
    frame.querySelector('.research-modal-close').addEventListener('click', close);
    document.addEventListener('keydown', escHandler);

    function escHandler(e) {
      if (e.key === 'Escape') {
        document.removeEventListener('keydown', escHandler);
        close();
      }
    }
  }

  function closeModal(theme, cardEl, overlay, frame, visual, inner, rect) {
    inner.style.opacity = '0';
    inner.style.overflowY = 'hidden';
    inner.style.pointerEvents = 'none';
    visual.style.opacity = '1';
    overlay.classList.remove('is-open');

    // Recompute rect (window may have scrolled)
    const r = cardEl.getBoundingClientRect();
    frame.classList.remove('is-full');
    frame.style.top = r.top + 'px';
    frame.style.left = r.left + 'px';
    frame.style.width = r.width + 'px';
    frame.style.height = r.height + 'px';

    setTimeout(() => {
      modalRoot.removeChild(overlay);
      modalRoot.removeChild(frame);
      cardEl.style.visibility = 'visible';
      document.body.style.overflow = '';
      activeCard = null;
    }, 640);
  }
})();
