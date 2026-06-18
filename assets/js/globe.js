/* ================================================================
   globe.js — editorial Earth with real surface, labels & migrations
   - Textured sphere (NASA-style day map via CDN, beige fallback)
   - Lat/Lng wireframe overlay preserved
   - Life-point pins + HTML labels projected each frame
   - Great-circle arcs between consecutive points with a travelling
     pulse, evoking migration trails.

   Mount: <div id="globe-mount"></div>
   Depends on: Three.js (loaded globally via CDN)
   ================================================================ */
(function () {
  'use strict';

  if (typeof THREE === 'undefined') {
    console.warn('[globe] THREE not available — skipping');
    return;
  }

  // Ordered chronologically so the arcs read as a life path.
  // labelDX / labelDY: optional screen-space pixel nudge for the HTML label,
  // used to pull apart tightly-clustered pins (Bristol & Cardiff sit almost
  // on top of each other) so their cards don't overlap.
  const MARKERS = [
    { name: 'Ganzhou', name_zh: '赣州',     meta: 'B.Sc. · JXUST',         lat: 25.83, lng: 114.94 },
    { name: 'Wenzhou', name_zh: '温州',     meta: 'Hometown · Zhejiang',   lat: 27.99, lng: 120.70 },
    { name: 'Bristol', name_zh: '布里斯托', meta: 'M.Sc. · Univ. Bristol', lat: 51.45, lng:  -2.58, labelDX: -72, labelDY: -14 },
    { name: 'Beijing', name_zh: '北京',     meta: '51WORLD · 2025',        lat: 39.90, lng: 116.40 },
    { name: 'Cardiff', name_zh: '卡迪夫',   meta: 'Ph.D. · Cardiff Univ.', lat: 51.48, lng:  -3.18, labelDX:  72, labelDY:  22 },
  ];

  // Reliable Earth day map (Three.js examples, mirrored on jsDelivr)
  const EARTH_TEXTURES = [
    'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r158/examples/textures/planets/earth_atmos_2048.jpg',
    'https://unpkg.com/three@0.158.0/examples/textures/planets/earth_atmos_2048.jpg',
  ];

  function latLngToVec3(lat, lng, r) {
    const phi   = (90 - lat) * Math.PI / 180;
    const theta = (lng + 180) * Math.PI / 180;  // align so 0° meridian sits at +X face
    return new THREE.Vector3(
      -r * Math.sin(phi) * Math.cos(theta),
       r * Math.cos(phi),
       r * Math.sin(phi) * Math.sin(theta)
    );
  }

  function init() {
    const el = document.getElementById('globe-mount');
    if (!el) return;

    // Make sure the host is a positioning context for absolute labels
    const cs = getComputedStyle(el);
    if (cs.position === 'static') el.style.position = 'relative';

    const size = () => Math.max(el.clientWidth, 1);

    const renderer = new THREE.WebGLRenderer({
      antialias: true, alpha: true, powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    renderer.setSize(size(), size(), false);
    renderer.setClearColor(0x000000, 0);
    if ('outputColorSpace' in renderer) renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.cssText = 'width:100%;height:100%;display:block;cursor:grab;touch-action:none;';
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.z = 3.0;

    /* ---- Earth sphere ---- */
    const earthMat = new THREE.MeshStandardMaterial({
      color:     new THREE.Color(0xe8e4d8), // beige fallback while texture loads / if it fails
      roughness: 0.82,
      metalness: 0.04,
    });
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 96), earthMat);
    scene.add(sphere);

    // Async texture load with mirror fallback
    (function loadEarthTexture(i) {
      if (i >= EARTH_TEXTURES.length) return;
      const loader = new THREE.TextureLoader();
      loader.setCrossOrigin('anonymous');
      loader.load(
        EARTH_TEXTURES[i],
        (tex) => {
          if ('colorSpace' in tex) tex.colorSpace = THREE.SRGBColorSpace;
          try { tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); } catch (_) {}
          earthMat.map = tex;
          earthMat.color.setHex(0xffffff);     // let the map drive colour
          earthMat.needsUpdate = true;
        },
        undefined,
        () => loadEarthTexture(i + 1)
      );
    })(0);

    /* ---- Wireframe overlay (subtle, sits just above the surface) ---- */
    const wireMat = new THREE.LineBasicMaterial({
      color:        new THREE.Color(0xf6f1e3),
      transparent:  true,
      opacity:      0.13,
    });
    const wirePts = [];
    const R = 1.003;
    for (let lat = -75; lat <= 75; lat += 15) {
      const phi  = (90 - lat) * Math.PI / 180;
      const segs = 96;
      for (let i = 0; i < segs; i++) {
        const t0 = (i / segs) * Math.PI * 2;
        const t1 = ((i + 1) / segs) * Math.PI * 2;
        wirePts.push(new THREE.Vector3(R * Math.sin(phi) * Math.cos(t0), R * Math.cos(phi), R * Math.sin(phi) * Math.sin(t0)));
        wirePts.push(new THREE.Vector3(R * Math.sin(phi) * Math.cos(t1), R * Math.cos(phi), R * Math.sin(phi) * Math.sin(t1)));
      }
    }
    for (let lng = 0; lng < 360; lng += 15) {
      const theta = lng * Math.PI / 180;
      const segs = 72;
      for (let i = 0; i < segs; i++) {
        const p0 = (i     / segs) * Math.PI;
        const p1 = ((i+1) / segs) * Math.PI;
        wirePts.push(new THREE.Vector3(R * Math.sin(p0) * Math.cos(theta), R * Math.cos(p0), R * Math.sin(p0) * Math.sin(theta)));
        wirePts.push(new THREE.Vector3(R * Math.sin(p1) * Math.cos(theta), R * Math.cos(p1), R * Math.sin(p1) * Math.sin(theta)));
      }
    }
    const wire = new THREE.LineSegments(
      new THREE.BufferGeometry().setFromPoints(wirePts),
      wireMat
    );
    sphere.add(wire);

    /* ---- Equator ---- */
    const eqPts = [];
    const eqSegs = 192;
    for (let i = 0; i < eqSegs; i++) {
      const t0 = (i     / eqSegs) * Math.PI * 2;
      const t1 = ((i+1) / eqSegs) * Math.PI * 2;
      eqPts.push(new THREE.Vector3(1.004 * Math.cos(t0), 0, 1.004 * Math.sin(t0)));
      eqPts.push(new THREE.Vector3(1.004 * Math.cos(t1), 0, 1.004 * Math.sin(t1)));
    }
    const equator = new THREE.LineSegments(
      new THREE.BufferGeometry().setFromPoints(eqPts),
      new THREE.LineBasicMaterial({ color: 0xf6f1e3, transparent: true, opacity: 0.28 })
    );
    sphere.add(equator);

    /* ---- Markers ---- */
    const accent = new THREE.Color(0x4c6fff);
    const markerNodes = []; // { marker, pinPos, labelEl, pulse }

    // Label layer (HTML overlay so typography matches the page)
    const labelLayer = document.createElement('div');
    labelLayer.className = 'pw-globe-labels';
    labelLayer.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:6;';
    el.appendChild(labelLayer);

    const isZH = () => (document.documentElement.getAttribute('data-lang') === 'zh');

    MARKERS.forEach((m) => {
      const v = latLngToVec3(m.lat, m.lng, 1.018);

      const pin = new THREE.Mesh(
        new THREE.SphereGeometry(0.019, 20, 20),
        new THREE.MeshBasicMaterial({ color: accent })
      );
      pin.position.copy(v);
      sphere.add(pin);

      const halo = new THREE.Mesh(
        new THREE.RingGeometry(0.024, 0.038, 40),
        new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.34, side: THREE.DoubleSide })
      );
      halo.position.copy(v);
      halo.lookAt(0, 0, 0);
      sphere.add(halo);

      // Animated breathing pulse
      const pulse = new THREE.Mesh(
        new THREE.RingGeometry(0.024, 0.030, 40),
        new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.6, side: THREE.DoubleSide })
      );
      pulse.position.copy(v);
      pulse.lookAt(0, 0, 0);
      sphere.add(pulse);

      // HTML label
      const label = document.createElement('div');
      label.className = 'pw-globe-label';
      label.style.cssText = [
        'position:absolute',
        'transform:translate(-50%,-100%)',
        'padding:3px 9px 4px',
        'border:0.5px solid oklch(0.13 0.01 275 / 0.55)',
        'background:oklch(0.985 0.005 80 / 0.82)',
        'backdrop-filter:blur(2px)',
        '-webkit-backdrop-filter:blur(2px)',
        'border-radius:1px',
        'font: 500 10px/1.25 "Space Grotesk", system-ui, sans-serif',
        'color:oklch(0.13 0.01 275)',
        'white-space:nowrap',
        'pointer-events:none',
        'opacity:0',
        'transition:opacity 220ms ease',
        'box-shadow:0 1px 2px oklch(0.13 0.01 275 / 0.06)',
        'text-align:center',
      ].join(';');

      const nameEl = document.createElement('span');
      nameEl.className = 'pw-globe-label-name';
      nameEl.dataset.en = m.name;
      nameEl.dataset.zh = m.name_zh;
      nameEl.textContent = m.name;
      nameEl.style.cssText = 'display:block;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;';

      const metaEl = document.createElement('span');
      metaEl.className = 'pw-globe-label-meta';
      metaEl.textContent = m.meta;
      metaEl.style.cssText = 'display:block;font-size:8.5px;letter-spacing:0.10em;color:oklch(0.45 0.008 275);font-style:italic;margin-top:1px;';

      const stem = document.createElement('span');
      stem.style.cssText = 'display:block;width:1px;height:12px;background:oklch(0.13 0.01 275 / 0.55);margin:3px auto -14px;';

      label.appendChild(nameEl);
      label.appendChild(metaEl);
      label.appendChild(stem);
      labelLayer.appendChild(label);

      markerNodes.push({ marker: m, pinPos: v.clone(), labelEl: label, pulse });
    });

    function applyLabelLang() {
      const zh = isZH();
      markerNodes.forEach(({ labelEl }) => {
        const n = labelEl.querySelector('.pw-globe-label-name');
        if (!n) return;
        n.textContent = zh ? (n.dataset.zh || n.dataset.en) : (n.dataset.en || n.textContent);
      });
    }
    applyLabelLang();
    document.addEventListener('pw-i18n-refresh', applyLabelLang);

    /* ---- Migration arcs between consecutive markers ---- */
    const arcs = [];
    for (let i = 0; i < MARKERS.length - 1; i++) {
      const a = latLngToVec3(MARKERS[i].lat,   MARKERS[i].lng,   1.0);
      const b = latLngToVec3(MARKERS[i+1].lat, MARKERS[i+1].lng, 1.0);
      const mid = a.clone().add(b).multiplyScalar(0.5);
      const chord = a.distanceTo(b);
      const lift = 1.0 + 0.18 + 0.32 * (chord / 2);
      mid.normalize().multiplyScalar(lift);
      const curve = new THREE.QuadraticBezierCurve3(
        a.clone().multiplyScalar(1.005),
        mid,
        b.clone().multiplyScalar(1.005)
      );

      const arcLine = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(curve.getPoints(96)),
        new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 0.55 })
      );
      sphere.add(arcLine);

      const pulse = new THREE.Mesh(
        new THREE.SphereGeometry(0.014, 14, 14),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 })
      );
      sphere.add(pulse);

      arcs.push({ curve, pulse, offset: i / Math.max(1, MARKERS.length - 1) });
    }

    /* ---- Lighting ---- */
    scene.add(new THREE.AmbientLight(0xeef0ff, 0.62));
    const sun = new THREE.DirectionalLight(0xfff4dc, 1.45);
    sun.position.set(-3, 2.6, 2.4);
    scene.add(sun);
    const rim = new THREE.DirectionalLight(0xbfd4ff, 0.42);
    rim.position.set(2.5, 1.2, -2);
    scene.add(rim);

    /* ---- Initial pose: East-Asia forward ---- */
    sphere.rotation.x = 0.22;
    sphere.rotation.y = -Math.PI * 1.2;

    /* ---- Project markers to screen for HTML labels ---- */
    const tmp = new THREE.Vector3();
    function projectMarkers() {
      const w = el.clientWidth;
      const h = el.clientHeight;
      const camPos = camera.position.clone().normalize();
      markerNodes.forEach(({ pinPos, labelEl, marker }) => {
        tmp.copy(pinPos).applyMatrix4(sphere.matrixWorld);
        const worldDir = tmp.clone().normalize();
        const dot = worldDir.dot(camPos); // >0 = facing camera
        tmp.project(camera);
        const x = (tmp.x * 0.5 + 0.5) * w;
        const y = (-tmp.y * 0.5 + 0.5) * h;
        // Per-marker pixel nudge keeps tightly-clustered labels apart.
        const ldx = (marker && marker.labelDX) || 0;
        const ldy = (marker && marker.labelDY) || 0;
        labelEl.style.left = (x + ldx) + 'px';
        labelEl.style.top  = (y - 6 + ldy) + 'px';
        const vis = Math.max(0, Math.min(1, (dot - 0.18) / 0.32));
        labelEl.style.opacity = vis.toFixed(3);
      });
    }

    /* ---- Animation ---- */
    const RAD_PER_SEC = 0.05;
    let lastT = performance.now();
    let animId = 0;
    const dragging = { active: false, lastX: 0, lastY: 0 };

    function animate(now) {
      animId = requestAnimationFrame(animate);
      const dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;
      if (!dragging.active) sphere.rotation.y += RAD_PER_SEC * dt;

      const t = now / 1000;
      // Marker breathing pulse
      markerNodes.forEach(({ pulse }, i) => {
        const k = (Math.sin(t * 1.8 + i * 0.9) + 1) * 0.5; // 0..1
        const s = 1 + k * 0.9;
        pulse.scale.set(s, s, s);
        pulse.material.opacity = 0.55 * (1 - k);
      });

      // Travelling arc pulses
      const period = 4.2;
      arcs.forEach((a) => {
        const u = ((t / period) + a.offset) % 1;
        a.curve.getPoint(u, tmp);
        a.pulse.position.copy(tmp);
        const fade = Math.sin(u * Math.PI);
        a.pulse.material.opacity = 0.3 + 0.7 * fade;
      });

      renderer.render(scene, camera);
      projectMarkers();
    }
    animId = requestAnimationFrame(animate);

    /* ---- Resize ---- */
    function onResize() {
      const s = size();
      renderer.setSize(s, s, false);
    }
    window.addEventListener('resize', onResize);

    /* ---- Pointer drag ---- */
    const dom = renderer.domElement;
    dom.addEventListener('pointerdown', (e) => {
      dragging.active = true;
      dragging.lastX = e.clientX;
      dragging.lastY = e.clientY;
      dom.style.cursor = 'grabbing';
      try { dom.setPointerCapture(e.pointerId); } catch (_) {}
    });
    dom.addEventListener('pointermove', (e) => {
      if (!dragging.active) return;
      const dx = e.clientX - dragging.lastX;
      const dy = e.clientY - dragging.lastY;
      dragging.lastX = e.clientX;
      dragging.lastY = e.clientY;
      sphere.rotation.y += dx * 0.005;
      sphere.rotation.x = Math.max(-0.9, Math.min(0.9, sphere.rotation.x + dy * 0.005));
    });
    function endDrag(e) {
      dragging.active = false;
      dom.style.cursor = 'grab';
      try { dom.releasePointerCapture(e.pointerId); } catch (_) {}
    }
    dom.addEventListener('pointerup', endDrag);
    dom.addEventListener('pointercancel', endDrag);
    dom.addEventListener('pointerleave', endDrag);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
