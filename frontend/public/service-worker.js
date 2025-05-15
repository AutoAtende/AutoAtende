// Versão do cache - importante para atualizações
const CACHE_VERSION = 'autoatende-v2';

// Caches específicos por tipo de recurso
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const API_CACHE = `${CACHE_VERSION}-api`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;

// Configurações
const CONFIG = {
  debug: self.location.hostname === 'localhost',
  apiUrl: self.location.origin,
  fallbackPage: '/offline.html',
  timeoutDuration: 30000,
  maxRetries: 3
};

// Recursos estáticos para pré-cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/offline.css',
  '/static/js/main.bundle.js',
  '/static/css/main.css',
  '/assets/vector/logo.svg',
  '/assets/vector/logo-dark.svg',
  '/assets/vector/favicon.svg'
];

// Utilitários de log
const log = {
  info: (...args) => CONFIG.debug && console.log('[ServiceWorker]', ...args),
  error: (...args) => console.error('[ServiceWorker]', ...args)
};

// Cache helpers
const cacheHelper = {
  async put(cacheName, request, response) {
    if (!response || response.status !== 200) return;
    
    const cache = await caches.open(cacheName);
    await cache.put(request, response.clone());
  },

  async match(request) {
    return await caches.match(request);
  }
};

// API Request Handler com retry
class ApiRequestHandler {
  constructor(request, retries = CONFIG.maxRetries) {
    this.request = request;
    this.retries = retries;
    this.attempts = 0;
  }

  async fetch() {
    while (this.attempts < this.retries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.timeoutDuration);

        const response = await fetch(this.request.clone(), {
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        this.attempts++;
        if (this.attempts === this.retries) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * this.attempts));
      }
    }
  }
}

// Handlers específicos por tipo de requisição
const handlers = {
  async apiRequest(request) {
    try {
      // Tenta cache primeiro
      const cachedResponse = await cacheHelper.match(request);
      
      // Inicia busca na rede
      const networkPromise = new ApiRequestHandler(request).fetch()
        .then(async response => {
          if (response.ok) {
            await cacheHelper.put(API_CACHE, request, response.clone());
          }
          return response;
        })
        .catch(error => {
          log.error('API fetch failed:', error);
          return cachedResponse || Response.error();
        });

      // Retorna cache se disponível ou aguarda rede
      return cachedResponse || networkPromise;
    } catch (error) {
      log.error('API request handler error:', error);
      return Response.error();
    }
  },

  async staticRequest(request) {
    try {
      const cachedResponse = await cacheHelper.match(request);
      if (cachedResponse) return cachedResponse;

      const response = await fetch(request);
      if (response.ok) {
        await cacheHelper.put(STATIC_CACHE, request, response.clone());
      }
      return response;
    } catch (error) {
      log.error('Static request handler error:', error);
      return caches.match(CONFIG.fallbackPage);
    }
  }
};

// Event Listeners
self.addEventListener('install', event => {
  log.info('Installing Service Worker');
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE)
        .then(cache => cache.addAll(STATIC_ASSETS)),
      self.skipWaiting()
    ])
  );
});

self.addEventListener('activate', event => {
  log.info('Activating Service Worker');
  
  event.waitUntil(
    Promise.all([
      // Limpa caches antigos
      caches.keys().then(keys => 
        Promise.all(
          keys.map(key => {
            if (!key.includes(CACHE_VERSION)) {
              return caches.delete(key);
            }
          })
        )
      ),
      // Assume controle imediatamente
      self.clients.claim()
    ])
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;

  // Ignora requisições não GET
  if (request.method !== 'GET') return;

  // Define estratégia baseada no tipo de requisição
  const handler = request.url.startsWith(CONFIG.apiUrl) 
    ? handlers.apiRequest
    : handlers.staticRequest;

  event.respondWith(handler(request));
});

// Gerenciamento de mensagens do cliente
self.addEventListener('message', event => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Sincronização em background
self.addEventListener('sync', event => {
  if (event.tag === 'apiSync') {
    event.waitUntil(syncFailedRequests());
  }
});

// Função para sincronizar requisições falhas
async function syncFailedRequests() {
  try {
    const failedRequests = await getFailedRequestsFromIndexedDB();
    await Promise.all(
      failedRequests.map(async request => {
        try {
          const response = await new ApiRequestHandler(request, 5).fetch();
          if (response.ok) {
            await removeFailedRequestFromIndexedDB(request);
          }
        } catch (error) {
          log.error('Sync failed for request:', request, error);
        }
      })
    );
  } catch (error) {
    log.error('Failed to sync requests:', error);
  }
}