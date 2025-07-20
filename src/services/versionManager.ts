import versionInfos from "@/versionsInfo.json"
import { version } from '@/../package.json'

interface VersionInfo {
  version: string
  buildTime: string
  features: string[]
}

export class VersionManager {
  private readonly STORAGE_KEY = 'baby-check-version'
  private readonly CURRENT_VERSION = version || '1.1.0'
  private readonly BUILD_TIME = import.meta.env.VITE_BUILD_TIME || new Date().toISOString()

  getCurrentVersion(): VersionInfo {
    return {
      version: this.CURRENT_VERSION,
      buildTime: this.BUILD_TIME,
      features: versionInfos.find(info => info.version === this.CURRENT_VERSION)?.features || []
    }
  }

  getStoredVersion(): VersionInfo | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.error('Erreur lors de la lecture de la version stockée:', error)
      return null
    }
  }

  saveCurrentVersion(): void {
    try {
      const versionInfo = this.getCurrentVersion()
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(versionInfo))
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la version:', error)
    }
  }

  checkForUpdate(): { hasUpdate: boolean; currentVersion: string; storedVersion: string | null } {
    const current = this.getCurrentVersion()
    const stored = this.getStoredVersion()

    return {
      hasUpdate: !stored || stored.version !== current.version,
      currentVersion: current.version,
      storedVersion: stored?.version || null
    }
  }

  async performMigration(fromVersion: string | null, toVersion: string): Promise<boolean> {
    try {
      console.log(`Migration de ${fromVersion || 'nouvelle installation'} vers ${toVersion}`)

      // Ici, vous pouvez ajouter des logiques de migration spécifiques
      // Par exemple, migration de données localStorage, indexedDB, etc.

      if (!fromVersion) {
        // Première installation
        await this.firstInstallSetup()
      } else {
        // Mise à jour
        await this.updateSetup(fromVersion, toVersion)
      }

      this.saveCurrentVersion()
      return true
    } catch (error) {
      console.error('Erreur lors de la migration:', error)
      return false
    }
  }

  private async firstInstallSetup(): Promise<void> {
    console.log('Configuration pour première installation')

    // Précharger les ressources critiques
    if ('caches' in window) {
      try {
        const cache = await caches.open('critical-resources-v1')
        await cache.addAll([
          '/',
          '/manifest.json',
          '/icons/icon-192x192.png'
        ])
      } catch (error) {
        console.warn('Impossible de précharger les ressources:', error)
      }
    }
  }

  private async updateSetup(fromVersion: string, toVersion: string): Promise<void> {
    console.log(`Mise à jour de ${fromVersion} vers ${toVersion}`)

    // Nettoyer les anciens caches si nécessaire
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys()
        const oldCaches = cacheNames.filter(name =>
          name.includes('critical-resources') && !name.includes('v1')
        )

        await Promise.all(oldCaches.map(cacheName => caches.delete(cacheName)))
        console.log('Anciens caches supprimés:', oldCaches)
      } catch (error) {
        console.warn('Erreur lors du nettoyage des caches:', error)
      }
    }
  }

  getUpdateNotes(fromVersion: string | null, toVersion: string): string[] {
    // Ici vous pouvez retourner les notes de mise à jour basées sur les versions
    if (!fromVersion) {
      return [
        'Bienvenue dans Baby Check !',
        'Application installée avec succès',
      ]
    }

    return versionInfos
      .filter(info => info.version === toVersion)
      .flatMap(info => info.features)
      .filter(feature => !fromVersion || !versionInfos.some(info => info.version === fromVersion && info.features.includes(feature)))
  }
}

export const versionManager = new VersionManager()
