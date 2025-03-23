<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppNavbar from './components/AppNavbar.vue'
</script>

<template>
  <div class="app-container">
    <RouterView />
    <AppNavbar />
  </div>
</template>

<style>
.app-container {
  padding-bottom: 70px; /* Espace pour la navigation en bas */
}

button {
  font-size: 14px;
}
</style>
