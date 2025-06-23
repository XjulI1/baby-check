<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const currentPath = computed(() => route.path)

const navigateTo = (path: string) => {
  router.push(path)
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
</style>
