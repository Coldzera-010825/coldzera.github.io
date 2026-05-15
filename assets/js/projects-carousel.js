/* ================================================================
   projects-carousel.js — Embla carousel rendering project slides
   Each slide: numeric mark + English title + Chinese subtitle +
   short description + optional external link.
   ================================================================ */
(function () {
  'use strict';

  if (typeof EmblaCarousel === 'undefined') {
    console.warn('[projects] Embla not available — skipping');
    return;
  }

  const PROJECTS = [
    {
      n: '01',
      accent: 'oklch(0.55 0.13 200)',
      accentSoft: 'oklch(0.92 0.04 200)',
      title: 'CA-Markov Urbanisation Prediction · Nanchang',
      zh: '基于 CA-Markov 模型的南昌市城市化趋势预测',
      body: 'A CA-Markov simulation forecasting Nanchang\'s 2030 land-use composition, with the goal of informing the city\'s long-term ecological balance under sustained urbanisation pressure.',
      link: 'https://www.researchgate.net/publication/364790236_Study_of_urbanization_trend_prediction_in_Nanchang_based_on_CA-Markov_model',
      linkLabel: 'Read on ResearchGate',
    },
    {
      n: '02',
      accent: 'oklch(0.55 0.13 145)',
      accentSoft: 'oklch(0.92 0.04 145)',
      title: 'CSLE × GeoDetector Soil Erosion · Dongjiang Basin',
      zh: '基于 CSLE 模型和 GeoDetector 的土壤侵蚀分析',
      body: 'Quantified the 2016–2020 spatial-temporal pattern of soil erosion across the Dongjiang basin using the Chinese Soil Loss Equation, multi-temporal Landsat vegetation inputs, and GeoDetector for attribution of rainfall, slope and vegetation contributions.',
      link: 'https://acsess.onlinelibrary.wiley.com/doi/abs/10.1002/saj2.20633',
      linkLabel: 'Soil Science Society of America Journal',
    },
    {
      n: '03',
      accent: 'oklch(0.65 0.15 30)',
      accentSoft: 'oklch(0.92 0.05 30)',
      title: 'Urban–Rural PM2.5 Differentiation · Ganzhou',
      zh: '赣州市 PM2.5 时空尺度的城乡差异分析与因素研究',
      body: 'A comparison of three interpolation methods against ground stations in Ganzhou, followed by a GeoDetector-based exploration of the urban–rural PM2.5 gradient and its driving factors.',
      link: '',
      linkLabel: '',
    },
    {
      n: '04',
      accent: 'oklch(0.50 0.16 280)',
      accentSoft: 'oklch(0.92 0.04 280)',
      title: 'U-Safety · Bristol Routing for Students',
      zh: '布里斯托城市安全性评估与学生路线规划',
      body: 'Integrated crime statistics, traffic data and spatial features into a Safety Index (predicted via SAE, ANN and SVM), then routed safer student commutes using Dijkstra\'s and A* algorithms.',
      link: '',
      linkLabel: '',
    },
    {
      n: '05',
      accent: 'oklch(0.60 0.14 50)',
      accentSoft: 'oklch(0.92 0.04 50)',
      title: 'Who Is the Top Dog?',
      zh: '机器学习在犬种人气分析中的应用',
      body: 'A side-study using regression and classification (linear, logistic, random forest, KNN, decision tree) to identify factors behind dog-breed popularity — an exercise in interpretable ML on a non-research dataset.',
      link: '',
      linkLabel: '',
    },
    {
      n: '06',
      accent: 'oklch(0.55 0.12 250)',
      accentSoft: 'oklch(0.92 0.04 250)',
      title: 'HCV Incidence Among People Who Inject Drugs · Georgia',
      zh: '格鲁吉亚注射毒品人群中丙型肝炎发病率分析',
      body: 'A team study cleaning and transforming over 1M HCV testing records in R, calculating seroconversion-based incidence rates, and producing geospatial visualisations of high-risk regions to support public-health planning.',
      link: '',
      linkLabel: '',
    },
    {
      n: '07',
      accent: 'oklch(0.55 0.13 145)',
      accentSoft: 'oklch(0.92 0.04 145)',
      title: 'Carbon Emissions in the Pearl River Basin',
      zh: '珠江流域碳排放时空特征研究 (co-author)',
      body: 'Co-authored work building a high-resolution carbon-emission grid (2001–2020) from land-use and biomass-burning records, using SHAP for interpretability. Forests emerged as the dominant carbon sink (>99 % sequestration); construction-land emissions grew by 175.9 %.',
      link: 'https://onlinelibrary.wiley.com/doi/10.1002/ldr.70043',
      linkLabel: 'Land Degradation & Development, 2025',
    },
  ];

  function makeSlide(p) {
    const slide = document.createElement('div');
    slide.className = 'hcar-slide';
    slide.innerHTML = `
      <div class="hcar-slide-inner" style="background:${p.accentSoft};">
        <svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" style="position:absolute;inset:0;width:100%;height:100%;">
          <defs>
            <pattern id="pat-${p.n}" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M32 0H0V32" fill="none" stroke="${p.accent}" stroke-opacity="0.18" stroke-width="0.5"/>
            </pattern>
            <radialGradient id="glow-${p.n}" cx="50%" cy="55%" r="55%">
              <stop offset="0%" stop-color="${p.accent}" stop-opacity="0.32"/>
              <stop offset="100%" stop-color="${p.accent}" stop-opacity="0"/>
            </radialGradient>
          </defs>
          <rect width="400" height="250" fill="url(#pat-${p.n})"/>
          <rect width="400" height="250" fill="url(#glow-${p.n})"/>
        </svg>
        <div class="hcar-slide-num">${p.n}</div>
        <div class="hcar-slide-caption">
          <div class="hcar-slide-caption-zh">${p.zh}</div>
          <div class="hcar-slide-caption-title">${p.title}</div>
          <p class="hcar-slide-caption-body">${p.body}</p>
          ${p.link ? `<p style="margin-top:14px;"><a href="${p.link}" target="_blank" rel="noopener" style="color: oklch(0.85 0.05 258); border-bottom: 0.5px solid oklch(0.85 0.05 258 / 0.5); padding-bottom: 2px; font-size: 13px; letter-spacing: 0.06em;">${p.linkLabel} ↗</a></p>` : ''}
        </div>
      </div>
    `;
    return slide;
  }

  const track = document.getElementById('projects-track');
  const viewport = document.querySelector('#projects-carousel .hcar-viewport');
  const dotsWrap = document.getElementById('projects-dots');
  const prevBtn = document.querySelector('#projects-carousel [data-prev]');
  const nextBtn = document.querySelector('#projects-carousel [data-next]');

  PROJECTS.forEach((p) => track.appendChild(makeSlide(p)));

  PROJECTS.forEach((_, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'hcar-dot';
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-label', `Project ${i + 1}`);
    btn.addEventListener('click', () => embla.scrollTo(i));
    dotsWrap.appendChild(btn);
  });

  const embla = EmblaCarousel(viewport, {
    align: 'start',
    loop: false,
    skipSnaps: false,
    containScroll: 'trimSnaps',
  });

  function syncControls() {
    const i = embla.selectedScrollSnap();
    dotsWrap.querySelectorAll('.hcar-dot').forEach((d, idx) => {
      d.classList.toggle('is-active', idx === i);
    });
    prevBtn.disabled = !embla.canScrollPrev();
    nextBtn.disabled = !embla.canScrollNext();
  }

  prevBtn.addEventListener('click', () => embla.scrollPrev());
  nextBtn.addEventListener('click', () => embla.scrollNext());
  embla.on('select', syncControls);
  embla.on('reInit', syncControls);
  syncControls();
})();
