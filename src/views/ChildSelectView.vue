<script setup lang="ts">
import ChildSelector from '@/components/ChildSelector.vue'
</script>

<template>
  <div class="child-select-view">
    <h1>Baby Check</h1>
    <p class="app-description">Application de suivi quotidien des événements de bébé</p>

    <ChildSelector />
  </div>
</template>

<style scoped>
.child-select-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: var(--primary-color);
  text-align: center;
  margin-bottom: 10px;
}

.app-description {
  text-align: center;
  color: var(--text-secondary-color);
  margin-bottom: 30px;
}
</style>
