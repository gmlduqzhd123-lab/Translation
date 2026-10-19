// 다국어 수업자료 변환기 오프라인 캐시 — 같은 주소의 다른 엽쌤 앱과 캐시 저장소를 같이 쓰므로 내 접두어 캐시만 지운다
const CACHE = 'translation-v8';
const CACHE_PREFIX = 'translation-v';
const CORE = ['./', './index.html', './styles.css', './app.js', './vendor/jszip.min.js',
  './src/document-processor.js', './src/school-glossary.js', './src/storage-service.js', './src/translator-service.js', './src/case-sharing-service.js',
  './samples/sample-science-lesson.pptx', './samples/sample-science-activity.hwpx',
  './manifest.webmanifest', './ys-install.js', './ys-qr.js', './qr.svg',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png', './icons/favicon-32.png', './icons/apple-touch-icon.png'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith(CACHE_PREFIX) && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(fetch(req).then(res => { if (res.ok) { const c = res.clone(); caches.open(CACHE).then(x => x.put(req, c)); } return res; })
    .catch(() => caches.match(req).then(hit => hit || (req.mode === 'navigate' ? caches.match('./index.html') : undefined))));
});
