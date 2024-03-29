
self.addEventListener('fetch', function(event) {
    const req = event.request;
    const url = new URL(req.url);
  
    event.respondWith(
      (async function() {
        try {
          if (url.origin === location.origin) {
            const cachedResponse = await cacheFirst(req);
            console.log("Fetch successful (from cache):", req.url);
            return cachedResponse;
          } else {
            const response = await networkFirst(req);
            console.log("Fetch successful (from network):", req.url);
            return response;
          }
        } catch (error) {
          console.error("Fetch failed:", error);
          // Handle errors gracefully here, e.g., return a cached response or display an error message
          // For now, let's just return a generic error response
          return new Response("Fetch failed. Please check your network connection.", {
            status: 500,
            statusText: "Internal Server Error"
          });
        }
      })()
    );
  });
  
  async function cacheFirst(req) {
    const cache = await caches.open("dynamic-pwa");
    const cachedResponse = await cache.match(req);
    if (cachedResponse) {
      return cachedResponse;
    }
  
    try {
      const response = await fetch(req);
      cache.put(req, response.clone());
      console.log("Fetch successful (from network, cached):", req.url);
      return response;
    } catch (error) {
      console.error("CacheFirst fetch failed:", req.url, error);
      throw error;
    }
  }
  
  async function networkFirst(req) {
    const cache = await caches.open("dynamic-pwa");
  
    try {
      const response = await fetch(req);
      cache.put(req, response.clone());
      return response;
    } catch (error) {
      const cachedResponse = await cache.match(req);
      if (cachedResponse) {
        console.log("Fetch successful (from cache):", req.url);
        return cachedResponse;
      }
  
      console.error("NetworkFirst fetch failed, no cached response:", req.url, error);
      throw error;
    }
  }
  
  self.addEventListener('sync', event => {
    if (event.tag == 'helloSync') {
      console.log("Hello this is message for user [sw.js]");
      // Handle sync event here
    }
  });
  
  self.addEventListener('push', event => {
    if (event && event.data) {
      var data = event.data.json();
      if (data.method === "pushMessage") {
        if ('showNotification' in self.registration) {
          event.waitUntil(self.registration.showNotification("This is the message for the user", {
            body: data.message
          }));
        } else {
          // Handle browsers that don't support `showNotification`
        }
      }
    }
  });
  