/* v5.39: the installed Autopilot page's service worker. It does nothing but make the page installable and wait for the popup alerts (a later build).
   It never caches the Worker's answers, never sees a sign-in, and never fetches anything on its own. */
self.addEventListener('install', function(e){ self.skipWaiting(); });
self.addEventListener('activate', function(e){ e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function(e){ /* pass through: the network answers everything */ });
