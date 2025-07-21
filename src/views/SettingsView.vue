<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import type { EventType } from '@/types'
import { useEventVisibility } from '@/composables/useEventVisibility'
import { useCacheManagement } from '@/composables/useCacheManagement'
import { useVersionManagement } from '@/composables/useVersionManagement'
import { useBackgroundSync } from '@/composables/useBackgroundSync'

// Cache et version
const { clearCache, getCacheSize } = useCacheManagement()
const { getCurrentVersionInfo } = useVersionManagement()
const { pendingSyncCount, clearAllPendingSyncs } = useBackgroundSync()

const cacheSize = ref(0)
const isLoadingCache = ref(false)
const versionInfo = ref(getCurrentVersionInfo())

const loadCacheInfo = async () => {
  isLoadingCache.value = true
  try {
    cacheSize.value = await getCacheSize()
  } catch (error) {
    console.error('Erreur lors du chargement des informations de cache:', error)
  } finally {
    isLoadingCache.value = false
  }
}

const handleClearCache = async () => {
  if (confirm('Êtes-vous sûr de vouloir vider le cache ? Cela peut ralentir temporairement l\'application.')) {
    isLoadingCache.value = true
    try {
      await clearCache()
      await loadCacheInfo()
      alert('Cache vidé avec succès')
    } catch (error) {
      console.error('Erreur lors du vidage du cache:', error)
      alert('Erreur lors du vidage du cache')
    } finally {
      isLoadingCache.value = false
    }
  }
}

const handleClearPendingSyncs = async () => {
  if (confirm('Êtes-vous sûr de vouloir supprimer toutes les synchronisations en attente ?')) {
    await clearAllPendingSyncs()
    alert('Synchronisations en attente supprimées')
  }
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Types d'événements disponibles avec leurs icônes et labels
const eventTypes: { type: EventType; icon: string; label: string }[] = [
  { type: 'biberon', icon: '🍼', label: 'Biberon' },
  { type: 'allaitement', icon: '🤱', label: 'Allaitement' },
  { type: 'pipi', icon: '💧', label: 'Pipi' },
  { type: 'caca', icon: '💩', label: 'Caca' },
  { type: 'dodo', icon: '😴', label: 'Dodo' },
  { type: 'medicaments', icon: '💊', label: 'Médicaments' },
  { type: 'aliment', icon: '🍽️', label: 'Aliments' },
]

// État des types d'événements (true = visible, false = masqué)
const eventVisibility = ref<Record<EventType, boolean>>({
  pipi: true,
  caca: true,
  biberon: true,
  dodo: true,
  allaitement: true,
  medicaments: true,
  aliment: true,
})

const STORAGE_KEY = 'baby-check-hidden-events'

// Charger les préférences depuis le localStorage
const loadSettings = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const hiddenEvents = JSON.parse(saved) as EventType[]

      // Réinitialiser tous à visible
      eventTypes.forEach(({ type }) => {
        eventVisibility.value[type] = true
      })

      // Masquer les événements sauvegardés comme masqués
      hiddenEvents.forEach((type) => {
        if (eventVisibility.value.hasOwnProperty(type)) {
          eventVisibility.value[type] = false
        }
      })
    }
  } catch (error) {
    console.error('Erreur lors du chargement des paramètres:', error)
  }
}

// Sauvegarder les préférences dans le localStorage
const saveSettings = () => {
  try {
    const hiddenEvents = eventTypes
      .filter(({ type }) => !eventVisibility.value[type])
      .map(({ type }) => type)

    localStorage.setItem(STORAGE_KEY, JSON.stringify(hiddenEvents))

    useEventVisibility().refreshSettings()
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des paramètres:', error)
  }
}

// Basculer la visibilité d'un type d'événement
const toggleEventVisibility = (eventType: EventType) => {
  eventVisibility.value[eventType] = !eventVisibility.value[eventType]
  saveSettings()
}

// Réinitialiser tous les paramètres
const resetSettings = () => {
  eventTypes.forEach(({ type }) => {
    eventVisibility.value[type] = true
  })
  localStorage.removeItem(STORAGE_KEY)

  useEventVisibility().refreshSettings()
}

// Charger les paramètres au montage du composant
onMounted(() => {
  loadSettings()
  loadCacheInfo()
})
</script>

