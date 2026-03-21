self.addEventListener('push', e => {
  const data = e.data?.json() ?? {};
  e.waitUntil(
    self.registration.showNotification(data.title || 'Sinario', {
      body: data.body || '',
      icon: '/sinario-192.png',
      badge: '/sinario-192.png',
      dir: 'rtl',
      lang: 'he'
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow('/'));
});