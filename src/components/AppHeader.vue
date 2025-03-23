<script setup lang="ts">
import { computed } from 'vue'
import { useChildStore } from '@/stores/child'
import { useRouter } from 'vue-router'

const childStore = useChildStore()
const router = useRouter()

const switchChild = () => {
  router.push('/select-child')
}

const pageTitle = computed(() => {
  if (childStore.currentChild) {
    return `Suivi de ${childStore.currentChild.firstName}`
  }
  return 'Suivi de Bébé'
})
</script>

<template>
  <header class="app-header">
    <h1>{{ pageTitle }}</h1>

    <div v-if="childStore.currentChild" class="child-info">
      <button @click="switchChild" class="switch-button">👶</button>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  text-align: center;
  margin-bottom: 20px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

h1 {
  color: #4a86e8;
  margin-bottom: 10px;
}

.child-info {
  position: absolute;
  top: 20%;
  right: 0;
  transform: translateY(-20%);
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
  font-size: 1.2rem;
  cursor: pointer;
}

.switch-button:hover {
  background-color: #e5e5e5;
}
</style>
