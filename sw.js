// Service worker do app Rabanada de Ouro.
// - Guarda o app, as imagens e os PDFs já abertos para abrir rápido e funcionar com internet fraca.
// - Página principal: busca a versão mais nova na rede e usa a guardada se estiver sem internet.
// - Vídeos do YouTube não são guardados (precisam de internet).
const VERSAO = "48a6877609";
const CACHE = `rabanada-ouro-${VERSAO}`;
const ESSENCIAIS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icone-192.png",
  "./icone-512.png",
  "./icone-180.png",
  "./img/hero.jpg",
  "./img/modulo-0.jpg",
  "./img/modulo-1.jpg",
  "./img/modulo-2.jpg",
  "./img/modulo-3.jpg",
  "./img/modulo-4.jpg",
  "./img/modulo-5.jpg",
  "./img/modulo-6.jpg",
  "./img/modulo-7.jpg",
  "./img/modulo-8.jpg",
  "./img/modulo-9.jpg",
  "./img/modulo-10.jpg"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ESSENCIAIS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n.startsWith("rabanada-ouro-") && n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;

  // Navegação (abrir o app): rede primeiro, para sempre pegar a versão nova.
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((resp) => { const copia = resp.clone(); caches.open(CACHE).then((c) => c.put("./index.html", copia)); return resp; })
        .catch(() => caches.match("./index.html")),
    );
    return;
  }

  // Imagens, ícones e PDFs: usa o guardado; se não tiver, baixa e guarda.
  e.respondWith(
    caches.match(req).then((guardado) => guardado || fetch(req).then((resp) => {
      if (resp.ok) { const copia = resp.clone(); caches.open(CACHE).then((c) => c.put(req, copia)); }
      return resp;
    })),
  );
});
