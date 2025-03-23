<script setup lang="ts">
import { computed } from 'vue'
import { useChildStore } from '@/stores/child'
import { useRouter } from 'vue-router'

const childStore = useChildStore()
const router = useRouter()

const currentChildName = computed(() => {
  if (!childStore.currentChild) return ''
  return `${childStore.currentChild.firstName} ${childStore.currentChild.lastName}.`
})

const switchChild = () => {
  router.push('/select-child')
}
</script>

<template>
  <header class="app-header">
    <h1>Suivi de Bébé</h1>

    <div v-if="childStore.currentChild" class="child-info">
      <span class="child-name">{{ currentChildName }}</span>
      <button @click="switchChild" class="switch-button">Changer</button>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  text-align: center;
  margin-bottom: 20px;
}

h1 {
  color: #4a86e8;
  margin-bottom: 10px;
}

.child-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.child-name {
  font-weight: bold;
  font-size: 1.1rem;
}

.switch-button {
  background-color: #f1f1f1;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 5px 10px;
  font-size: 0.9rem;
  cursor: pointer;
}

.switch-button:hover {
  background-color: #e5e5e5;
}
</style>