<template>
  <div class="settings">
    <AppHeader />

    <div class="settings-container">
      <div class="settings-section">
        <h2>Affichage des événements</h2>
        <p class="description">
          Sélectionnez les types d'événements que vous souhaitez voir dans l'application. Les types
          masqués n'apparaîtront pas dans les listes et statistiques.
        </p>

        <div class="event-types-list">
          <div v-for="{ type, icon, label } in eventTypes" :key="type" class="event-type-item">
            <div class="event-info">
              <span class="event-icon">{{ icon }}</span>
              <span class="event-label">{{ label }}</span>
            </div>

            <label class="toggle-switch">
              <input
                type="checkbox"
                :checked="eventVisibility[type]"
                @change="toggleEventVisibility(type)"
              />
              <span class="slider"></span>
            </label>
          </div>
        </div>

        <div class="settings-actions">
          <button @click="resetSettings" class="reset-button">🔄 Réinitialiser</button>
        </div>
      </div>

      <div class="settings-info">
        <h3>ℹ️ Informations</h3>
        <p>
          Les paramètres sont automatiquement sauvegardés dans votre navigateur. Ils seront
          conservés même après fermeture de l'application.
        </p>
      </div>

      <!-- Section Cache et Performance -->
      <div class="settings-section">
        <h2>Cache et Performance</h2>
        <p class="description">
          Gérez le cache de l'application pour optimiser les performances et l'espace de stockage.
        </p>

        <div class="cache-info">
          <div class="info-item">
            <span class="info-label">Taille du cache :</span>
            <span class="info-value">
              {{ isLoadingCache ? 'Calcul...' : formatBytes(cacheSize) }}
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">Synchronisations en attente :</span>
            <span class="info-value">{{ pendingSyncCount }}</span>
          </div>
        </div>

        <div class="cache-actions">
          <button @click="loadCacheInfo" class="action-button secondary" :disabled="isLoadingCache">
            🔄 Actualiser
          </button>
          <button @click="handleClearCache" class="action-button danger" :disabled="isLoadingCache">
            🗑️ Vider le cache
          </button>
          <button
            v-if="pendingSyncCount > 0"
            @click="handleClearPendingSyncs"
            class="action-button warning"
          >
            ⚠️ Supprimer les syncs
          </button>
        </div>
      </div>

      <!-- Section Version et Informations -->
      <div class="settings-section">
        <h2>Version et Informations</h2>
        <p class="description">
          Informations sur la version actuelle de l'application et ses fonctionnalités.
        </p>

        <div class="version-info">
          <div class="info-item">
            <span class="info-label">Version :</span>
            <span class="info-value">{{ versionInfo.version }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Build :</span>
            <span class="info-value">{{ new Date(versionInfo.buildTime).toLocaleDateString('fr-FR') }}</span>
          </div>
        </div>

        <div class="features-list">
          <h4>Fonctionnalités :</h4>
          <ul>
            <li v-for="feature in versionInfo.features" :key="feature">{{ feature }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: var(--primary-color);
  text-align: center;
  margin-bottom: 30px;
  font-size: 1.8rem;
}

.settings-container {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.settings-section {
  background-color: var(--surface-variant-color);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px var(--shadow-color);
}

h2 {
  color: var(--primary-color);
  margin-bottom: 10px;
  font-size: 1.3rem;
}

.description {
  color: var(--text-secondary-color);
  margin-bottom: 20px;
  line-height: 1.5;
}

.event-types-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.event-type-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: var(--surface-color);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.event-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.event-icon {
  font-size: 24px;
}

.event-label {
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--text-primary-color);
}

/* Toggle Switch Styles */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.3s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: '';
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--primary-color);
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.settings-actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.reset-button {
  background-color: var(--error-color, #ff4444);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.reset-button:hover {
  background-color: var(--error-hover-color, #cc3333);
}

.settings-info {
  background-color: var(--surface-variant-color);
  border-radius: 8px;
  padding: 15px;
  border-left: 4px solid var(--primary-color);
}

.settings-info h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: var(--primary-color);
}

.settings-info p {
  margin: 0;
  color: var(--text-secondary-color);
  line-height: 1.4;
}

/* Styles pour les sections Cache et Version */
.cache-info,
.version-info {
  background-color: var(--surface-variant-color);
  border-radius: 6px;
  padding: 15px;
  margin: 15px 0;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  font-weight: 500;
  color: var(--text-primary-color);
}

.info-value {
  color: var(--text-secondary-color);
  font-family: monospace;
}

.cache-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 15px;
}

.action-button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.action-button.secondary {
  background-color: var(--surface-variant-color);
  color: var(--text-primary-color);
  border: 1px solid var(--border-color);
}

.action-button.secondary:hover:not(:disabled) {
  background-color: var(--primary-color);
  color: white;
}

.action-button.danger {
  background-color: #ff6b6b;
  color: white;
}

.action-button.danger:hover:not(:disabled) {
  background-color: #ff5252;
}

.action-button.warning {
  background-color: #ffa726;
  color: white;
}

.action-button.warning:hover:not(:disabled) {
  background-color: #ff9800;
}

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.features-list {
  margin-top: 15px;
}

.features-list h4 {
  margin: 0 0 10px 0;
  color: var(--text-primary-color);
  font-size: 1rem;
}

.features-list ul {
  margin: 0;
  padding-left: 20px;
  color: var(--text-secondary-color);
}

.features-list li {
  margin-bottom: 5px;
  line-height: 1.4;
}

@media (max-width: 600px) {
  .settings {
    padding: 20px;
  }

  .event-type-item {
    padding: 12px;
  }

  .event-label {
    font-size: 1rem;
  }
}
</style>
