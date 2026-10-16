/* Бесплатный Motion: самостоятельное улучшение существующей HTML-страницы. */
(() => {
  "use strict";
  const engine = window.Motion;
  if (!engine || !["animate", "inView", "hover", "press", "scroll", "stagger"].every((name) => typeof engine[name] === "function")) return;
  const { animate, inView, hover, press, scroll, stagger } = engine;
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const active = new Set();
  const animated = new Set();
  let cleanups = [];
  const easing = [0.16, 1, 0.3, 1];
  function run(element, properties, options = {}) {
    if (preference.matches || !element) return;
    const controls = animate(element, properties, options);
    active.add(controls);
    const finished = () => active.delete(controls);
    Promise.resolve(controls).then(finished, finished);
    return controls;
  }
  const header = document.querySelector(".header");
  const stopProgress = scroll((progress) => header?.style.setProperty("--scroll-progress", String(progress)));
  window.addEventListener("pagehide", stopProgress, { once: true });
  function reveal(element) {
    if (animated.has(element)) return;
    animated.add(element);
    run(element, { opacity: [0.35, 1], y: [18, 0] }, { duration: 0.6, ease: easing });
  }
  const marker = document.querySelector(".case-indicator");
  function moveMarker(instant = false) {
    const selected = document.querySelector(".case-tab.is-active");
    if (!marker || !selected) return;
    const offset = selected.offsetLeft;
    if (instant || preference.matches) marker.style.transform = `translateX(${offset}px)`;
    else run(marker, { x: offset }, { type: "spring", stiffness: 360, damping: 34 });
  }
  function configure() {
    cleanups.forEach((cleanup) => cleanup());
    cleanups = [];
    active.forEach((controls) => controls.cancel());
    active.clear();
    document.querySelectorAll(".button, .case-tab, .pdr-copy, .case-viewer, .care-heading, .approach-visual, .approach-copy, .price-grid > div, .section-heading, .gallery-feature, .contacts-grid > div, .service, .service-body, #case-image, .dialog-shell, .hero .eyebrow, .hero h1, .hero-lead, .hero .actions").forEach((element) => {
      element.style.removeProperty("transform");
      element.style.removeProperty("opacity");
    });
    moveMarker(true);
    document.documentElement.classList.toggle("motion-ready", !preference.matches);
    if (preference.matches) return;
    cleanups.push(inView(".pdr-copy, .case-viewer, .care-heading, .approach-visual, .approach-copy, .price-grid > div, .section-heading, .gallery-feature, .contacts-grid > div", reveal, { amount: 0.08 }));
    cleanups.push(inView(".services-grid", (group) => {
      const items = [...group.querySelectorAll(".service")].filter((element) => !animated.has(element));
      items.forEach((element) => animated.add(element));
      if (items.length) run(items, { opacity: [0.35, 1], y: [16, 0] }, { duration: 0.5, delay: stagger(0.08), ease: easing });
    }, { amount: 0.1 }));
    cleanups.push(hover(".button", (element) => {
      run(element, { y: -2 }, { type: "spring", stiffness: 350, damping: 28 });
      return () => run(element, { y: 0 }, { type: "spring", stiffness: 350, damping: 28 });
    }));
    cleanups.push(press(".button, .case-tab", (element) => {
      run(element, { scale: 0.975 }, { type: "spring", stiffness: 500, damping: 32 });
      return () => run(element, { scale: 1 }, { type: "spring", stiffness: 400, damping: 24 });
    }));
  }
  document.addEventListener("site:workchange", () => {
    moveMarker();
    run(document.querySelector("#case-image"), { opacity: [0.35, 1], x: [8, 0] }, { duration: 0.36, ease: easing });
  });
  document.addEventListener("site:vieweropen", () => run(document.querySelector(".dialog-shell"), { opacity: [0, 1], scale: [0.97, 1] }, { duration: 0.25, ease: easing }));
  document.querySelectorAll("details.service").forEach((details) => details.addEventListener("toggle", () => {
    if (details.open) run(details.querySelector(".service-body"), { opacity: [0, 1], y: [-5, 0] }, { duration: 0.22, ease: easing });
  }));
  window.addEventListener("resize", () => moveMarker(true), { passive: true });
  preference.addEventListener("change", configure);
  configure();
  if (!preference.matches && window.scrollY < 100) {
    run(document.querySelectorAll(".hero .eyebrow, .hero h1, .hero-lead, .hero .actions"), { opacity: [0.65, 1], y: [16, 0] }, { duration: 0.7, delay: stagger(0.08), ease: easing });
  }
})();
