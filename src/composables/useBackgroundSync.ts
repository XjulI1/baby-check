import { ref, onMounted } from 'vue'
import { backgroundSyncService } from '@/services/backgroundSync'

export function useBackgroundSync() {
  const pendingSyncCount = ref(0)
  const isSyncing = ref(false)

  const updatePendingCount = () => {
    pendingSyncCount.value = backgroundSyncService.getPendingSyncCount()
  }

  const addToSyncQueue = async (
    type: 'CREATE' | 'UPDATE' | 'DELETE',
    endpoint: string,
    data?: any
  ) => {
    await backgroundSyncService.addPendingSync({
      type,
      endpoint,
      data
    })
    updatePendingCount()
  }

  const processPendingSyncs = async () => {
    if (isSyncing.value) return

    isSyncing.value = true
    try {
      await backgroundSyncService.processPendingSyncs()
      updatePendingCount()
    } catch (error) {
      console.error('Erreur lors du traitement des synchronisations:', error)
    } finally {
      isSyncing.value = false
    }
  }

  const clearAllPendingSyncs = async () => {
    await backgroundSyncService.clearPendingSyncs()
    updatePendingCount()
  }

  onMounted(() => {
    updatePendingCount()

    // Écouter les événements de connectivité
    window.addEventListener('online', processPendingSyncs)

    // Mettre à jour le compteur périodiquement
    const interval = setInterval(updatePendingCount, 10000) // Toutes les 10 secondes

    // Nettoyer à la destruction
    return () => {
      window.removeEventListener('online', processPendingSyncs)
      clearInterval(interval)
    }
  })

  return {
    pendingSyncCount,
    isSyncing,
    addToSyncQueue,
    processPendingSyncs,
    clearAllPendingSyncs
  }
}
