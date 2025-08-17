const CACHE_NAME = 'cropschool-v1';
const OFFLINE_URL = '/offline';

// Files to cache for offline use
const STATIC_CACHE_FILES = [
    '/',
    '/games',
    '/games/math-adventure',
    '/parents',
    '/settings',
    '/offline',
    '/manifest.json',
    // Add other static assets
];

// Install event - cache static files
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching static files');
                return cache.addAll(STATIC_CACHE_FILES);
            })
            .then(() => {
                console.log('Service Worker: Install complete');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Service Worker: Install failed', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('Service Worker: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activate complete');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve cached files when offline
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Handle different types of requests
    if (request.method === 'GET') {
        // Handle navigation requests
        if (request.mode === 'navigate') {
            event.respondWith(
                fetch(request)
                    .then((response) => {
                        // If online, serve from network and update cache
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(request, responseClone);
                            });
                        return response;
                    })
                    .catch(() => {
                        // If offline, serve from cache or offline page
                        return caches.match(request)
                            .then((cachedResponse) => {
                                return cachedResponse || caches.match(OFFLINE_URL);
                            });
                    })
            );
            return;
        }

        // Handle static assets
        if (url.pathname.startsWith('/_next/static/') ||
            url.pathname.startsWith('/static/') ||
            url.pathname.includes('.css') ||
            url.pathname.includes('.js') ||
            url.pathname.includes('.ico')) {

            event.respondWith(
                caches.match(request)
                    .then((cachedResponse) => {
                        if (cachedResponse) {
                            return cachedResponse;
                        }

                        return fetch(request)
                            .then((response) => {
                                // Cache successful responses
                                if (response.status === 200) {
                                    const responseClone = response.clone();
                                    caches.open(CACHE_NAME)
                                        .then((cache) => {
                                            cache.put(request, responseClone);
                                        });
                                }
                                return response;
                            });
                    })
            );
            return;
        }

        // Handle API requests
        if (url.pathname.startsWith('/api/')) {
            event.respondWith(
                fetch(request)
                    .then((response) => {
                        // For successful GET requests, cache the response
                        if (request.method === 'GET' && response.status === 200) {
                            const responseClone = response.clone();
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(request, responseClone);
                                });
                        }
                        return response;
                    })
                    .catch(() => {
                        // If offline and it's a GET request, try to serve from cache
                        if (request.method === 'GET') {
                            return caches.match(request);
                        }
                        // For other methods, return a custom offline response
                        return new Response(
                            JSON.stringify({ error: 'Offline mode: Request failed' }),
                            {
                                status: 503,
                                statusText: 'Service Unavailable',
                                headers: { 'Content-Type': 'application/json' }
                            }
                        );
                    })
            );
            return;
        }

        // Handle images and other media
        if (request.destination === 'image' ||
            url.pathname.includes('.png') ||
            url.pathname.includes('.jpg') ||
            url.pathname.includes('.jpeg') ||
            url.pathname.includes('.svg') ||
            url.pathname.includes('.webp')) {

            event.respondWith(
                caches.match(request)
                    .then((cachedResponse) => {
                        if (cachedResponse) {
                            return cachedResponse;
                        }

                        return fetch(request)
                            .then((response) => {
                                if (response.status === 200) {
                                    const responseClone = response.clone();
                                    caches.open(CACHE_NAME)
                                        .then((cache) => {
                                            cache.put(request, responseClone);
                                        });
                                }
                                return response;
                            })
                            .catch(() => {
                                // Return a fallback image if available
                                return caches.match('/images/offline-placeholder.png') ||
                                    new Response('', { status: 404 });
                            });
                    })
            );
            return;
        }

        // Handle game assets (audio, fonts, etc.)
        if (url.pathname.includes('.mp3') ||
            url.pathname.includes('.wav') ||
            url.pathname.includes('.woff') ||
            url.pathname.includes('.woff2') ||
            url.pathname.includes('.ttf')) {

            event.respondWith(
                caches.match(request)
                    .then((cachedResponse) => {
                        return cachedResponse || fetch(request)
                            .then((response) => {
                                if (response.status === 200) {
                                    const responseClone = response.clone();
                                    caches.open(CACHE_NAME)
                                        .then((cache) => {
                                            cache.put(request, responseClone);
                                        });
                                }
                                return response;
                            });
                    })
            );
            return;
        }
    }

    // For all other requests, try network first, then cache
    event.respondWith(
        fetch(request)
            .catch(() => {
                return caches.match(request);
            })
    );
});

// Handle background sync for game progress
self.addEventListener('sync', (event) => {
    console.log('Service Worker: Background sync triggered', event.tag);

    if (event.tag === 'game-progress-sync') {
        event.waitUntil(syncGameProgress());
    }
});

// Sync game progress when back online
async function syncGameProgress() {
    try {
        // Get stored progress from IndexedDB or localStorage
        const storedProgress = await getStoredGameProgress();

        if (storedProgress && storedProgress.length > 0) {
            console.log('Service Worker: Syncing game progress', storedProgress.length, 'entries');

            for (const progress of storedProgress) {
                try {
                    const response = await fetch('/api/sync-progress', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(progress),
                    });

                    if (response.ok) {
                        // Remove synced progress from local storage
                        await removeStoredProgress(progress.id);
                        console.log('Service Worker: Progress synced successfully', progress.id);
                    }
                } catch (error) {
                    console.error('Service Worker: Failed to sync progress', progress.id, error);
                }
            }
        }
    } catch (error) {
        console.error('Service Worker: Background sync failed', error);
    }
}

// Helper function to get stored game progress (placeholder)
async function getStoredGameProgress() {
    // In a real implementation, this would read from IndexedDB
    return [];
}

// Helper function to remove synced progress (placeholder)
async function removeStoredProgress(progressId) {
    // In a real implementation, this would remove from IndexedDB
    console.log('Removing synced progress:', progressId);
}

// Handle push notifications (future feature)
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        console.log('Service Worker: Push notification received', data);

        const options = {
            body: data.body || 'You have a new notification from CropSchool!',
            icon: '/icons/icon-192x192.png',
            badge: '/icons/badge-72x72.png',
            tag: data.tag || 'cropschool-notification',
            data: data.data || {},
            actions: [
                {
                    action: 'open',
                    title: 'Open CropSchool',
                },
                {
                    action: 'dismiss',
                    title: 'Dismiss',
                },
            ],
        };

        event.waitUntil(
            self.registration.showNotification(data.title || 'CropSchool', options)
        );
    }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notification clicked', event);

    event.notification.close();

    if (event.action === 'open' || !event.action) {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

console.log('Service Worker: Script loaded');
