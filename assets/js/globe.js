/* ================================================================
   globe.js — textured Earth with lat/lng overlay and life-point pins
   Loads a public-domain equirectangular Earth texture from the
   three-globe package (served via unpkg). If the texture fails to
   load, gracefully falls back to a procedural warm-gray sphere.

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
    { name: 'Bristol',   meta: 'M.Sc. · Univ. Bristol', lat: 51.45, lng:  -2.58, labelOffX: -0.22, labelOffY: -0.05 },
    { name: 'Beijing',   meta: '51WORLD · 2025',        lat: 39.90, lng: 116.40 },
    { name: 'Cardiff',   meta: 'Ph.D. · Cardiff Univ.', lat: 51.48, lng:  -3.18, labelOffX:  0.22, labelOffY:  0.07 },
  ];

  // Public NASA Blue-Marble-style texture from the three-globe repo.
  // jsdelivr's /gh/ proxy serves files directly from GitHub (the /npm/ path
  // would 404 — example/img is not shipped in the npm tarball).
  const TEX_BASE   = 'https://cdn.jsdelivr.net/gh/vasturiano/three-globe@master/example/img/';
  const TEX_EARTH  = TEX_BASE + 'earth-blue-marble.jpg';
  const TEX_BUMP   = TEX_BASE + 'earth-topology.png';

  /* ---------- lat/lng → Vec3 on default-UV Three.js sphere ---------- */
  // Default Three.js SphereGeometry UVs map prime meridian (lng=0) to +X,
  // so equirectangular textures (PM at image centre) align automatically.
  function latLngToVec3(lat, lng, r) {
    const phi    = (90 - lat) * Math.PI / 180;
    const lngRad = lng * Math.PI / 180;
    return new THREE.Vector3(
       r * Math.cos(lngRad) * Math.sin(phi),
       r * Math.cos(phi),
      -r * Math.sin(lngRad) * Math.sin(phi)
    );
  }

  /* ---------- Label sprite (CanvasTexture) ---------- */
  function makeLabelTexture(name, meta) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = 560, H = 180;
    const cv = document.createElement('canvas');
    cv.width  = W * dpr;
    cv.height = H * dpr;
    const ctx = cv.getContext('2d');
    ctx.scale(dpr, dpr);

    // Pill background — dark glass
    const padX = 28, padY = 22, radius = 22;
    const text1 = name;
    const text2 = meta;

    ctx.font = '700 38px "Playfair Display", Georgia, serif';
    const w1 = ctx.measureText(text1).width;
    ctx.font = '500 20px "Space Grotesk", system-ui, sans-serif';
    const w2 = ctx.measureText(text2).width;
    const pillW = Math.min(W - 16, Math.max(w1, w2) + padX * 2);
    const pillH = 110;
    const x0 = 16, y0 = (H - pillH) / 2;

    // Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
    roundRect(ctx, x0 + 3, y0 + 6, pillW, pillH, radius); ctx.fill();

    // Glass body
    const grad = ctx.createLinearGradient(0, y0, 0, y0 + pillH);
    grad.addColorStop(0, 'rgba(18, 22, 38, 0.88)');
    grad.addColorStop(1, 'rgba(28, 34, 56, 0.92)');
    ctx.fillStyle = grad;
    roundRect(ctx, x0, y0, pillW, pillH, radius); ctx.fill();

    // Inner highlight border
    ctx.strokeStyle = 'rgba(255, 245, 200, 0.35)';
    ctx.lineWidth = 1;
    roundRect(ctx, x0 + 0.5, y0 + 0.5, pillW - 1, pillH - 1, radius); ctx.stroke();

    // Accent dot (left)
    ctx.fillStyle = '#ffe680';
    ctx.shadowColor = '#ffe680';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(x0 + 22, y0 + pillH / 2, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Name
    ctx.font = '700 38px "Playfair Display", Georgia, serif';
    ctx.fillStyle = '#fff4b0';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(text1, x0 + 44, y0 + 50);

    // Meta
    ctx.font = '500 18px "Space Grotesk", system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.62)';
    ctx.letterSpacing = '0.06em';
    ctx.fillText(text2, x0 + 44, y0 + 82);

    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.needsUpdate = true;
    return { texture: tex, aspect: W / H };
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y,     x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x,     y + h, r);
    ctx.arcTo(x,     y + h, x,     y,     r);
    ctx.arcTo(x,     y,     x + w, y,     r);
    ctx.closePath();
  }

  /* ---------- Pin builder: dot + pulsing ring + label sprite ---------- */
  function buildPin(m, parent) {
    const surface = latLngToVec3(m.lat, m.lng, 1.0);
    const out     = surface.clone().normalize();

    const group = new THREE.Group();
    group.position.copy(surface.clone().multiplyScalar(1.015));
    parent.add(group);

    // Orient the group's local +Z to point outward from globe centre,
    // so flat geometries (ring, sprite offset) lie in the tangent plane.
    group.lookAt(group.position.clone().add(out));

    // Bright core dot
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.013, 20, 20),
      new THREE.MeshBasicMaterial({ color: 0xfff4b0, transparent: true, opacity: 1, depthWrite: false })
    );
    group.add(dot);

    // Static halo ring
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.018, 0.026, 48),
      new THREE.MeshBasicMaterial({ color: 0xffe680, transparent: true, opacity: 0.7, side: THREE.DoubleSide, depthWrite: false })
    );
    group.add(ring);

    // Pulsing ring (radiates outward over time)
    const pulse = new THREE.Mesh(
      new THREE.RingGeometry(0.020, 0.026, 48),
      new THREE.MeshBasicMaterial({ color: 0xffe680, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false })
    );
    group.add(pulse);

    // Label sprite — offset upward in the local tangent plane
    const { texture, aspect } = makeLabelTexture(m.name, m.meta);
    const labelMat = new THREE.SpriteMaterial({
      map: texture, transparent: true, depthWrite: false, depthTest: false,
    });
    const label = new THREE.Sprite(labelMat);
    const labelW = 0.36;
    label.scale.set(labelW, labelW / aspect, 1);
    // Position label in world space (Sprite always faces camera, ignoring group rotation).
    // We re-base it from the group's world position: offset up + slightly out.
    // Optional per-marker tangent-plane nudge (labelOffX/Y) pulls apart
    // tightly-clustered pins such as Bristol & Cardiff so labels don't overlap.
    const offX = m.labelOffX || 0;
    const offY = m.labelOffY || 0;
    label.position.set(offX, 0.06 + (labelW / aspect) / 2 + offY, 0);
    label.renderOrder = 999;
    group.add(label);

    return { group, dot, ring, pulse, label };
  }

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
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.cssText = 'width:100%;height:100%;display:block;cursor:grab;touch-action:none;';
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.z = 3.0;

    /* ---- Earth sphere: starts warm gray, upgrades to real texture ---- */
    const material = new THREE.MeshStandardMaterial({
      color:     new THREE.Color(0xe8e4d8),   // fallback / tint when no texture
      roughness: 0.92,
      metalness: 0.02,
    });
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(1, 128, 128), material);
    scene.add(sphere);

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');

    // Diffuse: Blue-Marble Earth
    loader.load(
      TEX_EARTH,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
        material.map   = tex;
        material.color = new THREE.Color(0xffffff);  // drop the fallback tint
        material.needsUpdate = true;
      },
      undefined,
      (err) => console.warn('[globe] earth texture failed, keeping fallback', err)
    );

    // Bump: subtle topography
    loader.load(
      TEX_BUMP,
      (tex) => {
        material.bumpMap   = tex;
        material.bumpScale = 0.045;
        material.needsUpdate = true;
      },
      undefined,
      () => { /* silent — bump is decorative */ }
    );

    /* ---- Wireframe overlay: 13 latitude rings + 24 longitude meridians ---- */
    const wireMat = new THREE.LineBasicMaterial({
      color:        new THREE.Color(0xffffff),
      transparent:  true,
      opacity:      0.16,
    });
    const wirePts = [];
    const R = 1.002;

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
        wirePts.push(new THREE.Vector3(Math.sin(p0) * Math.cos(theta), Math.cos(p0), Math.sin(p0) * Math.sin(theta)));
        wirePts.push(new THREE.Vector3(Math.sin(p1) * Math.cos(theta), Math.cos(p1), Math.sin(p1) * Math.sin(theta)));
      }
    }
    sphere.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(wirePts), wireMat));

    /* ---- Equator slightly stronger ---- */
    const eqPts = [];
    const eqSegs = 192;
    for (let i = 0; i < eqSegs; i++) {
      const t0 = (i     / eqSegs) * Math.PI * 2;
      const t1 = ((i+1) / eqSegs) * Math.PI * 2;
      eqPts.push(new THREE.Vector3(1.003 * Math.cos(t0), 0, 1.003 * Math.sin(t0)));
      eqPts.push(new THREE.Vector3(1.003 * Math.cos(t1), 0, 1.003 * Math.sin(t1)));
    }
    const eqMat = new THREE.LineBasicMaterial({
      color: new THREE.Color(0xffffff), transparent: true, opacity: 0.32,
    });
    sphere.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(eqPts), eqMat));

    /* ---- Atmosphere glow: slightly larger sphere with additive backside ---- */
    const atmoMat = new THREE.ShaderMaterial({
      uniforms: { c: { value: 0.45 }, p: { value: 4.5 } },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `
        uniform float c; uniform float p;
        varying vec3 vNormal;
        void main() {
          float intensity = pow(c - dot(vNormal, vec3(0.0, 0.0, 1.0)), p);
          gl_FragColor = vec4(0.55, 0.7, 0.95, 1.0) * intensity;
        }`,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });
    const atmo = new THREE.Mesh(new THREE.SphereGeometry(1.08, 64, 64), atmoMat);
    scene.add(atmo);

    /* ---- Life-point markers (deferred until web fonts have loaded so the
            canvas textures pick up Playfair / Space Grotesk, not fallback) ---- */
    const pins = [];
    const fontsReady = (document.fonts && document.fonts.load)
      ? Promise.all([
          document.fonts.load('700 38px "Playfair Display"'),
          document.fonts.load('500 20px "Space Grotesk"'),
        ]).catch(() => null)
      : Promise.resolve();
    fontsReady.then(() => {
      MARKERS.forEach((m) => pins.push(buildPin(m, sphere)));
    });

    /* ---- Lighting: warm sunlight + cool fill ---- */
    scene.add(new THREE.AmbientLight(0xffffff, 0.45));
    const sun = new THREE.DirectionalLight(0xfff4dc, 1.6);
    sun.position.set(-3, 2.2, 2.6);
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0xbfd4ff, 0.55);
    fill.position.set(2.5, 0.8, -1.5);
    scene.add(fill);

    /* ---- Initial pose: centre on East Asia ---- */
    sphere.rotation.x =  0.22;
    sphere.rotation.y = -1.85;   // ~-106° → puts East Asia toward camera

    /* ---- Animation ---- */
    const RAD_PER_SEC = 0.04;
    let lastT = performance.now();
    const dragging = { active: false, lastX: 0, lastY: 0 };

    const tmpWorld  = new THREE.Vector3();
    const tmpToCam  = new THREE.Vector3();

    function animate(now) {
      requestAnimationFrame(animate);
      const dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;
      if (!dragging.active) sphere.rotation.y += RAD_PER_SEC * dt;

      // Pulse rings + back-face fade for pins
      const t = now * 0.001;
      pins.forEach((p, i) => {
        // Pulse: each pin staggered by 0.5s so they don't strobe in unison
        const phase = (t + i * 0.5) % 2;        // 0..2 second loop
        const k = phase < 1 ? phase : 0;        // 1-second visible pulse then 1s rest
        const scale = 1 + k * 2.2;
        p.pulse.scale.set(scale, scale, 1);
        p.pulse.material.opacity = (1 - k) * 0.55;

        // Back-face fade for the whole pin group
        p.group.getWorldPosition(tmpWorld);
        tmpToCam.copy(camera.position).sub(tmpWorld).normalize();
        tmpWorld.normalize();                                       // becomes the surface normal
        const facing = tmpWorld.dot(tmpToCam);                      // 1 = pointing at camera
        const vis = Math.max(0, Math.min(1, (facing - 0.05) * 2.4));
        p.dot.material.opacity   = vis;
        p.ring.material.opacity  = vis * 0.7;
        p.pulse.material.opacity = p.pulse.material.opacity * vis;
        p.label.material.opacity = vis;
        p.group.visible = vis > 0.01;
      });

      renderer.render(scene, camera);
    }
    requestAnimationFrame(animate);

    /* ---- Resize ---- */
    window.addEventListener('resize', () => {
      const s = size();
      renderer.setSize(s, s, false);
    });

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
