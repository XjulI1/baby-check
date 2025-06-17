<script setup lang="ts">
import { onMounted, ref } from 'vue'
import EventForm from '@/components/EventForm.vue'
import EventList from '@/components/EventList.vue'
import AppHeader from '@/components/AppHeader.vue'
import { useEventsStore } from '@/stores/events'

const eventStore = useEventsStore()
const isIOS = ref(false)
const showInstallHint = ref(false)

onMounted(() => {
  // Détecte si l'utilisateur est sur iOS
  isIOS.value = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream

  // Détermine si l'app est déjà installée sur l'écran d'accueil
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true

  // Affiche l'astuce d'installation uniquement sur iOS et si l'app n'est pas déjà installée
  showInstallHint.value = isIOS.value && !isStandalone
})
</script>

<template>
  <div class="home">
    <AppHeader />

    <!-- Message d'installation pour iOS -->
    <div v-if="showInstallHint" class="install-hint">
      <p>
        <strong>Installez cette application sur votre écran d'accueil</strong>
        <br />
        Appuyez sur <span class="icon">↑</span> puis sur "Sur l'écran d'accueil"
      </p>
    </div>

    <EventForm />
    <EventList />
  </div>
</template>

<style scoped>
.home {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #4a86e8;
  text-align: center;
  margin-bottom: 24px;
}

.install-hint {
  background-color: var(--surface-variant-color);
  border-left: 4px solid var(--primary-color);
  padding: 10px 15px;
  margin-bottom: 20px;
  border-radius: 4px;
  font-size: 0.9rem;
}

.install-hint p {
  margin: 0;
  color: var(--text-primary-color);
}

.install-hint .icon {
  display: inline-block;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  width: 20px;
  height: 20px;
  text-align: center;
  line-height: 20px;
}
</style>
