interface PendingSync {
  id: string
  type: 'CREATE' | 'UPDATE' | 'DELETE'
  endpoint: string
  data?: any
  timestamp: number
}

export class BackgroundSyncService {
  private readonly STORAGE_KEY = 'baby-check-pending-sync'
  private readonly SYNC_TAG = 'baby-check-background-sync'

  async addPendingSync(sync: Omit<PendingSync, 'id' | 'timestamp'>): Promise<void> {
    const pendingSync: PendingSync = {
      ...sync,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    }

    try {
      const existing = this.getPendingSyncs()
      existing.push(pendingSync)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existing))

      // Essayer de synchroniser immédiatement si en ligne
      if (navigator.onLine) {
        await this.processPendingSyncs()
      } else {
        // Enregistrer pour synchronisation en arrière-plan
        await this.registerBackgroundSync()
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout de la synchronisation en attente:", error)
    }
  }

  getPendingSyncs(): PendingSync[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Erreur lors de la lecture des synchronisations en attente:', error)
      return []
    }
  }

  async processPendingSyncs(): Promise<void> {
    const pending = this.getPendingSyncs()
    if (pending.length === 0) return

    console.log(`Traitement de ${pending.length} synchronisations en attente`)

    const processed: string[] = []

    for (const sync of pending) {
      try {
        await this.executeSync(sync)
        processed.push(sync.id)
        console.log(`Synchronisation ${sync.id} réussie`)
      } catch (error) {
        console.error(`Erreur lors de la synchronisation ${sync.id}:`, error)
        // On garde les syncs échouées pour retry plus tard
      }
    }

    // Supprimer les syncs réussies
    if (processed.length > 0) {
      const remaining = pending.filter((sync) => !processed.includes(sync.id))
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(remaining))
    }
  }

  private async executeSync(sync: PendingSync): Promise<void> {
    const { endpoint, type, data } = sync

    const options: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
    }

    switch (type) {
      case 'CREATE':
        options.method = 'POST'
        options.body = JSON.stringify(data)
        break
      case 'UPDATE':
        options.method = 'PUT'
        options.body = JSON.stringify(data)
        break
      case 'DELETE':
        options.method = 'DELETE'
        break
    }

    const response = await fetch(endpoint, options)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
  }

  private async registerBackgroundSync(): Promise<void> {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready
        if ('sync' in registration) {
          await (registration as any).sync.register(this.SYNC_TAG)
          console.log('Synchronisation en arrière-plan enregistrée')
        }
      } catch (error) {
        console.error(
          "Erreur lors de l'enregistrement de la synchronisation en arrière-plan:",
          error,
        )
      }
    }
  }

  async clearPendingSyncs(): Promise<void> {
    localStorage.removeItem(this.STORAGE_KEY)
  }

  getPendingSyncCount(): number {
    return this.getPendingSyncs().length
  }

  // Méthode pour nettoyer les anciennes synchronisations (plus de 7 jours)
  cleanOldSyncs(): void {
    const pending = this.getPendingSyncs()
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000

    const filtered = pending.filter((sync) => sync.timestamp > weekAgo)

    if (filtered.length !== pending.length) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered))
      console.log(`${pending.length - filtered.length} anciennes synchronisations supprimées`)
    }
  }
}

export const backgroundSyncService = new BackgroundSyncService()

// Nettoyer les anciennes synchronisations au démarrage
backgroundSyncService.cleanOldSyncs()

// Essayer de synchroniser quand on redevient en ligne
window.addEventListener('online', () => {
  backgroundSyncService.processPendingSyncs()
})
