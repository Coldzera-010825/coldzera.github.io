/* ================================================================
   bio-map.js — Full-bleed "story map" of the places I've lived
   - One Leaflet map fills the band (Carto Voyager + OSM fallback)
   - Numbered pins + bowed, dashed travel arcs between places
   - Each .journey2-station is a floating, semi-transparent card.
     The ACTIVE card is anchored beside its marker (screen-space),
     fades in gently, and stays glued to the marker while the user
     pans or zooms.
   - Travel by: clicking a pin, the timeline chips, the prev/next
     arrows, or the ← / → arrow keys. The map flies; the card fades.
   - A photo frame sits beside the text; click it (or its dots) to
     flip through that place's photos.

   Mount: #bio-map inside .journey2-map-wrap, with hidden
   .journey2-station cards inside #journey2-stations.
   Depends on: Leaflet (loaded globally).
   ================================================================ */
(function () {
  'use strict';

  if (typeof L === 'undefined') {
    console.warn('[bio-map] Leaflet not available — skipping');
    return;
  }

  const mapEl = document.getElementById('bio-map');
  const stationsWrap = document.getElementById('journey2-stations');
  if (!mapEl || !stationsWrap) return;

  // Positioning context the cards are absolutely placed against.
  const wrap = mapEl.parentElement; // .journey2-map-wrap
  const stationEls = Array.from(stationsWrap.querySelectorAll('.journey2-station'));
  if (!stationEls.length) return;

  // Timeline container is referenced from several helpers — grab it early.
  const timelineEl = document.getElementById('journey2-timeline');

  /* ---------------- Map ---------------- */
  const map = L.map(mapEl, {
    zoomControl: false,
    scrollWheelZoom: false,
    attributionControl: true,
    worldCopyJump: false,
    zoomSnap: 0.25,
  }).setView([34, 60], 3);
  L.control.zoom({ position: 'bottomright' }).addTo(map);

  // CartoDB Voyager — open, OSM-based, gentle palette that fits the
  // editorial paper aesthetic; falls back to plain OSM if unreachable.
  const primary = L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    {
      maxZoom: 12, minZoom: 2,
      subdomains: 'abcd',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    }
  );
  const fallback = L.tileLayer(
    'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      maxZoom: 12, minZoom: 2,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }
  );
  primary.on('tileerror', () => {
    if (!map.hasLayer(fallback)) {
      map.removeLayer(primary);
      fallback.addTo(map);
    }
  });
  primary.addTo(map);

  /* ---------------- Station model ---------------- */
  const stations = stationEls.map((el) => {
    const lat = parseFloat(el.dataset.lat);
    const lng = parseFloat(el.dataset.lng);
    const zoom = parseFloat(el.dataset.zoom) || 6;
    const frame = el.querySelector('.journey2-frame');
    const figures = frame ? Array.from(frame.querySelectorAll('figure')) : [];
    const dotsEl = el.querySelector('.journey2-frame-dots');
    const placeEl = el.querySelector('.journey2-place');
    // Flag broken / missing images so CSS can show a "photo soon" plate.
    figures.forEach((fig) => {
      const img = fig.querySelector('img');
      if (!img) return;
      img.addEventListener('error', () => fig.classList.add('is-missing'), { once: true });
      if (img.complete && img.naturalWidth === 0) fig.classList.add('is-missing');
    });
    return {
      el, lat, lng, zoom, frame, figures, dotsEl, placeEl,
      photoIdx: 0, latlng: L.latLng(lat, lng),
    };
  });

  /* ---------------- Travel arcs (bowed, dashed) ---------------- */
  function arcPoints(a, b, samples, lift) {
    const cLat = (a.lat + b.lat) / 2 + Math.hypot(b.lat - a.lat, b.lng - a.lng) * lift;
    const cLng = (a.lng + b.lng) / 2;
    const pts = [];
    for (let i = 0; i <= samples; i++) {
      const t = i / samples, u = 1 - t;
      pts.push([
        u * u * a.lat + 2 * u * t * cLat + t * t * b.lat,
        u * u * a.lng + 2 * u * t * cLng + t * t * b.lng,
      ]);
    }
    return pts;
  }
  for (let i = 0; i < stations.length - 1; i++) {
    L.polyline(arcPoints(stations[i].latlng, stations[i + 1].latlng, 64, 0.16), {
      color: '#1a1d2a', weight: 1, opacity: 0.32,
      dashArray: '3 6', lineCap: 'round', interactive: false,
    }).addTo(map);
  }

  /* ---------------- Numbered pins ---------------- */
  const markers = stations.map((st, i) => {
    const num = String(i + 1).padStart(2, '0');
    const icon = L.divIcon({
      className: 'journey-pin',
      html: '<span class="journey-pin-inner">' + num + '</span>',
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });
    const m = L.marker(st.latlng, { icon, riseOnHover: true }).addTo(map);
    m.on('click', () => goTo(i));
    return m;
  });

  /* ---------------- Photo frame (per station) ---------------- */
  function renderPhotos(st) {
    if (!st.figures.length) return;
    st.figures.forEach((fig, i) => fig.classList.toggle('is-active', i === st.photoIdx));
    if (!st.dotsEl) return;
    if (st.dotsEl.children.length !== st.figures.length) {
      st.dotsEl.innerHTML = '';
      st.figures.forEach((_, i) => {
        const d = document.createElement('button');
        d.type = 'button';
        d.className = 'journey2-frame-dot';
        d.setAttribute('aria-label', 'Photo ' + (i + 1));
        d.addEventListener('click', (e) => {
          e.stopPropagation();
          st.photoIdx = i;
          renderPhotos(st);
        });
        st.dotsEl.appendChild(d);
      });
    }
    Array.from(st.dotsEl.children).forEach((d, i) => {
      d.classList.toggle('is-active', i === st.photoIdx);
    });
  }
  // Clicking the frame advances to the next photo.
  stations.forEach((st) => {
    if (!st.frame) return;
    st.frame.addEventListener('click', () => {
      if (!st.figures.length) return;
      st.photoIdx = (st.photoIdx + 1) % st.figures.length;
      renderPhotos(st);
    });
  });

  /* ---------------- Card anchoring ---------------- */
  const PAD = 18, GAP = 28;
  function positionCard(st) {
    const W = wrap.clientWidth, H = wrap.clientHeight;
    const pt = map.latLngToContainerPoint(st.latlng);
    const cw = st.el.offsetWidth, ch = st.el.offsetHeight;
    // Anchor on whichever side of the marker has more room.
    let left = (pt.x <= W / 2) ? pt.x + GAP : pt.x - GAP - cw;
    let top = pt.y - ch / 2;
    left = Math.max(PAD, Math.min(left, W - cw - PAD));
    top = Math.max(PAD, Math.min(top, H - ch - PAD));
    st.el.style.left = left + 'px';
    st.el.style.top = top + 'px';
  }

  /* ---------------- Navigation ---------------- */
  let active = -1;
  let navToken = 0;

  function setActiveMarker(i) {
    markers.forEach((m, k) => {
      const el = m.getElement();
      if (el) el.classList.toggle('is-active', k === i);
    });
  }
  function setActiveChip(i) {
    if (!timelineEl) return;
    Array.from(timelineEl.children).forEach((c, k) => c.classList.toggle('is-active', k === i));
  }

  function goTo(i) {
    if (i < 0) i = stations.length - 1;
    if (i >= stations.length) i = 0;
    const st = stations[i];
    if (i === active && st.el.classList.contains('is-shown')) return;

    // Fade out whatever's showing; highlight the destination immediately.
    stations.forEach((s) => s.el.classList.remove('is-shown'));
    setActiveMarker(i);
    setActiveChip(i);
    st.photoIdx = 0;

    const token = ++navToken;
    map.flyTo(st.latlng, st.zoom, { duration: 1.1, easeLinearity: 0.25 });
    map.once('moveend', () => {
      if (token !== navToken) return; // superseded by a newer navigation
      active = i;
      renderPhotos(st);
      positionCard(st);
      // Apply the anchored position before fading in, so the card doesn't
      // visibly slide in from a stale location.
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (token === navToken) st.el.classList.add('is-shown');
      }));
    });
  }

  // Keep the active card glued to its marker during manual pan / zoom
  // (and during the fly animation the inactive cards are hidden anyway).
  map.on('move zoom', () => { if (active >= 0) positionCard(stations[active]); });
  map.on('resize', () => { if (active >= 0) positionCard(stations[active]); });

  /* ---------------- Timeline chips ---------------- */
  function chipName(st, i) {
    return st.placeEl ? st.placeEl.textContent.trim() : String(i + 1).padStart(2, '0');
  }
  if (timelineEl) {
    stations.forEach((st, i) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'journey2-chip';
      const num = document.createElement('span');
      num.className = 'journey2-chip-num';
      num.textContent = String(i + 1).padStart(2, '0');
      const name = document.createElement('span');
      name.className = 'journey2-chip-name';
      name.textContent = chipName(st, i);
      chip.appendChild(num);
      chip.appendChild(name);
      chip.addEventListener('click', () => goTo(i));
      timelineEl.appendChild(chip);
    });
  }

  /* ---------------- Arrows + keyboard ---------------- */
  const prevBtn = wrap.querySelector('.journey2-arrow.is-prev');
  const nextBtn = wrap.querySelector('.journey2-arrow.is-next');
  if (prevBtn) prevBtn.addEventListener('click', () => goTo(active - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(active + 1));

  let keyActive = false;
  new IntersectionObserver((entries) => {
    entries.forEach((e) => { keyActive = e.isIntersecting; });
  }, { threshold: 0.2 }).observe(wrap);
  document.addEventListener('keydown', (e) => {
    if (!keyActive || !opened) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(active + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(active - 1); }
  });

  /* ---------------- Language refresh ----------------
     i18n.js rewrites the hidden .journey2-place text on toggle; mirror
     that into the timeline chips and re-anchor the active card (the card
     can change width between languages). */
  function refreshI18n() {
    if (timelineEl) {
      stations.forEach((st, i) => {
        const chip = timelineEl.children[i];
        if (!chip) return;
        const nm = chip.querySelector('.journey2-chip-name');
        if (nm) nm.textContent = chipName(st, i);
      });
    }
    if (active >= 0) positionCard(stations[active]);
  }
  if (window.PW_I18N && typeof window.PW_I18N.onChange === 'function') {
    window.PW_I18N.onChange(refreshI18n);
  }
  document.addEventListener('pw-i18n-refresh', refreshI18n);

  /* ---------------- Entry gate + kickoff ----------------
     The section starts collapsed behind a "Begin" gate. Scrolling it
     into view animates the gate in; clicking Begin gently expands the
     band, reveals the map, and flies into the first chapter — a calm,
     deliberate way into the journey. */
  const section = document.getElementById('journey-section');
  if (section) section.classList.add('j2-locked');

  let opened = false;

  function prep() {
    map.invalidateSize();
    // Pre-frame every pin (hidden behind the gate) so tiles are warm.
    const bounds = L.latLngBounds(stations.map((s) => s.latlng));
    map.fitBounds(bounds, { padding: [80, 80], maxZoom: 4, animate: false });
  }
  setTimeout(prep, 300);

  function openJourney() {
    if (opened) return;
    opened = true;
    if (section) {
      section.classList.remove('j2-locked', 'j2-gate-ready');
      section.classList.add('j2-open');
    }
    // Keep Leaflet in step with the expanding band, then fly in.
    const t0 = performance.now();
    (function settle() {
      map.invalidateSize();
      if (performance.now() - t0 < 1000) requestAnimationFrame(settle);
    })();
    setTimeout(() => { map.invalidateSize(); goTo(0); }, 660);
  }

  // Collapse back to the gate when the visitor scrolls away, so the
  // journey always starts from its invitation. Resets the active card
  // and cancels any in-flight fly-to.
  function lockJourney() {
    opened = false;
    navToken++; // void any pending moveend reveal
    active = -1;
    stations.forEach((s) => s.el.classList.remove('is-shown'));
    setActiveMarker(-1);
    setActiveChip(-1);
    if (section) {
      section.classList.remove('j2-open', 'j2-gate-ready');
      section.classList.add('j2-locked');
    }
  }

  const startBtn = section ? section.querySelector('.journey2-gate-start') : null;
  if (startBtn) startBtn.addEventListener('click', openJourney);

  if (section) {
    // Reveal the gate when the section scrolls into view; re-collapse it
    // once it has fully left the viewport (in either direction). The two
    // thresholds keep the height change off-screen, so it never jolts the
    // scroll position.
    const gateIO = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.intersectionRatio >= 0.2) {
          if (!opened) section.classList.add('j2-gate-ready');
        } else if (!e.isIntersecting) {
          if (opened) lockJourney();
          else section.classList.remove('j2-gate-ready');
        }
      });
    }, { threshold: [0, 0.2] });
    gateIO.observe(section);
  } else {
    openJourney();
  }
})();
