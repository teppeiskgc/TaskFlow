
// キャッシュの名前
const CACHE_NAME = "taskflow-v1";

// 保存するファイル
const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./manifest.json"
];

// インストール時にファイルを保存する
self.addEventListener("install", function(event) {

    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(FILES_TO_CACHE);
        })
    );

});

// ページを開いたときの通信処理
self.addEventListener("fetch", function(event) {

    event.respondWith(
        caches.match(event.request).then(function(response) {

            return response || fetch(event.request);

        })
    );

});
