(function () {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }
  var btn = document.getElementById('install-btn');
  var sheet = document.getElementById('install-sheet');
  var steps = document.getElementById('install-steps');
  var go = document.getElementById('install-go');
  var later = document.getElementById('install-later');
  var deferred = null;
  var ua = navigator.userAgent || '';
  var isIOS = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  var mobile = /android|iphone|ipad|ipod|mobile/i.test(ua) || isIOS;

  if (standalone) { btn.hidden = true; return; }

  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; });
  window.addEventListener('appinstalled', function () { btn.hidden = true; sheet.hidden = true; });

  function open() {
    if (deferred) {
      steps.innerHTML = '<p>Add the site to your home screen to open it like an app.</p>';
      go.hidden = false;
    } else if (isIOS) {
      steps.innerHTML = '<ol><li>Tap the <b>Share</b> button in Safari (the square with an arrow).</li><li>Choose <b>Add to Home Screen</b>.</li><li>Tap <b>Add</b>.</li></ol>';
      go.hidden = true;
    } else {
      steps.innerHTML = '<ol><li>Open your browser menu (the <b>&#8942;</b> or <b>&#8943;</b> button).</li><li>Choose <b>Add to Home screen</b> or <b>Install app</b>.</li></ol>';
      go.hidden = true;
    }
    sheet.hidden = false;
  }
  btn.addEventListener('click', open);
  later.addEventListener('click', function () {
    sheet.hidden = true;
    try { localStorage.setItem('installDismissed', String(Date.now())); } catch (e) {}
  });
  go.addEventListener('click', function () {
    if (!deferred) return;
    deferred.prompt();
    deferred.userChoice.finally(function () { deferred = null; sheet.hidden = true; });
  });

  // Gentle prompt on phones, once a fortnight at most
  var last = 0;
  try { last = +localStorage.getItem('installDismissed') || 0; } catch (e) {}
  if (mobile && Date.now() - last > 14 * 864e5) setTimeout(open, 12000);
})();
