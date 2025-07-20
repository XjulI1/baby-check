<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useBackgroundSync } from '@/composables/useBackgroundSync'

const router = useRouter()
const route = useRoute()

const { pendingSyncCount, isSyncing, processPendingSyncs } = useBackgroundSync()

const currentPath = computed(() => route.path)

const navigateTo = (path: string) => {
  router.push(path)
}

const handleSyncClick = async () => {
  if (pendingSyncCount.value > 0) {
    await processPendingSyncs()
  }
}
</script>

<template>
  <nav class="app-navbar">
    <div class="nav-links">
      <button class="nav-link" :class="{ active: currentPath === '/' }" @click="navigateTo('/')">
        <span class="icon">📋</span>
        <span class="label">Journal</span>
      </button>

      <button
        class="nav-link"
        :class="{ active: currentPath === '/statistics' }"
        @click="navigateTo('/statistics')"
      >
        <span class="icon">📊</span>
        <span class="label">Statistiques</span>
      </button>

      <button
        class="nav-link"
        :class="{ active: currentPath === '/settings' }"
        @click="navigateTo('/settings')"
      >
        <span class="icon">⚙️</span>
      </button>

      <!-- Indicateur de synchronisation -->
      <button
        v-if="pendingSyncCount > 0"
        class="sync-indicator"
        :class="{ syncing: isSyncing }"
        @click="handleSyncClick"
        :title="`${pendingSyncCount} élément(s) en attente de synchronisation`"
      >
        <span class="sync-icon">{{ isSyncing ? '⏳' : '🔄' }}</span>
        <span class="sync-count">{{ pendingSyncCount }}</span>
      </button>
    </div>
  </nav>
</template>

<style scoped>
.app-navbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: var(--surface-color);
  box-shadow: 0 -2px 10px var(--shadow-color);
  z-index: 100;
  padding-bottom: 10px;
  padding-top: 5px;
}

.nav-links {
  display: flex;
  justify-content: space-around;
  max-width: 800px;
  margin: 0 auto;
  position: relative;
}

.nav-link {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  border: none;
  background: none;
  color: var(--text-secondary-color);
  font-size: 0.9rem;
  cursor: pointer;
  width: 40%;
  transition: color 0.2s;
}

.nav-link:nth-child(3) {
  width: 20%;
}

.nav-link.active {
  color: var(--primary-color);
  font-weight: bold;
}

.icon {
  font-size: 1.4rem;
  margin-right: 8px;
}

.sync-indicator {
  position: absolute;
  top: -10px;
  right: 20px;
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.2s;
}

.sync-indicator:hover {
  transform: scale(1.1);
}

.sync-indicator.syncing {
  background: #ffa726;
  animation: pulse 2s infinite;
}

.sync-count {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #333;
  color: white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
  font-weight: bold;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}
</style>
