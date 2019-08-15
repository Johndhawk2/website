/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

importScripts("https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [
  {
    "url": "css/Weather1.css",
    "revision": "374066011e080ec62f80b452df4eb7ba"
  },
  {
    "url": "Images/Close.png",
    "revision": "dd47933c2ee8c4516483270d408cf437"
  },
  {
    "url": "Images/icons/icon-128x128.png",
    "revision": "765e1fcd6adeadfb99f42a2e37743356"
  },
  {
    "url": "Images/icons/icon-144x144.png",
    "revision": "925359f2124fdc522269dea136785bbe"
  },
  {
    "url": "Images/icons/icon-152x152.png",
    "revision": "8df9b5de40813ebbd4b0d8fdb4b73049"
  },
  {
    "url": "Images/icons/icon-192x192.png",
    "revision": "dc85b23ed9de586a0f45f6dda29adace"
  },
  {
    "url": "Images/icons/icon-384x384.png",
    "revision": "c43f5701226df3cf1d9736d39e4ba267"
  },
  {
    "url": "Images/icons/icon-512x512.png",
    "revision": "701a7b4291dd693359364f3824581b7f"
  },
  {
    "url": "Images/icons/icon-72x72.png",
    "revision": "85a75e3f9fdde4b9f1a7ac90113a0e56"
  },
  {
    "url": "Images/icons/icon-96x96.png",
    "revision": "f0ab6dd2ead1a5b03857d6bc66d1dc39"
  },
  {
    "url": "Images/Refresh.png",
    "revision": "9aeab871458a86ccdd8c6837c654f212"
  },
  {
    "url": "index.html",
    "revision": "b342ef74b78b9fdb84797c28c8e65d2f"
  },
  {
    "url": "js/Weather1.js",
    "revision": "80c005449c90ae4f599e3eded0be801d"
  },
  {
    "url": "manifest.json",
    "revision": "3d8b2616a75c1055ead3f552b16ffbe0"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
