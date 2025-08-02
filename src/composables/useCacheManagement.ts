import { ref, onMounted, onUnmounted } from 'vue'

export function useNetworkStatus() {
  const isOnline = ref(navigator.onLine)
  const isSlowConnection = ref(false)

  const updateOnlineStatus = () => {
    isOnline.value = navigator.onLine
  }

  const checkConnectionSpeed = () => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      if (connection) {
        // Considérer comme lent si : 2G, slow-2g, ou effectiveType '2g'
        isSlowConnection.value =
          connection.effectiveType === '2g' ||
          connection.effectiveType === 'slow-2g' ||
          connection.downlink < 1.5
      }
    }
  }

  onMounted(() => {
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      if (connection) {
        connection.addEventListener('change', checkConnectionSpeed)
        checkConnectionSpeed()
      }
    }
  })

  onUnmounted(() => {
    window.removeEventListener('online', updateOnlineStatus)
    window.removeEventListener('offline', updateOnlineStatus)

    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      if (connection) {
        connection.removeEventListener('change', checkConnectionSpeed)
      }
    }
  })

  return {
    isOnline,
    isSlowConnection,
  }
}

export function useCacheManagement() {
  const clearCache = async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)))
        console.log('Cache vidé avec succès')
        return true
      } catch (error) {
        console.error('Erreur lors du vidage du cache:', error)
        return false
      }
    }
    return false
  }

  const getCacheSize = async (): Promise<number> => {
    if ('caches' in window && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate()
        return estimate.usage || 0
      } catch (error) {
        console.error('Erreur lors du calcul de la taille du cache:', error)
        return 0
      }
    }
    return 0
  }

  const preloadCriticalResources = async (urls: string[]) => {
    if ('caches' in window) {
      try {
        const cache = await caches.open('critical-resources')
        await Promise.all(
          urls.map((url) =>
            cache
              .add(url)
              .catch((error) => console.warn(`Impossible de précharger ${url}:`, error)),
          ),
        )
        console.log('Ressources critiques préchargées')
      } catch (error) {
        console.error('Erreur lors du préchargement:', error)
      }
    }
  }

  return {
    clearCache,
    getCacheSize,
    preloadCriticalResources,
  }
}
