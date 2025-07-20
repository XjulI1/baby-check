<template>
  <Transition name="fade">
    <div v-if="showUpdateNotification" class="update-notification">
      <div class="update-content">
        <h3>{{ updateTitle }}</h3>
        <p>{{ updateMessage }}</p>

        <div v-if="updateNotes.length > 0" class="update-notes">
          <h4>Nouveautés :</h4>
          <ul>
            <li v-for="note in updateNotes" :key="note">{{ note }}</li>
          </ul>
        </div>

        <div class="update-actions">
          <button @click="dismissUpdate" class="btn-secondary" :disabled="isProcessingUpdate">
            Plus tard
          </button>
          <button @click="updateApp" class="btn-primary" :disabled="isProcessingUpdate">
            <span v-if="isProcessingUpdate">Mise à jour...</span>
            <span v-else>Mettre à jour</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRegisterSW } from 'virtual:pwa-register/vue'
import { useVersionManagement } from '@/composables/useVersionManagement'

const showUpdateNotification = ref(false)

const {
  isFirstInstall,
  hasUpdate: hasVersionUpdate,
  updateNotes,
  isProcessingUpdate,
  processUpdate
} = useVersionManagement()

const {
  needRefresh,
  updateServiceWorker,
} = useRegisterSW({
  onRegistered(swRegistration: ServiceWorkerRegistration | undefined) {
    console.log('Service Worker enregistré:', swRegistration)
  },
  onRegisterError(error: any) {
    console.error('Erreur lors de l\'enregistrement du Service Worker:', error)
  },
  onNeedRefresh() {
    showUpdateNotification.value = true
  },
  onOfflineReady() {
    console.log('Application prête pour le mode hors ligne')
  },
})

const updateTitle = computed(() => {
  if (isFirstInstall.value) {
    return 'Bienvenue !'
  }
  if (needRefresh.value) {
    return 'Nouvelle version disponible'
  }
  if (hasVersionUpdate.value) {
    return 'Application mise à jour'
  }
  return 'Mise à jour'
})

const updateMessage = computed(() => {
  if (isFirstInstall.value) {
    return 'Baby Check a été installé avec succès. L\'application est prête à être utilisée.'
  }
  if (needRefresh.value) {
    return 'Une nouvelle version de l\'application est prête à être installée.'
  }
  if (hasVersionUpdate.value) {
    return 'L\'application a été mise à jour avec de nouvelles fonctionnalités.'
  }
  return 'Une mise à jour est disponible.'
})

const updateApp = async () => {
  try {
    isProcessingUpdate.value = true

    if (needRefresh.value) {
      await updateServiceWorker(true)
    }

    if (hasVersionUpdate.value) {
      await processUpdate()
    }

    showUpdateNotification.value = false
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error)
  } finally {
    isProcessingUpdate.value = false
  }
}

const dismissUpdate = () => {
  showUpdateNotification.value = false
}

// Afficher la notification pour les premières installations ou mises à jour de version
watch([isFirstInstall, hasVersionUpdate], ([isFirst, hasUpdate]) => {
  if (isFirst || hasUpdate) {
    showUpdateNotification.value = true
  }
})

onMounted(() => {
  // Vérifier les mises à jour toutes les 5 minutes
  setInterval(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration) {
          registration.update()
        }
      })
    }
  }, 5 * 60 * 1000) // 5 minutes
})
</script>

<style scoped>
.update-notification {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.update-content {
  background: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  text-align: center;
  max-height: 80vh;
  overflow-y: auto;
}

.update-content h3 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 1.2rem;
  font-weight: 600;
}

.update-content p {
  margin: 0 0 20px 0;
  color: #666;
  line-height: 1.5;
}

.update-notes {
  margin: 16px 0;
  text-align: left;
}

.update-notes h4 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 1rem;
  font-weight: 500;
}

.update-notes ul {
  margin: 0;
  padding-left: 20px;
  color: #666;
}

.update-notes li {
  margin-bottom: 4px;
  line-height: 1.4;
}

.update-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 20px;
}

.btn-primary,
.btn-secondary {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 100px;
}

.btn-primary {
  background: #4a86e8;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #3d7ae0;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f5f5f5;
  color: #333;
}

.btn-secondary:hover:not(:disabled) {
  background: #e9e9e9;
}

.btn-secondary:disabled {
  background: #f9f9f9;
  color: #999;
  cursor: not-allowed;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
