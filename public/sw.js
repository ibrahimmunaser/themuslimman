// Service Worker for Advanced Caching
// Implements intelligent caching strategies for different asset types

const CACHE_VERSION = "v1";
const CACHE_NAME = `seerah-${CACHE_VERSION}`;

// Cache strategies by asset type
const CACHE_STRATEGIES = {
  images: {
    name: `${CACHE_NAME}-images`,
    maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
    maxEntries: 200,
  },
  videos: {
    name: `${CACHE_NAME}-videos`,
    maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
    maxEntries: 50,
  },
  documents: {
    name: `${CACHE_NAME}-documents`,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    maxEntries: 100,
  },
  api: {
    name: `${CACHE_NAME}-api`,
    maxAge: 5 * 60 * 1000, // 5 minutes
    maxEntries: 50,
  },
};

// Assets to precache on install
const PRECACHE_URLS = [
  "/",
  "/manifest.json",
  "/offline",
];

/**
 * Determine cache strategy based on request URL
 */
function getCacheStrategy(url) {
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;
  
  // Images (WebP, PNG, JPG)
  if (/\.(webp|png|jpe?g|gif|svg)$/i.test(pathname)) {
    return CACHE_STRATEGIES.images;
  }
  
  // Videos
  if (/\.(mp4|webm)$/i.test(pathname)) {
    return CACHE_STRATEGIES.videos;
  }
  
  // Documents (PDF, audio)
  if (/\.(pdf|mp3|m4a)$/i.test(pathname)) {
    return CACHE_STRATEGIES.documents;
  }
  
  // API calls
  if (pathname.startsWith("/api/")) {
    return CACHE_STRATEGIES.api;
  }
  
  return null;
}

/**
 * Check if cached response is still valid
 */
function isCacheValid(cachedResponse, maxAge) {
  if (!cachedResponse) return false;
  
  const cachedDate = new Date(cachedResponse.headers.get("date"));
  const now = new Date();
  
  return (now - cachedDate) < maxAge;
}

/**
 * Cache with expiration
 */
async function cacheWithExpiration(cacheName, request, response, maxEntries) {
  const cache = await caches.open(cacheName);
  await cache.put(request, response.clone());
  
  // Limit cache size
  const keys = await cache.keys();
  if (keys.length > maxEntries) {
    // Remove oldest entries
    await cache.delete(keys[0]);
  }
  
  return response;
}

/**
 * Network-first strategy with cache fallback
 */
async function networkFirstStrategy(request, strategy) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      await cacheWithExpiration(
        strategy.name,
        request,
        networkResponse,
        strategy.maxEntries
      );
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === "navigate") {
      return caches.match("/offline");
    }
    
    throw error;
  }
}

/**
 * Cache-first strategy with network fallback
 */
async function cacheFirstStrategy(request, strategy) {
  const cachedResponse = await caches.match(request);
  
  // Return cached response if valid
  if (cachedResponse && isCacheValid(cachedResponse, strategy.maxAge)) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      await cacheWithExpiration(
        strategy.name,
        request,
        networkResponse,
        strategy.maxEntries
      );
    }
    
    return networkResponse;
  } catch (error) {
    // Return stale cache if available
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// ─── Service Worker Event Listeners ──────────────────────────────────────────

/**
 * Install event - precache critical assets
 */
self.addEventListener("install", (event) => {
  console.log("[SW] Installing...");
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Precaching critical assets");
      return cache.addAll(PRECACHE_URLS);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating...");
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith("seerah-") && name !== CACHE_NAME)
          .map((name) => {
            console.log("[SW] Deleting old cache:", name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

/**
 * Fetch event - apply caching strategies
 */
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = request.url;
  
  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }
  
  // Skip chrome extensions and other protocols
  if (!url.startsWith("http")) {
    return;
  }
  
  const strategy = getCacheStrategy(url);
  
  // Use appropriate strategy
  if (strategy) {
    if (strategy === CACHE_STRATEGIES.api) {
      // API: Network-first (fresh data preferred)
      event.respondWith(networkFirstStrategy(request, strategy));
    } else {
      // Media assets: Cache-first (speed preferred)
      event.respondWith(cacheFirstStrategy(request, strategy));
    }
  } else {
    // Default: Network-first for pages
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match(request);
      })
    );
  }
});

/**
 * Message event - handle cache clearing
 */
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "CLEAR_CACHE") {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => caches.delete(name))
        );
      }).then(() => {
        return self.clients.matchAll();
      }).then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: "CACHE_CLEARED" });
        });
      })
    );
  }
});
