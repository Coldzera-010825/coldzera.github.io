/* ================================================================
   footprints.js — Interactive journey map with side panel + timeline
   Replaces the bio-map: numbered pins, flight-arcs between pins,
   click a pin (or timeline button) → side panel updates and map
   flies to that location.

   Photos: each FOOTPRINTS entry has a `photos` array. Drop image
   paths in `./assets/fig/footprints/<id>/...` and add filenames
   here. Empty entries render as styled placeholders.
   ================================================================ */
(function () {
  'use strict';

  if (typeof L === 'undefined') {
    console.warn('[footprints] Leaflet not available — skipping');
    return;
  }

  /* ---- Journey data (chronological order) ---- */
  const FOOTPRINTS = [
    {
      n: 1,
      id: 'wenzhou',
      name: 'Wenzhou',
      nameZh: '温州',
      period: '~2001 – 2019',
      role: 'Hometown · Primary & Secondary School',
      lat: 27.99,
      lng: 120.70,
      description: [
        "Born and raised in Wenzhou, a coastal city in Zhejiang province known for its merchant tradition and dialect so distinct it served as a Second-World-War cipher. The eighteen years here cover everything before university — primary school, middle school, the long Gaokao climb at high school.",
        "I still return between life chapters; the city is my reset button. The mountains behind the house and the seafood by the river make it the most stubbornly home of all the homes on this map.",
      ],
      photos: [],   // user will fill: e.g. ['hometown-river.jpg', 'high-school.jpg', 'family.jpg']
    },
    {
      n: 2,
      id: 'ganzhou',
      name: 'Ganzhou',
      nameZh: '赣州',
      period: '09/2019 – 06/2023',
      role: 'B.Sc. Geographic Information Science · JXUST',
      lat: 25.83,
      lng: 114.94,
      description: [
        "Four years of undergraduate training at Jiangxi University of Science and Technology, in the old prefectural capital of Ganzhou — a former Hakka stronghold tucked into the southern Jiangxi hills. I graduated ranked top 5 in the department.",
        "This is where the technical foundation was laid: ArcGIS Pro, ENVI, the Python geostack, the first taste of remote-sensing and spatial statistics. Two field-based projects from this period — CA-Markov urbanisation prediction on Nanchang and the CSLE × GeoDetector soil-erosion analysis on the Dongjiang basin — went on to become my first publications.",
      ],
      photos: [],
    },
    {
      n: 3,
      id: 'bristol',
      name: 'Bristol',
      nameZh: '布里斯托',
      period: '09/2023 – 11/2024',
      role: 'M.Sc. Geographic Data Science · University of Bristol',
      lat: 51.45,
      lng: -2.58,
      description: [
        "A year of intensive postgraduate training in Geographic Data Science and Spatial Analytics at the University of Bristol. The first time living outside China — first time taking notes in a language that wasn't the one I dream in.",
        "Bristol is where the work shifted from GIS-as-a-tool to data-science-on-cities. The U-Safety thesis came out of this period: pairing multi-source urban data with ML-derived safety indices, then routing student commutes through Dijkstra and A* to minimise exposure. I also did short internships at UNIDO, CCP12 and WCCO, which framed the policy side of what data infrastructure is for.",
      ],
      photos: [],
    },
    {
      n: 4,
      id: 'beijing',
      name: 'Beijing',
      nameZh: '北京',
      period: '02/2025 – present',
      role: 'Technology & Business Manager · 51WORLD',
      lat: 39.90,
      lng: 116.40,
      description: [
        "Currently at 51WORLD Digital Twin Technology Co. in Beijing, working at the seam between research and product — translating geospatial-ML concepts into urban-scale digital-twin deployments.",
        "The work here connects every prior stop on this map: Bristol's spatial-data-science framing, Ganzhou's GIS-engineering muscle, and Wenzhou's instinct for what a city is supposed to feel like from inside it.",
      ],
      photos: [],
    },
    {
      n: 5,
      id: 'cardiff',
      name: 'Cardiff',
      nameZh: '卡迪夫',
      period: 'Upcoming',
      role: 'Ph.D. Earth Sciences · Cardiff University',
      lat: 51.48,
      lng: -3.18,
      description: [
        "The next chapter: a doctorate in Earth Sciences at Cardiff University, on the south coast of Wales. After years of treating the city as the unit of analysis, the scale widens to the planet itself — deep time, Earth systems, and the processes that shape climate and landscape.",
        "The plan is to carry the geospatial-data-science toolkit across the disciplinary border: remote sensing, spatial statistics and machine learning, now aimed at how the Earth, its climate and the people living on it change together.",
      ],
      photos: [],
    },
  ];

  /* ---- Map init ---- */
  const el = document.getElementById('footprints-map');
  if (!el) return;

  const map = L.map(el, {
    zoomControl: true,
    scrollWheelZoom: false,
    attributionControl: false,
    worldCopyJump: false,
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 10,
    minZoom: 2,
  }).addTo(map);

  // Initial view — Eurasia, so all 4 anchors and the arcs across the
  // continent are visible. Switch to a wider zoom on tiny screens.
  const isNarrow = window.innerWidth < 900;
  map.setView([42, 58], isNarrow ? 2 : 3);

  /* ---- Flight arcs (quadratic bezier in lat/lng space, bowed north) ---- */
  function arcPoints(p0, p1, lift = 0.32, samples = 64) {
    const dLat = p1[0] - p0[0];
    const dLng = p1[1] - p0[1];
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    const cpLat = (p0[0] + p1[0]) / 2 + dist * lift;
    const cpLng = (p0[1] + p1[1]) / 2;
    const pts = [];
    for (let i = 0; i <= samples; i++) {
      const t = i / samples;
      const u = 1 - t;
      const lat = u * u * p0[0] + 2 * u * t * cpLat + t * t * p1[0];
      const lng = u * u * p0[1] + 2 * u * t * cpLng + t * t * p1[1];
      pts.push([lat, lng]);
    }
    return pts;
  }

  for (let i = 0; i < FOOTPRINTS.length - 1; i++) {
    const a = FOOTPRINTS[i];
    const b = FOOTPRINTS[i + 1];
    const pts = arcPoints([a.lat, a.lng], [b.lat, b.lng]);
    L.polyline(pts, {
      color: '#1a1d2a',
      weight: 1,
      opacity: 0.55,
      dashArray: '4 4',
      lineCap: 'round',
      lineJoin: 'round',
      interactive: false,
    }).addTo(map);
  }

  /* ---- Numbered pins ---- */
  const pinMarkers = {};
  FOOTPRINTS.forEach((fp) => {
    const icon = L.divIcon({
      className: 'fp-pin',
      html: `<div class="fp-pin-inner">${fp.n}</div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });
    const m = L.marker([fp.lat, fp.lng], { icon }).addTo(map);
    m.on('click', () => selectPin(fp.id, { flyTo: true }));
    pinMarkers[fp.id] = m;
  });

  /* ---- Side panel + timeline rendering ---- */
  const panel    = document.getElementById('footprints-panel');
  const timeline = document.getElementById('footprints-timeline');

  // Build timeline buttons
  FOOTPRINTS.forEach((fp) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'footprints-tl-btn';
    btn.dataset.fpId = fp.id;
    btn.innerHTML = `
      <span class="footprints-tl-num">0${fp.n}</span>
      <span class="footprints-tl-name">${fp.name}</span>
      <span class="footprints-tl-period">${fp.period}</span>
    `;
    btn.addEventListener('click', () => selectPin(fp.id, { flyTo: true }));
    timeline.appendChild(btn);
  });

  function renderPanel(fp) {
    const photos = (fp.photos.length > 0)
      ? fp.photos.map((src) => `
          <div class="footprints-photo has-image">
            <img src="./assets/fig/footprints/${fp.id}/${src}" alt="${fp.name}" />
          </div>`).join('')
      : Array.from({ length: 3 }).map(() => `
          <div class="footprints-photo">
            <span class="footprints-photo-placeholder">Photo<br/>coming<br/>soon</span>
          </div>`).join('');

    panel.innerHTML = `
      <div class="footprints-panel-number">0${fp.n}</div>
      <div class="footprints-panel-eyebrow">Stop · 0${fp.n} of 0${FOOTPRINTS.length}</div>
      <h3 class="footprints-panel-name">${fp.name}<span class="name-zh">${fp.nameZh}</span></h3>
      <div class="footprints-panel-role">${fp.role} · ${fp.period}</div>
      <div class="footprints-panel-rule"></div>
      <div class="footprints-panel-desc">
        ${fp.description.map((p) => `<p>${p}</p>`).join('')}
      </div>
      <div class="footprints-photo-grid">${photos}</div>
    `;
  }

  function selectPin(id, opts = {}) {
    const fp = FOOTPRINTS.find((f) => f.id === id);
    if (!fp) return;

    // Marker active state
    Object.entries(pinMarkers).forEach(([k, m]) => {
      const elm = m.getElement();
      if (elm) elm.classList.toggle('is-active', k === id);
    });

    // Timeline active state
    timeline.querySelectorAll('.footprints-tl-btn').forEach((b) => {
      b.classList.toggle('is-active', b.dataset.fpId === id);
    });

    renderPanel(fp);

    if (opts.flyTo) {
      const targetZoom = window.innerWidth < 900 ? 4 : 5;
      map.flyTo([fp.lat, fp.lng], targetZoom, { duration: 1.2 });
    }
  }

  // Initial selection
  selectPin(FOOTPRINTS[0].id);

  // Keep map sized after image loads / orientation changes
  window.addEventListener('resize', () => map.invalidateSize());
})();
