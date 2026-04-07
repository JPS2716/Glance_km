/**
 * COBE globe — vanilla port of the 21st/reapollo pattern (cobe).
 * https://21st.dev/community/components/reapollo/cobe-globe/default
 *
 * Loads `cobe` from esm.sh with jsdelivr fallback (some networks block one CDN).
 * Serve the site over http(s), not file://, so ES modules and imports work reliably.
 */
const COBE_URLS = [
  "https://esm.sh/cobe@0.6.3",
  "https://cdn.jsdelivr.net/npm/cobe@0.6.3/+esm",
];

let createGlobePromise = null;

function loadCreateGlobe() {
  if (createGlobePromise) return createGlobePromise;
  createGlobePromise = (async () => {
    let lastErr;
    for (const url of COBE_URLS) {
      try {
        const mod = await import(url);
        const fn = mod.default;
        if (typeof fn !== "function") throw new Error("cobe default export is not a function");
        return fn;
      } catch (e) {
        lastErr = e;
      }
    }
    console.error("[Glance globe] Failed to load cobe from all CDNs:", lastErr);
    throw lastErr;
  })();
  return createGlobePromise;
}

const MARKERS = [
  { id: "sf", location: [37.7595, -122.4367], label: "San Francisco" },
  { id: "nyc", location: [40.7128, -74.006], label: "New York" },
  { id: "tokyo", location: [35.6762, 139.6503], label: "Tokyo" },
  { id: "london", location: [51.5074, -0.1278], label: "London" },
  { id: "sydney", location: [-33.8688, 151.2093], label: "Sydney" },
  { id: "capetown", location: [-33.9249, 18.4241], label: "Cape Town" },
  { id: "dubai", location: [25.2048, 55.2708], label: "Dubai" },
  { id: "paris", location: [48.8566, 2.3522], label: "Paris" },
  { id: "saopaulo", location: [-23.5505, -46.6333], label: "São Paulo" },
];

const ARCS = [
  {
    id: "sf-tokyo",
    from: [37.7595, -122.4367],
    to: [35.6762, 139.6503],
    label: "SF → Tokyo",
  },
  {
    id: "nyc-london",
    from: [40.7128, -74.006],
    to: [51.5074, -0.1278],
    label: "NYC → London",
  },
];

/** RGB 0–1 tuned to Glance dark UI (#0e0e0e surface, #a2c9ff primary) */
const THEME = {
  markerColor: [0.635, 0.788, 1.0],
  baseColor: [0.098, 0.102, 0.102],
  arcColor: [0.45, 0.62, 0.98],
  glowColor: [0.11, 0.11, 0.12],
  dark: 1,
  mapBrightness: 10,
  markerSize: 0.025,
  markerElevation: 0.01,
  arcWidth: 0.5,
  arcHeight: 0.25,
  speed: 0.003,
  theta: 0.2,
  diffuse: 1.5,
  mapSamples: 16000,
};

function showLoadError(root, message) {
  if (root.querySelector("[data-cobe-fallback]")) return;
  const el = document.createElement("p");
  el.dataset.cobeFallback = "1";
  el.className =
    "text-on-surface-variant text-sm text-center mt-4 max-w-md mx-auto leading-relaxed";
  el.textContent = message;
  root.appendChild(el);
}

