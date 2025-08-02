<script setup lang="ts">
import { ref } from 'vue'
import type { BabyEvent } from '@/types'
import EventForm from './EventForm.vue'

const props = defineProps<{
  event: BabyEvent | null
  show: boolean
}>()

const emit = defineEmits<{
  close: []
  updated: []
}>()

const handleEventUpdated = () => {
  emit('updated')
  emit('close')
}

const handleCancel = () => {
  emit('close')
}

const closeModal = () => {
  emit('close')
}
</script>

<template>
  <Transition name="modal">
    <div v-if="show" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <button class="close-button" @click="closeModal">×</button>
        </div>

        <div class="modal-body">
          <EventForm
            :editing-event="event"
            :is-edit-mode="true"
            @event-updated="handleEventUpdated"
            @cancel="handleCancel"
          />
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: var(--surface-color);
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: flex-end;
  padding: 16px 20px 0 20px;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--text-secondary-color);
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  color: var(--text-primary-color);
}

.modal-body {
  padding: 0 20px 20px;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
