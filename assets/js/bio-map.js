/* ================================================================
   bio-map.js — Apple-Photos-style "Where I've been"
   - OSM standard tiles (Carto Voyager) — readable open-source basemap
   - Markers per chapter (Wenzhou / Ganzhou / Bristol / Beijing)
   - Scroll-syncs: as a .journey-chapter scrolls into view, the map
     flies to its lat/lng/zoom and highlights its marker.
   - Click a marker → smooth-scroll to the matching chapter.
   ================================================================ */
(function () {
  'use strict';

  if (typeof L === 'undefined') {
    console.warn('[bio-map] Leaflet not available — skipping');
    return;
  }
  const mapEl = document.getElementById('bio-map');
  const chapters = Array.from(document.querySelectorAll('.journey-chapter'));
  if (!mapEl || chapters.length === 0) return;

  const map = L.map(mapEl, {
    zoomControl: true,
    scrollWheelZoom: false,
    attributionControl: true,
    worldCopyJump: true,
  }).setView([35, 60], 3);

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

  // Markers
  const markers = chapters.map((ch, i) => {
    const lat = parseFloat(ch.dataset.lat);
    const lng = parseFloat(ch.dataset.lng);
    const num = String(i + 1).padStart(2, '0');
    const icon = L.divIcon({
      className: 'journey-pin',
      html: `<span class="journey-pin-inner">${num}</span>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
    const marker = L.marker([lat, lng], { icon, riseOnHover: true }).addTo(map);
    marker.on('click', () => {
      // Lock the active chapter to this one for the duration of the smooth
      // scroll, otherwise the IntersectionObserver below will see the next
      // (shorter) chapter pass through its band and steal focus.
      ioLockUntil = performance.now() + 1400;
      activate(i);
      ch.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    return marker;
  });

  // Initial framing: include every pin
  const bounds = L.latLngBounds(markers.map((m) => m.getLatLng()));
  map.fitBounds(bounds, { padding: [40, 40], maxZoom: 4 });

  /* ----------------------------------------------------------------
     Photo gallery floating on the map
     ---------------------------------------------------------------- */
  const galleryEl   = document.getElementById('journey-gallery');
  const trackEl     = document.getElementById('journey-gallery-track');
  const dotsEl      = document.getElementById('journey-gallery-dots');
  const placeEl     = document.getElementById('journey-gallery-place');
  const countEl     = document.getElementById('journey-gallery-count');
  const prevBtn     = galleryEl ? galleryEl.querySelector('.is-prev') : null;
  const nextBtn     = galleryEl ? galleryEl.querySelector('.is-next') : null;

  // Move each chapter's photos into per-chapter slide groups inside the track.
  // Authors can drop any number of <figure> elements into .journey-photos.
  const slideGroups = chapters.map((ch, i) => {
    const photosBlock = ch.querySelector('.journey-photos');
    const figures = photosBlock ? Array.from(photosBlock.querySelectorAll('figure')) : [];
    if (photosBlock) photosBlock.remove(); // gallery is the new home

    const group = document.createElement('div');
    group.className = 'journey-gallery-group';
    group.dataset.idx = String(i);
    figures.forEach((fig) => {
      const slide = document.createElement('div');
      slide.className = 'journey-gallery-slide';
      slide.appendChild(fig);
      // Hide broken images (missing files) so the paper texture shows.
      const img = fig.querySelector('img');
      if (img) img.addEventListener('error', () => { slide.classList.add('is-missing'); }, { once: true });
      group.appendChild(slide);
    });
    if (trackEl) trackEl.appendChild(group);
    return group;
  });
  // Mark the section so CSS can hide the now-empty inline photo blocks.
  const journeySection = document.getElementById('journey-section');
  if (journeySection) journeySection.classList.add('has-gallery');

  let slideIdx = 0;
  let chapterIdx = 0;
  function renderGallery() {
    if (!galleryEl) return;
    const group = slideGroups[chapterIdx];
    const count = group ? group.children.length : 0;
    if (!count) { galleryEl.classList.add('is-empty'); return; }
    galleryEl.classList.remove('is-empty');

    // Show only the current chapter's group, slide it horizontally.
    slideGroups.forEach((g, i) => { g.style.display = (i === chapterIdx) ? '' : 'none'; });
    group.style.transform = `translateX(${-slideIdx * 100}%)`;
    Array.from(group.children).forEach((slide, i) => {
      slide.classList.toggle('is-active', i === slideIdx);
    });

    // Dots
    if (dotsEl) {
      if (dotsEl.children.length !== count) {
        dotsEl.innerHTML = '';
        for (let i = 0; i < count; i++) {
          const dot = document.createElement('button');
          dot.type = 'button';
          dot.className = 'journey-gallery-dot';
          dot.setAttribute('aria-label', `Photo ${i + 1}`);
          dot.addEventListener('click', () => { slideIdx = i; renderGallery(); });
          dotsEl.appendChild(dot);
        }
      }
      Array.from(dotsEl.children).forEach((d, i) => {
        d.classList.toggle('is-active', i === slideIdx);
      });
    }

    // Meta line
    if (placeEl) {
      const placeNode = chapters[chapterIdx].querySelector('.journey-place');
      placeEl.textContent = placeNode ? placeNode.textContent.trim() : '';
    }
    if (countEl) countEl.textContent = `${slideIdx + 1} / ${count}`;
  }
  function nextSlide() {
    const group = slideGroups[chapterIdx];
    if (!group || !group.children.length) return;
    slideIdx = (slideIdx + 1) % group.children.length;
    renderGallery();
  }
  function prevSlide() {
    const group = slideGroups[chapterIdx];
    if (!group || !group.children.length) return;
    slideIdx = (slideIdx - 1 + group.children.length) % group.children.length;
    renderGallery();
  }
  if (prevBtn) prevBtn.addEventListener('click', prevSlide);
  if (nextBtn) nextBtn.addEventListener('click', nextSlide);

  // Keyboard arrows (only when journey section is in view)
  let keyActive = false;
  document.addEventListener('keydown', (e) => {
    if (!keyActive) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); nextSlide(); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); prevSlide(); }
  });

  // Touch swipe
  if (trackEl) {
    let sx = 0, dx = 0, swiping = false;
    trackEl.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; swiping = true; }, { passive: true });
    trackEl.addEventListener('touchmove',  (e) => { if (swiping) dx = e.touches[0].clientX - sx; }, { passive: true });
    trackEl.addEventListener('touchend',   () => {
      if (!swiping) return;
      if (dx <  -40) nextSlide();
      if (dx >   40) prevSlide();
      swiping = false; dx = 0;
    });
  }

  // Scroll-sync via IntersectionObserver
  let activeIdx = -1;
  function activate(idx) {
    if (idx === activeIdx) return;
    activeIdx = idx;
    chapterIdx = idx;
    slideIdx = 0;
    chapters.forEach((c, i) => c.classList.toggle('is-active', i === idx));
    markers.forEach((m, i) => {
      const el = m.getElement();
      if (el) el.classList.toggle('is-active', i === idx);
    });
    renderGallery();
    const ch = chapters[idx];
    if (!ch) return;
    const lat = parseFloat(ch.dataset.lat);
    const lng = parseFloat(ch.dataset.lng);
    const zoom = parseFloat(ch.dataset.zoom) || 5;
    map.flyTo([lat, lng], zoom, { duration: 1.2, easeLinearity: 0.25 });
  }

  let ioLockUntil = 0;
  const io = new IntersectionObserver(
    (entries) => {
      if (performance.now() < ioLockUntil) return; // honor marker-click lock
      // Pick the entry closest to the top of the viewport
      const visible = entries.filter((e) => e.isIntersecting);
      if (!visible.length) return;
      visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      const idx = chapters.indexOf(visible[0].target);
      if (idx !== -1) activate(idx);
    },
    { rootMargin: '-30% 0px -55% 0px', threshold: 0 }
  );
  chapters.forEach((c) => io.observe(c));

  // Activate the first chapter once layout settles
  setTimeout(() => activate(0), 250);

  /* ----------------------------------------------------------------
     Immersive full-bleed mode for the whole journey section.
     - When the section top approaches the viewport, we play a brief
       intro (huge centred title → dock to top), then snap to a
       full-screen 50/50 layout (map right, stories left).
     - Leaving the section reverses everything.
     ---------------------------------------------------------------- */
  const section = document.getElementById('journey-section');
  if (!section || window.matchMedia('(max-width: 900px)').matches) return;

  let phase = 'idle'; // 'idle' | 'opening' | 'docked' | 'immersive'
  let pendingTimer = 0;

  function setPhase(next) {
    if (next === phase) return;
    phase = next;
    section.classList.toggle('intro-opening', next === 'opening');
    section.classList.toggle('intro-docked',  next === 'docked' || next === 'immersive');
    section.classList.toggle('is-immersive',  next === 'immersive');
    // Let layout/transition settle, then tell Leaflet to recalculate.
    clearTimeout(pendingTimer);
    pendingTimer = setTimeout(() => {
      try {
        map.invalidateSize({ animate: false });
        // Re-frame the current chapter so the marker stays nicely positioned
        if (activeIdx >= 0) {
          const ch = chapters[activeIdx];
          const lat = parseFloat(ch.dataset.lat);
          const lng = parseFloat(ch.dataset.lng);
          const zoom = parseFloat(ch.dataset.zoom) || 5;
          map.flyTo([lat, lng], zoom, { duration: 0.8 });
        }
      } catch (_) {}
    }, 760);
  }

  // Trigger the open as soon as the section top enters the lower 80% of viewport
  const enterIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) keyActive = true;
        if (e.isIntersecting && phase === 'idle') {
          // Stage 1: dramatic big title (centred)
          setPhase('opening');
          // Stage 2: dock the title back to normal position
          setTimeout(() => setPhase('docked'), 520);
          // Stage 3: expand to full-bleed immersive layout
          setTimeout(() => setPhase('immersive'), 1060);
        }
      });
    },
    { rootMargin: '0px 0px -20% 0px', threshold: 0 }
  );
  enterIO.observe(section);

  // Reverse when the whole section is well above the viewport
  const exitIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) keyActive = false;
        if (!e.isIntersecting && phase !== 'idle') {
          // User scrolled past – relax back to non-immersive but keep title docked
          if (e.boundingClientRect.top < 0 && phase === 'immersive') {
            setPhase('docked');
          }
          // User scrolled fully back up above the section – reset to idle
          if (e.boundingClientRect.top > 0) {
            setPhase('idle');
          }
        }
      });
    },
    { rootMargin: '-10% 0px -10% 0px', threshold: 0 }
  );
  exitIO.observe(section);
})();
