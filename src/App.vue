<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppNavbar from './components/AppNavbar.vue'
import UpdateNotification from './components/UpdateNotification.vue'
import NetworkStatus from './components/NetworkStatus.vue'
</script>

<template>
  <div class="app-container">
    <NetworkStatus />
    <RouterView />
    <AppNavbar />
    <UpdateNotification />
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
