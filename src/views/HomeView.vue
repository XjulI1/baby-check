<script setup lang="ts">
import { onMounted } from 'vue'
import EventForm from '@/components/EventForm.vue'
import EventList from '@/components/EventList.vue'
import { useEventsStore } from '@/stores/events'

const eventStore = useEventsStore()

onMounted(() => {
  eventStore.loadEvents()
})
</script>

<template>
  <div class="home">
    <h1>Suivi de Bébé</h1>
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
</style>