function mountGlobe(root, createGlobe) {
  const canvas = root.querySelector(".cobe-globe-canvas");
  if (!canvas || root.dataset.cobeMounted === "1") return;
  root.dataset.cobeMounted = "1";

  let pointerInteracting = null;
  let lastPointer = null;
  const dragOffset = { phi: 0, theta: 0 };
  const velocity = { phi: 0, theta: 0 };
  let phiOffsetRef = 0;
  let thetaOffsetRef = 0;
  let isPausedRef = false;

  const markers = MARKERS;
  const arcs = ARCS;
  const {
    markerColor,
    baseColor,
    arcColor,
    glowColor,
    dark,
    mapBrightness,
    markerSize,
    markerElevation,
    arcWidth,
    arcHeight,
    speed,
    theta,
    diffuse,
    mapSamples,
  } = THEME;

  function onPointerDown(e) {
    pointerInteracting = { x: e.clientX, y: e.clientY };
    canvas.style.cursor = "grabbing";
    isPausedRef = true;
  }

  function onPointerMove(e) {
    if (pointerInteracting === null) return;
    const deltaX = e.clientX - pointerInteracting.x;
    const deltaY = e.clientY - pointerInteracting.y;
    dragOffset.phi = deltaX / 300;
    dragOffset.theta = deltaY / 1000;
    const now = Date.now();
    if (lastPointer) {
      const dt = Math.max(now - lastPointer.t, 1);
      const maxVelocity = 0.15;
      velocity.phi = Math.max(
        -maxVelocity,
        Math.min(maxVelocity, ((e.clientX - lastPointer.x) / dt) * 0.3),
      );
      velocity.theta = Math.max(
        -maxVelocity,
        Math.min(maxVelocity, ((e.clientY - lastPointer.y) / dt) * 0.08),
      );
    }
    lastPointer = { x: e.clientX, y: e.clientY, t: now };
  }

  function onPointerUp() {
    if (pointerInteracting !== null) {
      phiOffsetRef += dragOffset.phi;
      thetaOffsetRef += dragOffset.theta;
      dragOffset.phi = 0;
      dragOffset.theta = 0;
      lastPointer = null;
    }
    pointerInteracting = null;
    canvas.style.cursor = "grab";
    isPausedRef = false;
  }

  canvas.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerup", onPointerUp, { passive: true });
  window.addEventListener("pointercancel", onPointerUp, { passive: true });

  let globe = null;
  let animationId = 0;
  let phi = 0;

  function markerPayload() {
    return markers.map((m) => ({
      location: m.location,
      size: markerSize,
      id: m.id,
    }));
  }

  function arcPayload() {
    return arcs.map((a) => ({
      from: a.from,
      to: a.to,
      id: a.id,
    }));
  }

  function init() {
    const width = canvas.offsetWidth;
    if (width === 0 || globe) return;

    try {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      globe = createGlobe(canvas, {
        devicePixelRatio: dpr,
        width,
        height: width,
        phi: 0,
        theta,
        dark,
        diffuse,
        mapSamples,
        mapBrightness,
        baseColor,
        markerColor,
        glowColor,
        markerElevation,
        markers: markerPayload(),
        arcs: arcPayload(),
        arcColor,
        arcWidth,
        arcHeight,
        opacity: 0.72,
      });
    } catch (err) {
      console.error("[Glance globe] createGlobe failed:", err);
      showLoadError(
        root,
        "3D globe failed to start (WebGL or GPU). Tried to initialize WebGL on this device — see the browser console for details.",
      );
      return;
    }

    function animate() {
      if (!globe) return;
      if (!isPausedRef) {
        phi += speed;
        if (Math.abs(velocity.phi) > 0.0001 || Math.abs(velocity.theta) > 0.0001) {
          phiOffsetRef += velocity.phi;
          thetaOffsetRef += velocity.theta;
          velocity.phi *= 0.95;
          velocity.theta *= 0.95;
        }
        const thetaMin = -0.4;
        const thetaMax = 0.4;
        if (thetaOffsetRef < thetaMin) {
          thetaOffsetRef += (thetaMin - thetaOffsetRef) * 0.1;
        } else if (thetaOffsetRef > thetaMax) {
          thetaOffsetRef += (thetaMax - thetaOffsetRef) * 0.1;
        }
      }
      globe.update({
        phi: phi + phiOffsetRef + dragOffset.phi,
        theta: theta + thetaOffsetRef + dragOffset.theta,
        dark,
        mapBrightness,
        markerColor,
        baseColor,
        arcColor,
        markerElevation,
        markers: markerPayload(),
        arcs: arcPayload(),
      });
      animationId = requestAnimationFrame(animate);
    }

    animate();
    setTimeout(() => {
      canvas.style.opacity = "1";
    }, 0);
  }

  if (canvas.offsetWidth > 0) {
    init();
  } else {
    const ro = new ResizeObserver((entries) => {
      if (entries[0]?.contentRect.width > 0) {
        ro.disconnect();
        init();
      }
    });
    ro.observe(canvas);
  }
}

async function initAll() {
  let createGlobeFn;
  try {
    createGlobeFn = await loadCreateGlobe();
  } catch {
    const msg =
      "Could not download the globe engine (blocked network or offline). Open this site via a local or hosted server (not file://) and allow scripts from esm.sh or cdn.jsdelivr.net.";
    document.querySelectorAll("[data-cobe-globe-root]").forEach((root) => {
      showLoadError(root, msg);
    });
    return;
  }

  document.querySelectorAll("[data-cobe-globe-root]").forEach((root) => {
    mountGlobe(root, createGlobeFn);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAll);
} else {
  initAll();
}
