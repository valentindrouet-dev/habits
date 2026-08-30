/* Service worker.
   Stratégie : « réseau d'abord » pour la coquille de l'app (HTML/CSS/JS), pour
   qu'une nouvelle version soit prise en compte dès le lancement suivant ;
   « cache d'abord » pour les ressources figées (icônes). Le cache reste le
   filet de sécurité hors-ligne dans les deux cas. */

const VERSION = 'v8';
const CACHE = 'habits-' + VERSION;

const SHELL = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.webmanifest',
];

const ASSETS = [
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(SHELL.concat(ASSETS)))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* La page peut demander une activation immédiate après une mise à jour. */
self.addEventListener('message', e => {
  if (e.data === 'skip-waiting') self.skipWaiting();
});

/* Clic sur le rappel quotidien : on ramène l'app au premier plan. */
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if ('focus' in c) return c.focus();
      }
      return self.clients.openWindow ? self.clients.openWindow('./') : undefined;
    })
  );
});

function isShell(url, req) {
  if (req.mode === 'navigate') return true;
  return /\.(html|css|js|webmanifest)$/.test(url.pathname) || url.pathname.endsWith('/');
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (isShell(url, req)) {
    /* réseau d'abord : la version en ligne gagne toujours quand elle répond */
    e.respondWith(
      fetch(req)
        .then(res => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then(c => c.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req).then(hit => hit || caches.match('./index.html')))
    );
    return;
  }

  /* ressources figées : cache d'abord */
  e.respondWith(
    caches.match(req).then(hit =>
      hit ||
      fetch(req).then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      })
    )
  );
});
