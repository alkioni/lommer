/* Intro: "Fold open" loading screen.
 * White screen with the MM mark and three snap dots that fill in while the page loads,
 * then two white panels fold open from the centre to reveal the site.
 * - Only shown when <html> has the class "intro" (set by the small script in <head>):
 *   not with "Reduce motion", and only once per visit (session).
 * - Waits for the page and the hero photo to load, with a minimum of MIN ms so it never just flashes.
 * - If this script fails to load, CSS hides the screen after a few seconds, so the site is never blocked.
 */
(() => {
  const root = document.documentElement;
  const L = document.getElementById('ldr');
  if (!L) return;
  if (!root.classList.contains('intro')) { L.remove(); return; }

  const MIN = 2200, OUT = 1100;
  const t0 = performance.now();
  let loaded = document.readyState === 'complete';
  addEventListener('load', () => { loaded = true; });
  root.classList.add('is-loading');

  const tick = () => {
    const t = Math.min((performance.now() - t0) / MIN, 1);
    const eased = 1 - Math.pow(1 - t, 2.2);                 // fast start, gentle finish
    if (performance.now() - t0 > 6000) loaded = true;      // slow connection: never hold the site for more than 6 s
    const p = loaded ? eased : Math.min(eased, 0.92);       // never reach 100% before the page is ready
    L.style.setProperty('--p', p.toFixed(4));
    if (p < 1) return requestAnimationFrame(tick);
    L.classList.add('ldr--out');
    try { sessionStorage.setItem('lommer-intro', '1'); } catch (_) {}
    setTimeout(() => root.classList.remove('is-loading'), OUT * 0.5);
    setTimeout(() => { L.remove(); root.classList.remove('intro'); }, OUT + 100);
  };
  requestAnimationFrame(tick);
})();
