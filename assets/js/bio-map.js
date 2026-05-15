/* ================================================================
   bio-map.js — Leaflet map of life anchors
   Renders 4 markers (Ganzhou, Wenzhou, Bristol, Beijing) on a
   desaturated tile layer; fits the view to include all points.
   ================================================================ */
(function () {
  'use strict';

  if (typeof L === 'undefined') {
    console.warn('[bio-map] Leaflet not available — skipping');
    return;
  }

  const el = document.getElementById('bio-map');
  if (!el) return;

  const PINS = [
    { name: 'Ganzhou',  meta: '2019 – 2023 · B.Sc. JXUST',           lat: 25.83, lng: 114.94 },
    { name: 'Wenzhou',  meta: 'Hometown · Zhejiang Province',         lat: 27.99, lng: 120.70 },
    { name: 'Bristol',  meta: '2023 – 2024 · MSc University of Bristol', lat: 51.45, lng:  -2.58 },
    { name: 'Beijing',  meta: '2025 – present · 51WORLD',             lat: 39.90, lng: 116.40 },
  ];

  const map = L.map(el, {
    zoomControl: true,
    scrollWheelZoom: false,
    attributionControl: false,
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 10,
    minZoom: 2,
  }).addTo(map);

  const bounds = L.latLngBounds([]);

  PINS.forEach((p) => {
    const icon = L.divIcon({
      className: 'pin-cluster',
      html: `<div class="pin-cluster-inner">${p.name.slice(0, 2)}</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
    const marker = L.marker([p.lat, p.lng], { icon }).addTo(map);
    marker.bindPopup(
      `<span class="pin-meta">${p.meta}</span><strong>${p.name}</strong>`,
      { className: 'pin-popup', offset: [0, -8] }
    );
    bounds.extend([p.lat, p.lng]);
  });

  map.fitBounds(bounds, { padding: [40, 40], maxZoom: 4 });
})();
