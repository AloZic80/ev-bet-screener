/* v5.40: the installed Autopilot page's service worker. It makes the page installable and shows the popup alerts your Worker sends (RFC 8030 Web Push).
   A popup only TELLS you what already happened; tapping it opens the control page. It never caches the Worker's answers, never sees a sign-in, never calls the Worker, and can place or stop nothing. */
self.addEventListener('install', function(e){ self.skipWaiting(); });
self.addEventListener('activate', function(e){ e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function(e){ /* pass through: the network answers everything */ });
self.addEventListener('push', function(e){
  var d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = { title: '0xBeta', body: e.data ? e.data.text() : '' }; }
  var title = String(d.title || '0xBeta').slice(0, 80);
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(cs){ cs.forEach(function(c){ try { c.postMessage({ type: 'push', at: Date.now() }); } catch (err) {} }); }));   /* v5.42: lets an open control page say when a push arrived */
  e.waitUntil(self.registration.showNotification(title, { body: String(d.body || '').slice(0, 300), tag: String(d.tag || '0xbeta').slice(0, 40), icon: 'icons/autopilot-192.png', badge: 'icons/autopilot-192.png', renotify: true, data: { url: String(d.url || 'control.html').slice(0, 120) } }));
});
self.addEventListener('notificationclick', function(e){
  e.notification.close();
  var url = (e.notification.data && e.notification.data.url) || 'control.html';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(cs){
    for (var i = 0; i < cs.length; i++) { if ('focus' in cs[i]) return cs[i].focus(); }
    return self.clients.openWindow(url);
  }));
});
