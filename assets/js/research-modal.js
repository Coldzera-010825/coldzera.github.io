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
      accentSoft: 'oklch(0.92 0.05 30)',
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
      accentSoft: 'oklch(0.92 0.04 200)',
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
      accentSoft: 'oklch(0.92 0.04 280)',
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
      accentSoft: 'oklch(0.92 0.04 145)',
      tagline:
        'Tracking land-use change at the pace cities actually grow.',
      body: [
        'CA-Markov simulations on Nanchang. CSLE soil-loss modelling on the Dongjiang basin. PM2.5 spatial-temporal differentiation between urban and rural Ganzhou.',
        'Each project is a different question about how the surface of a region is being remade — by construction, by erosion, by air. Together they form the dataset I keep returning to when asking what "sustainable" actually means in numbers.',
      ],
      visual: 'rs',
    },
  ];

  /* ---- SVG visual fills (one per theme) ---- */
  function renderVisual(theme) {
    const a = theme.accent;
    const aSoft = theme.accentSoft;
    switch (theme.visual) {
      case 'uhi':
        // Concentric heat rings
        return `
          <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" style="width:100%;height:100%;display:block;background:${aSoft};">
            <defs>
              <radialGradient id="uhi-g" cx="50%" cy="60%" r="55%">
                <stop offset="0%" stop-color="${a}" stop-opacity="0.85"/>
                <stop offset="60%" stop-color="${a}" stop-opacity="0.18"/>
                <stop offset="100%" stop-color="${a}" stop-opacity="0"/>
              </radialGradient>
            </defs>
            <rect width="400" height="300" fill="url(#uhi-g)"/>
            ${[50,80,120,160,200].map((r,i)=>`<circle cx="200" cy="180" r="${r}" fill="none" stroke="${a}" stroke-opacity="${0.35 - i*0.06}" stroke-width="0.6"/>`).join('')}
          </svg>`;
      case 'justice':
        // Grid + scattered nodes
        return `
          <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" style="width:100%;height:100%;display:block;background:${aSoft};">
            <defs>
              <pattern id="jg" width="28" height="28" patternUnits="userSpaceOnUse">
                <path d="M28 0H0V28" fill="none" stroke="${a}" stroke-opacity="0.22" stroke-width="0.5"/>
              </pattern>
            </defs>
            <rect width="400" height="300" fill="url(#jg)"/>
            ${[[60,80],[140,120],[220,90],[300,160],[100,200],[260,220],[340,70],[180,240]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="4" fill="${a}"/>`).join('')}
            <path d="M60 80 L140 120 L220 90 L300 160" fill="none" stroke="${a}" stroke-opacity="0.5" stroke-width="0.8"/>
          </svg>`;
      case 'ml':
        // Network nodes radial
        return `
          <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" style="width:100%;height:100%;display:block;background:${aSoft};">
            <g transform="translate(200 150)">
              ${Array.from({length:12}).map((_,i)=>{const t=i/12*Math.PI*2;const x=Math.cos(t)*110,y=Math.sin(t)*110;return `<line x1="0" y1="0" x2="${x}" y2="${y}" stroke="${a}" stroke-opacity="0.32" stroke-width="0.6"/><circle cx="${x}" cy="${y}" r="3.5" fill="${a}"/>`}).join('')}
              <circle r="9" fill="${a}"/>
            </g>
          </svg>`;
      case 'rs':
        // Stratified bands (land-use layers)
        return `
          <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" style="width:100%;height:100%;display:block;background:${aSoft};">
            ${[0,0.18,0.34,0.5,0.66,0.82].map((t,i)=>`<rect x="0" y="${t*300}" width="400" height="${300/6 + 2}" fill="${a}" fill-opacity="${0.10 + (i%3)*0.07}"/>`).join('')}
            <path d="M0 90 Q 100 70 200 95 T 400 110" fill="none" stroke="${a}" stroke-opacity="0.55" stroke-width="1"/>
            <path d="M0 180 Q 120 165 240 175 T 400 195" fill="none" stroke="${a}" stroke-opacity="0.45" stroke-width="1"/>
          </svg>`;
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
        <div style="max-width: 820px; margin: 0 auto; padding: 96px 0 64px;">
          <p class="eyebrow" style="margin-bottom: 18px;">${theme.kicker}</p>
          <h2>${theme.title}</h2>
          <div class="modal-rule" style="background:${theme.accent};"></div>
          <p style="font-weight: 500;">${theme.tagline}</p>
          ${theme.body.map((p) => `<p>${p}</p>`).join('')}
          <p style="margin-top: 40px;">
            <a href="./projects.html" style="color: ${theme.accent}; border-bottom: 0.5px solid ${theme.accent}; padding-bottom: 2px;">See related projects ↗</a>
          </p>
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
