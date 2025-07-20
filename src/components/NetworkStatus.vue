<template>
  <Transition name="slide-down">
    <div v-if="!isOnline" class="offline-banner">
      <div class="offline-content">
        <span class="offline-icon">📱</span>
        <span class="offline-text">Mode hors ligne - Vos données seront synchronisées quand vous serez connecté</span>
      </div>
    </div>
  </Transition>

  <Transition name="slide-down">
    <div v-if="isOnline && isSlowConnection" class="slow-connection-banner">
      <div class="slow-connection-content">
        <span class="slow-icon">🐌</span>
        <span class="slow-text">Connexion lente détectée</span>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useNetworkStatus } from '@/composables/useCacheManagement'

const { isOnline, isSlowConnection } = useNetworkStatus()
</script>

<style scoped>
.offline-banner,
.slow-connection-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 8px 16px;
  text-align: center;
  font-size: 0.9rem;
}

.offline-banner {
  background: #ff6b6b;
  color: white;
}

.slow-connection-banner {
  background: #ffa726;
  color: white;
}

.offline-content,
.slow-connection-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.offline-icon,
.slow-icon {
  font-size: 1.1rem;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.3s ease-out;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
}
</style>
