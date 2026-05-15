/* ================================================================
   globe.js — minimalist editorial Earth
   Procedural sphere + wireframe lat/lng overlay + life-point markers.
   No external textures: stays robust offline and matches the
   editorial paper-and-ink aesthetic of the rest of the site.

   Mount: <div id="globe-mount"></div>
   Depends on: Three.js (loaded globally via CDN)
   ================================================================ */
(function () {
  'use strict';

  if (typeof THREE === 'undefined') {
    console.warn('[globe] THREE not available — skipping');
    return;
  }

  const MARKERS = [
    { name: 'Ganzhou',   meta: 'B.Sc. · JXUST',         lat: 25.83, lng: 114.94 },
    { name: 'Wenzhou',   meta: 'Hometown · Zhejiang',   lat: 27.99, lng: 120.70 },
    { name: 'Bristol',   meta: 'M.Sc. · Univ. Bristol', lat: 51.45, lng:  -2.58 },
    { name: 'Beijing',   meta: '51WORLD · Present',     lat: 39.90, lng: 116.40 },
  ];

  function init() {
    const el = document.getElementById('globe-mount');
    if (!el) return;

    const size = () => Math.max(el.clientWidth, 1);

    const renderer = new THREE.WebGLRenderer({
      antialias: true, alpha: true, powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    renderer.setSize(size(), size(), false);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.cssText = 'width:100%;height:100%;display:block;cursor:grab;touch-action:none;';
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.z = 3.0;

    /* ---- Earth sphere: warm muted base ---- */
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(1, 96, 96),
      new THREE.MeshStandardMaterial({
        color:     new THREE.Color(0xe8e4d8),
        roughness: 0.86,
        metalness: 0.02,
      })
    );
    scene.add(sphere);

    /* ---- Wireframe overlay: 13 latitude rings + 24 longitude meridians ---- */
    const wireMat = new THREE.LineBasicMaterial({
      color:        new THREE.Color(0x2c2d3a),
      transparent:  true,
      opacity:      0.18,
    });
    const wirePts = [];
    const R = 1.001;

    // latitude rings (every 15° from -75 to +75)
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
    // longitude meridians (every 15°)
    for (let lng = 0; lng < 360; lng += 15) {
      const theta = lng * Math.PI / 180;
      const segs = 72;
      for (let i = 0; i < segs; i++) {
        const p0 = (i     / segs) * Math.PI;
        const p1 = ((i+1) / segs) * Math.PI;
        wirePts.push(new THREE.Vector3(Math.sin(p0) * Math.cos(theta), Math.cos(p0), Math.sin(p0) * Math.sin(theta)));
        wirePts.push(new THREE.Vector3(Math.sin(p1) * Math.cos(theta), Math.cos(p1), Math.sin(p1) * Math.sin(theta)));
      }
    }
    const wireGeo = new THREE.BufferGeometry().setFromPoints(wirePts);
    const wire = new THREE.LineSegments(wireGeo, wireMat);
    sphere.add(wire);

    /* ---- Equator: slightly stronger line ---- */
    const eqPts = [];
    const eqSegs = 192;
    for (let i = 0; i < eqSegs; i++) {
      const t0 = (i     / eqSegs) * Math.PI * 2;
      const t1 = ((i+1) / eqSegs) * Math.PI * 2;
      eqPts.push(new THREE.Vector3(1.002 * Math.cos(t0), 0, 1.002 * Math.sin(t0)));
      eqPts.push(new THREE.Vector3(1.002 * Math.cos(t1), 0, 1.002 * Math.sin(t1)));
    }
    const eqMat = new THREE.LineBasicMaterial({
      color: new THREE.Color(0x2c2d3a), transparent: true, opacity: 0.38,
    });
    const equator = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(eqPts), eqMat);
    sphere.add(equator);

    /* ---- Markers (life points) ---- */
    function latLngToVec3(lat, lng, r) {
      const phi   = (90 - lat) * Math.PI / 180;
      const theta = (lng + 180) * Math.PI / 180;  // flip so 0° is at +X
      return new THREE.Vector3(
        -r * Math.sin(phi) * Math.cos(theta),
         r * Math.cos(phi),
         r * Math.sin(phi) * Math.sin(theta)
      );
    }

    const accent = new THREE.Color(0x3f5fd1);
    MARKERS.forEach((m) => {
      const v = latLngToVec3(m.lat, m.lng, 1.015);
      // Pin sphere
      const pin = new THREE.Mesh(
        new THREE.SphereGeometry(0.018, 16, 16),
        new THREE.MeshBasicMaterial({ color: accent })
      );
      pin.position.copy(v);
      sphere.add(pin);

      // Halo ring (subtle)
      const halo = new THREE.Mesh(
        new THREE.RingGeometry(0.022, 0.034, 32),
        new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.32, side: THREE.DoubleSide })
      );
      halo.position.copy(v);
      halo.lookAt(0, 0, 0);
      sphere.add(halo);
    });

    /* ---- Lighting: editorial chiaroscuro ---- */
    scene.add(new THREE.AmbientLight(0xeef0ff, 0.55));
    const sun = new THREE.DirectionalLight(0xfff4dc, 1.8);
    sun.position.set(-3, 2.6, 2.4);
    scene.add(sun);
    const rim = new THREE.DirectionalLight(0xbfd4ff, 0.45);
    rim.position.set(2.5, 1.2, -2);
    scene.add(rim);

    /* ---- Initial pose: center on East Asia ---- */
    sphere.rotation.x = 0.22;
    sphere.rotation.y = -Math.PI * 1.2;

    /* ---- Animation loop ---- */
    const RAD_PER_SEC = 0.05;
    let lastT = performance.now();
    let animId = 0;
    const dragging = { active: false, lastX: 0, lastY: 0 };

    function animate(now) {
      animId = requestAnimationFrame(animate);
      const dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;
      if (!dragging.active) sphere.rotation.y += RAD_PER_SEC * dt;
      renderer.render(scene, camera);
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
