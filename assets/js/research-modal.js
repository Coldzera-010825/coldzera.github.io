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
      titleZh: '城市热岛与脆弱人群',
      kicker: 'Theme 01',
      kickerZh: '主题 01',
      accent: 'oklch(0.65 0.15 30)',     // warm coral
      accentSoft: 'oklch(0.92 0.05 30)',
      tagline:
        'Mapping the disproportionate burden of urban heat on the people least equipped to escape it.',
      taglineZh:
        '描绘城市热浪如何不成比例地落在最难躲避它的人身上。',
      body: [
        'Heatwaves do not strike a city evenly. Working-class neighbourhoods, ageing high-rises, and communities far from green space absorb the worst of urban heat-island intensification — and the worst of the health consequences that follow.',
        'My work integrates Landsat thermal imagery, sociodemographic data, and machine-learning models (SAE, ANN, SVM) to surface the populations most exposed, and to predict how those patterns shift under continued urbanisation.',
      ],
      bodyZh: [
        '热浪并不会平均地降落在一座城市之上。工薪阶层社区、老旧高层、远离绿地的街区，承担了城市热岛加剧最严重的部分——以及随之而来的最严重的健康代价。',
        '我的工作将 Landsat 热红外影像、社会人口数据与机器学习模型（SAE、ANN、SVM）相结合，识别出最易暴露的人群，并预测在持续城市化进程下这些模式将如何变化。',
      ],
      visual: 'uhi',
    },
    {
      id: 'justice',
      title: 'Environmental Justice & Access',
      titleZh: '环境正义与可达性',
      kicker: 'Theme 02',
      kickerZh: '主题 02',
      accent: 'oklch(0.55 0.13 200)',    // teal
      accentSoft: 'oklch(0.92 0.04 200)',
      tagline:
        'Unequal access to infrastructure is a spatial fact. Geospatial data can name it precisely.',
      taglineZh:
        '基础设施的不平等是一种空间事实，地理空间数据可以精确地指出它。',
      body: [
        'Who can walk to a clinic, a park, a safe transit stop? How does that change between a city centre and its periphery? Environmental justice research lives or dies on the answer.',
        'In Bristol I built U-Safety — a multi-source pipeline pairing crime statistics, traffic data, and spatial features with ML-derived safety indices, then routed student commutes through Dijkstra and A* to minimise exposure. The principle generalises: data infrastructure as policy infrastructure.',
      ],
      bodyZh: [
        '谁能走到诊所、公园、一个安全的公交站？市中心与外围之间，这样的距离又会如何变化？环境正义研究的成败，正系于对这些问题的回答。',
        '在布里斯托，我搭建了 U-Safety——一条多源数据流水线，将犯罪统计、交通数据与空间特征与机器学习导出的安全指数结合，再以 Dijkstra 与 A* 算法为学生通勤规划最低风险路径。其中的原则可以推广：数据基础设施即政策基础设施。',
      ],
      visual: 'justice',
    },
    {
      id: 'ml',
      title: 'Geospatial Machine Learning',
      titleZh: '地理空间机器学习',
      kicker: 'Theme 03',
      kickerZh: '主题 03',
      accent: 'oklch(0.50 0.16 280)',    // indigo
      accentSoft: 'oklch(0.92 0.04 280)',
      tagline:
        'Multi-source data fusion and interpretable ML for environmental-risk prediction.',
      taglineZh:
        '面向环境风险预测的多源数据融合与可解释机器学习。',
      body: [
        'A single satellite tells you something. A single census tract tells you something else. The work is in fusing them — gracefully, transparently, with respect for what each data source can and cannot say.',
        'Recent collaborations have used SHAP-interpretable models on carbon-emission grids across the Pearl River Basin, identifying forests as dominant carbon sinks and construction land as the fastest-growing emission source. Interpretability is not a luxury here; it is what makes results actionable.',
      ],
      bodyZh: [
        '一颗卫星能告诉你一件事，一份普查数据告诉你另一件事。研究真正的工作，是把它们优雅、透明地融合在一起——尊重每一种数据能说与不能说的东西。',
        '近期的合作研究在珠江流域的碳排放栅格上使用了 SHAP 可解释模型，识别出森林是主导性的碳汇，建设用地是增长最快的排放源。在这里，可解释性不是奢侈品，而是让研究结果真正可用的前提。',
      ],
      visual: 'ml',
    },
    {
      id: 'rs',
      title: 'Remote Sensing & Urbanization',
      titleZh: '遥感与城市化',
      kicker: 'Theme 04',
      kickerZh: '主题 04',
      accent: 'oklch(0.55 0.13 145)',    // moss green
      accentSoft: 'oklch(0.92 0.04 145)',
      tagline:
        'Tracking land-use change at the pace cities actually grow.',
      taglineZh:
        '以城市真实生长的节奏，追踪土地利用的变化。',
      body: [
        'CA-Markov simulations on Nanchang. CSLE soil-loss modelling on the Dongjiang basin. PM2.5 spatial-temporal differentiation between urban and rural Ganzhou.',
        'Each project is a different question about how the surface of a region is being remade — by construction, by erosion, by air. Together they form the dataset I keep returning to when asking what "sustainable" actually means in numbers.',
      ],
      bodyZh: [
        '南昌的 CA-Markov 模拟；东江流域的 CSLE 土壤流失建模；赣州城乡 PM2.5 时空差异分析。',
        '每一个项目，都是关于一片区域的地表如何被重塑的不同问题——被建设、被侵蚀、被空气。它们共同构成了一个我反复回到的数据集：当我们要把"可持续"翻译成数字时，究竟在说什么。',
      ],
      visual: 'rs',
    },
  ];

  /* Helper: encode a value for safe placement inside a double-quoted attribute. */
  function attr(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
  function pick(en, zh) {
    const I = window.PW_I18N;
    return I && I.lang === 'zh' ? (zh != null ? zh : en) : en;
  }

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
      <span class="research-box-cue"
            data-i18n-en="Open&nbsp;→" data-i18n-zh="展开&nbsp;→"
            data-i18n-html>${pick('Open\u00A0→', '展开\u00A0→')}</span>
      <div class="research-box-meta">
        <span class="research-box-title"
              data-i18n-en="${attr(theme.title)}"
              data-i18n-zh="${attr(theme.titleZh)}">${pick(theme.title, theme.titleZh)}</span>
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
      <button class="research-modal-close" type="button"
              aria-label="Close"
              data-i18n-attr-en="aria-label:Close"
              data-i18n-attr-zh="aria-label:关闭">
        <span data-i18n-en="Close" data-i18n-zh="关闭">${pick('Close', '关闭')}</span>
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
          <line x1="2" y1="2" x2="12" y2="12" stroke="currentColor" stroke-width="1"/>
          <line x1="12" y1="2" x2="2" y2="12" stroke="currentColor" stroke-width="1"/>
        </svg>
      </button>
      <div class="pw-research-modal-inner" data-inner>
        <div style="max-width: 820px; margin: 0 auto; padding: 96px 0 64px;">
          <p class="eyebrow" style="margin-bottom: 18px;"
             data-i18n-en="${attr(theme.kicker)}"
             data-i18n-zh="${attr(theme.kickerZh)}">${pick(theme.kicker, theme.kickerZh)}</p>
          <h2 data-i18n-en="${attr(theme.title)}"
              data-i18n-zh="${attr(theme.titleZh)}">${pick(theme.title, theme.titleZh)}</h2>
          <div class="modal-rule" style="background:${theme.accent};"></div>
          <p style="font-weight: 500;"
             data-i18n-en="${attr(theme.tagline)}"
             data-i18n-zh="${attr(theme.taglineZh)}">${pick(theme.tagline, theme.taglineZh)}</p>
          ${theme.body.map((p, i) => `<p data-i18n-en="${attr(p)}" data-i18n-zh="${attr(theme.bodyZh[i])}">${pick(p, theme.bodyZh[i])}</p>`).join('')}
          <p style="margin-top: 40px;">
            <a href="./projects.html" style="color: ${theme.accent}; border-bottom: 0.5px solid ${theme.accent}; padding-bottom: 2px;"
               data-i18n-en="See related projects ↗"
               data-i18n-zh="查看相关项目 ↗">${pick('See related projects ↗', '查看相关项目 ↗')}</a>
          </p>
        </div>
      </div>
    `;
    modalRoot.appendChild(frame);

    // Newly inserted nodes need to pick up the current language too.
    document.dispatchEvent(new CustomEvent('pw-i18n-refresh'));

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
