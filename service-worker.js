/* ============================================================
   service-worker.js — للتخزين المؤقت والعمل دون إنترنت
   الإصدار: 1.1 — إضافة maskable + screenshot إلى الكاش
   ============================================================ */

const CACHE_NAME = 'huruf-app-v1.1.0';
const RUNTIME_CACHE = 'huruf-runtime-v1';

/* الملفات الأساسية التي يجب تخزينها مسبقاً */
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './style.css',
  './quran-seeker.css',

  /* ملفات JavaScript */
  './script.js',
  './extras.js',
  './extras2.js',
  './jafr.js',
  './jafr-advanced.js',
  './jafr-tools.js',
  './jafr-ai.js',
  './dream-interpreter.js',
  './dream-ai.js',
  './freeai.js',
  './quran-index.js',
  './interactive-ai.js',
  './deep-semantic.js',
  './quran-seeker.js',

  /* الأيقونات */
  './icon-192x192.png',
  './icon-512x512.png',
  './icon-512x512-maskable.png',
  './screenshot-mobile.png',

  /* خطوط جوجل (اختياري — تُخزَّن مؤقتاً) */
  'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;900&family=Amiri:wght@400;700&display=swap'
];

/* ============ التثبيت ============ */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Pre-caching app shell');
        return cache.addAll(PRECACHE_URLS.map(url => new Request(url, { credentials: 'same-origin' })));
      })
      .then(() => self.skipWaiting())
      .catch((err) => console.warn('[SW] Pre-cache warning:', err))
  );
});

/* ============ التفعيل ============ */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

/* ============ الاستراتيجية ============
   - للملفات الأساسية: Cache First (سريع، يعمل بلا إنترنت)
   - لطلبات API (Gemini, alquran.cloud): Network Only (لا تُخزَّن)
   ============================================================ */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  /* تجاهل الطلبات غير GET */
  if (request.method !== 'GET') return;

  /* تجاهل طلبات API الخارجية (Gemini, Quran Cloud) */
  if (url.hostname.includes('generativelanguage.googleapis.com') ||
      url.hostname.includes('alquran.cloud')) {
    return; /* اتركها تمر مباشرة للشبكة */
  }

  /* تجاهل chrome-extension وغيرها */
  if (!url.protocol.startsWith('http')) return;

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        /* تحديث في الخلفية (stale-while-revalidate) */
        fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, networkResponse.clone());
            });
          }
        }).catch(() => {});
        return cachedResponse;
      }

      /* غير موجود في الكاش — اجلبه من الشبكة وخزّنه */
      return fetch(request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 ||
            networkResponse.type === 'opaque') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        /* إذا فشلت الشبكة وطلب HTML، أعطِ index.html كـ fallback */
        if (request.destination === 'document') {
          return caches.match('./index.html');
        }
      });
    })
  );
});

/* ============ رسائل من الصفحة (لتحديث الكاش) ============ */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});