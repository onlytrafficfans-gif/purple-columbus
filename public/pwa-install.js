(function () {
  'use strict';

  var DISMISS_KEY = 'pc_a2hs_dismissed';

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(function () {});
  }

  var isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;
  if (isStandalone) return;

  var dismissed = false;
  try { dismissed = localStorage.getItem(DISMISS_KEY) === '1'; } catch (e) {}
  if (dismissed) return;

  var deferredPrompt = null;
  var isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);

  function dismiss() {
    try { localStorage.setItem(DISMISS_KEY, '1'); } catch (e) {}
    var el = document.getElementById('pc-a2hs');
    if (el) {
      el.style.transform = 'translateY(120%)';
      setTimeout(function () { el.remove(); }, 350);
    }
  }

  function showBanner() {
    if (document.getElementById('pc-a2hs')) return;

    var banner = document.createElement('div');
    banner.id = 'pc-a2hs';
    banner.style.cssText =
      'position:fixed;left:12px;right:12px;bottom:12px;z-index:99999;' +
      'display:flex;align-items:center;gap:14px;padding:14px 16px;' +
      'background:#14060f;border:1px solid rgba(155,48,255,0.5);' +
      'box-shadow:0 8px 32px rgba(0,0,0,0.6),0 0 20px rgba(155,48,255,0.25);' +
      'font-family:Barlow,-apple-system,sans-serif;color:#fff;' +
      'max-width:456px;margin:0 auto;transform:translateY(120%);' +
      'transition:transform 0.35s cubic-bezier(0.16,1,0.3,1);';

    var actionHtml = isIos
      ? '<div style="font-size:12px;color:rgba(255,255,255,0.65);line-height:1.5;">' +
        'Tap <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="2" style="vertical-align:-2px;"><path d="M12 3v13"/><path d="m8 7 4-4 4 4"/><rect x="4" y="10" width="16" height="11" rx="2"/></svg> ' +
        'then <b style="color:#fff;">Add to Home Screen</b></div>'
      : '<button id="pc-a2hs-add" style="background:#9b30ff;color:#fff;border:none;padding:11px 20px;' +
        'font-size:12px;font-weight:700;letter-spacing:0.12em;cursor:pointer;' +
        'font-family:Barlow,sans-serif;flex-shrink:0;' +
        'clip-path:polygon(0 0,100% 0,100% 70%,90% 100%,0 100%);">ADD</button>';

    banner.innerHTML =
      '<img src="./assets/pc-logo-64.png" alt="Purple Columbus" width="42" height="42" style="flex-shrink:0;border-radius:8px;" />' +
      '<div style="flex:1;min-width:0;">' +
      '<div style="font-size:13px;font-weight:700;letter-spacing:0.06em;">ADD TO HOME SCREEN</div>' +
      (isIos
        ? actionHtml
        : '<div style="font-size:12px;color:rgba(255,255,255,0.65);margin-top:3px;">Get Purple Columbus one tap away.</div>') +
      '</div>' +
      (isIos ? '' : actionHtml) +
      '<button id="pc-a2hs-close" aria-label="Dismiss" style="background:none;border:none;padding:6px;cursor:pointer;flex-shrink:0;">' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="2"><path d="M4 4l16 16"/><path d="M20 4 4 20"/></svg>' +
      '</button>';

    document.body.appendChild(banner);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { banner.style.transform = 'translateY(0)'; });
    });

    var closeBtn = document.getElementById('pc-a2hs-close');
    if (closeBtn) closeBtn.addEventListener('click', dismiss);

    var addBtn = document.getElementById('pc-a2hs-add');
    if (addBtn) {
      addBtn.addEventListener('click', function () {
        if (!deferredPrompt) { dismiss(); return; }
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(function () {
          deferredPrompt = null;
          dismiss();
        });
      });
    }
  }

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    showBanner();
  });

  if (isIos) {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      setTimeout(showBanner, 1500);
    } else {
      document.addEventListener('DOMContentLoaded', function () { setTimeout(showBanner, 1500); });
    }
  }
})();
