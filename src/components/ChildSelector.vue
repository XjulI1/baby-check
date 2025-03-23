<script setup lang="ts">
import { ref, computed } from 'vue'
import { useChildStore } from '@/stores/child'
import { useEventsStore } from '@/stores/events'
import { useRouter } from 'vue-router'

const childStore = useChildStore()
const eventsStore = useEventsStore()
const router = useRouter()

const newFirstName = ref('')
const newLastName = ref('')
const showAddChildForm = ref(false)
const isCreating = ref(false)
const error = ref('')

const formattedChildren = computed(() => {
  return childStore.children.map((child) => ({
    ...child,
    displayName: `${child.firstName} ${child.lastName}.`,
  }))
})

const createChild = async () => {
  error.value = ''

  if (!newFirstName.value.trim()) {
    error.value = 'Le prénom est requis'
    return
  }

  if (!newLastName.value.trim()) {
    error.value = 'La première lettre du nom est requise'
    return
  }

  isCreating.value = true

  try {
    // Création ou récupération d'un enfant existant
    const child = childStore.addChild(newFirstName.value.trim(), newLastName.value.trim().charAt(0))

    // Sélectionner automatiquement l'enfant
    childStore.selectChild(child.id)

    // Réinitialiser le formulaire
    newFirstName.value = ''
    newLastName.value = ''
    showAddChildForm.value = false

    // Recharger les événements pour cet enfant
    await eventsStore.loadEvents()

    // Rediriger vers la page d'accueil
    router.push('/')
  } catch (err) {
    error.value = "Erreur lors de la création de l'enfant"
    console.error(err)
  } finally {
    isCreating.value = false
  }
}

const selectChild = async (childId: string) => {
  childStore.selectChild(childId)
  await eventsStore.loadEvents()
  router.push('/')
}

const toggleAddChildForm = () => {
  showAddChildForm.value = !showAddChildForm.value
  if (showAddChildForm.value) {
    error.value = ''
  }
}
</script>

<template>
  <div class="child-selector">
    <h2>Sélectionner un enfant</h2>

    <div v-if="formattedChildren.length > 0" class="children-list">
      <button
        v-for="child in formattedChildren"
        :key="child.id"
        @click="selectChild(child.id)"
        class="child-button"
        :class="{ active: childStore.currentChildId === child.id }"
      >
        {{ child.displayName }}
      </button>
    </div>

    <div v-else class="empty-state">Aucun enfant enregistré</div>

    <div v-if="!showAddChildForm" class="add-child">
      <button @click="toggleAddChildForm" class="add-button">+ Ajouter un enfant</button>
    </div>

    <div v-else class="add-child-form">
      <h3>Ajouter un nouvel enfant</h3>

      <div class="form-group">
        <label for="firstName">Prénom</label>
        <input type="text" id="firstName" v-model="newFirstName" placeholder="Prénom" />
      </div>

      <div class="form-group">
        <label for="lastName">Première lettre du nom</label>
        <input
          type="text"
          id="lastName"
          v-model="newLastName"
          placeholder="Première lettre"
          maxlength="1"
        />
      </div>

      <div class="error" v-if="error">{{ error }}</div>

      <div class="form-actions">
        <button @click="toggleAddChildForm" class="cancel-button" :disabled="isCreating">
          Annuler
        </button>
        <button @click="createChild" class="submit-button" :disabled="isCreating">
          {{ isCreating ? 'Création...' : 'Ajouter' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.child-selector {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #4a86e8;
}

h3 {
  margin-bottom: 20px;
  font-size: 1.1rem;
  color: #555;
}

.children-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.child-button {
  padding: 15px;
  text-align: left;
  background-color: #f5f5f5;
  border: 2px solid #eee;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
}

.child-button:hover,
.child-button:focus {
  background-color: #eef5ff;
  border-color: #4a86e8;
}

.child-button.active {
  background-color: #eef5ff;
  border-color: #4a86e8;
  font-weight: bold;
}

.empty-state {
  text-align: center;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  color: #666;
  font-style: italic;
  margin-bottom: 20px;
}

.add-button {
  width: 100%;
  padding: 10px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
}

.add-button:hover {
  background-color: #45a049;
}

.add-child-form {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  margin-top: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.cancel-button {
  padding: 10px 20px;
  background-color: #f1f1f1;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.submit-button {
  padding: 10px 20px;
  background-color: #4a86e8;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.submit-button:hover {
  background-color: #3a76d8;
}

.submit-button:disabled,
.cancel-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error {
  color: #f44336;
  margin: 10px 0;
  font-size: 0.9rem;
}
</style>
