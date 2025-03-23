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
body {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 0;
  padding: 0;
  color: #2c3e50;
  background-color: #f9f9f9;
}

.app-container {
  padding-bottom: 70px; /* Espace pour la navigation en bas */
}

button {
  font-size: 14px;
}
</style>
