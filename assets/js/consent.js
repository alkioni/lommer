/* Cookie consent + Google Analytics 4.
 * - Google Analytics is NOT loaded until the visitor clicks "Accept". No request goes to Google before that.
 * - The choice is remembered on the visitor's device (localStorage "lommer-consent": "granted" | "denied").
 * - "Cookie settings" in the footer reopens the banner; declining later switches analytics off and removes its cookies.
 */
(() => {
  const GA_ID = 'G-11KTFZB0KQ';
  const KEY = 'lommer-consent';
  const get = () => { try { return localStorage.getItem(KEY); } catch (_) { return null; } };
  const set = v => { try { localStorage.setItem(KEY, v); } catch (_) {} };

  function loadAnalytics() {
    if (window.__lommerGA) return;
    window.__lommerGA = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    gtag('js', new Date());
    gtag('config', GA_ID);
    const s = document.createElement('script');
    s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    // while testing on this computer, don't send visits to the real Analytics property
    if (/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) { s.type = 'text/plain'; s.dataset.localTest = 'not sent'; }
    document.head.appendChild(s);
  }

  function stopAnalytics() {
    if (window.gtag) gtag('consent', 'update', { analytics_storage: 'denied' });
    window['ga-disable-' + GA_ID] = true;
    // remove Google Analytics cookies (_ga, _ga_XXXX) for this domain and its parent
    const host = location.hostname, domains = [host, '.' + host, '.' + host.split('.').slice(-2).join('.')];
    document.cookie.split(';').map(c => c.trim().split('=')[0]).filter(n => /^_ga/.test(n))
      .forEach(n => domains.forEach(d => { document.cookie = `${n}=; Max-Age=0; path=/; domain=${d}`; document.cookie = `${n}=; Max-Age=0; path=/`; }));
  }

  // ---- banner ----
  let bar = null;
  function showBanner() {
    if (bar) { bar.hidden = false; bar.querySelector('button').focus(); return; }
    bar = document.createElement('div');
    bar.className = 'consent';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-label', 'Cookie preferences');
    bar.innerHTML = `
      <p>We use cookies (Google Analytics) to understand how visitors use this site, only if you agree. <a href="privacy.html">Privacy</a></p>
      <div class="consent__btns"><button type="button" data-c="denied">Decline</button><button type="button" data-c="granted" class="is-primary">Accept</button></div>`;
    bar.addEventListener('click', e => {
      const b = e.target.closest('button[data-c]'); if (!b) return;
      const v = b.dataset.c; set(v);
      if (v === 'granted') loadAnalytics(); else stopAnalytics();
      bar.hidden = true;
    });
    document.body.appendChild(bar);
  }

  // footer link "Cookie settings"
  document.addEventListener('click', e => {
    if (e.target.closest('[data-consent-open]')) { e.preventDefault(); showBanner(); }
  });

  const choice = get();
  if (choice === 'granted') loadAnalytics();
  else if (choice !== 'denied') showBanner();
})();
