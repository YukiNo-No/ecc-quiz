/* Service Worker
   アプリ本体をキャッシュして、オフラインでも起動できるようにする。
   ファイルを更新したら CACHE の版数（v1 → v2 …）を上げること。 */
const CACHE = "ecc-quiz-v3";
const ASSETS = ["./", "./index.html", "./questions.js", "./manifest.webmanifest"];

// インストール時に必要なファイルを先読みキャッシュ
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

// 古い版のキャッシュを掃除
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
         .then(() => self.clients.claim())
  );
});

// キャッシュ優先（オフライン時も確実に起動する）。無ければネットワークへ。
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(()=>{});
      return res;
    }).catch(() => caches.match("./index.html")))
  );
});
