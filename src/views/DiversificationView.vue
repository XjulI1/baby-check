<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useChildStore } from '@/stores/child'
import { useFoodsStore } from '@/stores/foods'
import { useEventsStore } from '@/stores/events'
import type { FoodCategory, FoodReaction } from '@/types'

const childStore = useChildStore()
const foodsStore = useFoodsStore()
const eventsStore = useEventsStore()

const selectedCategory = ref<FoodCategory>('fruits')
const showAddForm = ref(false)
const newFoodName = ref('')
const selectedReaction = ref<FoodReaction>('aime')
const searchQuery = ref('')

const categories = [
  { key: 'fruits' as FoodCategory, label: 'Fruits', icon: '🍎' },
  { key: 'legumes' as FoodCategory, label: 'Légumes', icon: '🥕' },
  { key: 'viandes' as FoodCategory, label: 'Viandes', icon: '🥩' },
  { key: 'poissons' as FoodCategory, label: 'Poissons', icon: '🐟' },
  { key: 'cereales' as FoodCategory, label: 'Céréales', icon: '🌾' },
  { key: 'laitiers' as FoodCategory, label: 'Laitiers', icon: '🥛' },
  { key: 'autres' as FoodCategory, label: 'Autres', icon: '🥄' },
]

const reactions = [
  { key: 'aime' as FoodReaction, label: 'Aime', icon: '😋', color: '#4CAF50' },
  { key: 'neutre' as FoodReaction, label: 'Neutre', icon: '😐', color: '#FF9800' },
  { key: 'naime_pas' as FoodReaction, label: "N'aime pas", icon: '😤', color: '#f44336' },
  { key: 'allergie' as FoodReaction, label: 'Allergie', icon: '⚠️', color: '#D32F2F' },
]

const currentChildFoods = computed(() => {
  if (!childStore.currentChild) return []
  return foodsStore.getFoodsByChildAndCategory(childStore.currentChild.id, selectedCategory.value)
})

const predefinedFoods = computed(() => {
  return foodsStore.getPredefinedFoodsByCategory(selectedCategory.value)
})

const filteredPredefinedFoods = computed(() => {
  if (!searchQuery.value) return predefinedFoods.value
  return predefinedFoods.value.filter((food) =>
    food.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

const stats = computed(() => {
  if (!childStore.currentChild) return null
  return foodsStore.getStatsForChild(childStore.currentChild.id)
})

const getReactionData = (reaction: FoodReaction) => {
  return reactions.find((r) => r.key === reaction)
}

const addFood = async (foodName: string, reaction: FoodReaction = selectedReaction.value) => {
  if (!childStore.currentChild || !foodName.trim()) return

  await foodsStore.addOrUpdateFood(
    foodName.trim(),
    selectedCategory.value,
    reaction,
    childStore.currentChild.id,
  )

  // Ajouter aussi un événement dans le journal
  eventsStore.addEvent(
    'aliment',
    undefined, // quantity
    `Premier goût: ${foodName.trim()}`, // notes
    undefined, // timestamp
    undefined, // breastLeft
    undefined, // breastRight
    undefined, // medicationName
    undefined, // medicationList
    foodName.trim(), // foodItem
    selectedCategory.value, // foodCategory
    reaction, // reaction
  )

  newFoodName.value = ''
  showAddForm.value = false
}

const addCustomFood = async () => {
  await addFood(newFoodName.value)
}

const removeFood = async (foodName: string) => {
  if (!childStore.currentChild) return
  await foodsStore.removeFood(foodName, childStore.currentChild.id)
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

const cancelAddCustomFood = () => {
  showAddForm.value = false
  newFoodName.value = ''
}

onMounted(async () => {
  // Charger les aliments depuis l'API
  if (childStore.currentChild) {
    await foodsStore.loadFoods(childStore.currentChild.id)
  }
})
</script>

<template>
  <div class="diversification-view">
    <div class="header">
      <h1>🍽️ Diversification alimentaire</h1>
      <p v-if="childStore.currentChild" class="child-name">
        {{ childStore.currentChild.firstName }} {{ childStore.currentChild.lastName }}.
      </p>
    </div>

    <!-- Statistiques globales -->
    <div v-if="stats" class="stats-summary">
      <div class="stat-card">
        <span class="stat-number">{{ stats.total }}</span>
        <span class="stat-label">Aliments découverts</span>
      </div>
      <div class="reactions-grid">
        <div v-for="reaction in reactions" :key="reaction.key" class="reaction-stat">
          <span class="reaction-icon">{{ reaction.icon }}</span>
          <span class="reaction-count">{{ stats.byReaction[reaction.key] }}</span>
        </div>
      </div>
    </div>

    <!-- Navigation par catégories -->
    <div class="categories-nav">
      <button
        v-for="category in categories"
        :key="category.key"
        class="category-btn"
        :class="{ active: selectedCategory === category.key }"
        @click="selectedCategory = category.key"
      >
        <span class="category-icon">{{ category.icon }}</span>
        <span class="category-label">{{ category.label }}</span>
        <span v-if="stats" class="category-count">{{ stats.byCategory[category.key] || 0 }}</span>
      </button>
    </div>

    <!-- Aliments découverts dans la catégorie -->
    <div class="discovered-foods">
      <h3>{{ categories.find((c) => c.key === selectedCategory)?.label }} découverts</h3>
      <div v-if="currentChildFoods.length > 0" class="foods-grid">
        <div v-for="food in currentChildFoods" :key="food.name" class="food-card discovered">
          <div class="food-header">
            <span class="food-name">{{ food.name }}</span>
            <button class="remove-btn" @click="removeFood(food.name)">×</button>
          </div>
          <div class="food-info">
            <div class="reaction" :style="{ color: getReactionData(food.last_reaction)?.color }">
              {{ getReactionData(food.last_reaction)?.icon }}
              {{ getReactionData(food.last_reaction)?.label }}
            </div>
            <div class="tasting-info">
              <small>Premier goût: {{ formatDate(food.first_tasted_date) }}</small>
              <small
                >{{ food.tasting_count }} fois goûté{{ food.tasting_count > 1 ? 's' : '' }}</small
              >
            </div>
          </div>
        </div>
      </div>
      <p v-else class="no-foods">
        Aucun
        {{ categories.find((c) => c.key === selectedCategory)?.label.toLowerCase() }} découvert pour
        le moment
      </p>
    </div>

    <!-- Aliments suggérés -->
    <div class="suggested-foods">
      <h3>{{ categories.find((c) => c.key === selectedCategory)?.label }} à découvrir</h3>

      <!-- Barre de recherche -->
      <div class="search-bar">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher un aliment..."
          class="search-input"
        />
      </div>

      <div class="foods-grid">
        <div
          v-for="food in filteredPredefinedFoods"
          :key="food"
          class="food-card suggested"
          :class="{
            'already-discovered': currentChildFoods.some((f) => f.name === food),
          }"
        >
          <span class="food-name">{{ food }}</span>
          <div v-if="!currentChildFoods.some((f) => f.name === food)" class="reaction-buttons">
            <button
              v-for="reaction in reactions"
              :key="reaction.key"
              class="reaction-btn"
              :style="{ backgroundColor: reaction.color }"
              @click="addFood(food, reaction.key)"
              :title="reaction.label"
            >
              {{ reaction.icon }}
            </button>
          </div>
          <div v-else class="already-tried">
            <span class="check-icon">✅</span>
            <small>Déjà goûté</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Bouton pour ajouter un aliment personnalisé -->
    <div class="add-custom">
      <button v-if="!showAddForm" class="add-custom-btn" @click="showAddForm = true">
        + Ajouter un aliment personnalisé
      </button>

      <div v-if="showAddForm" class="custom-form">
        <input
          v-model="newFoodName"
          type="text"
          placeholder="Nom de l'aliment"
          class="custom-input"
          @keyup.enter="addCustomFood"
        />
        <div class="reaction-selector">
          <label>Réaction:</label>
          <select v-model="selectedReaction" class="reaction-select">
            <option v-for="reaction in reactions" :key="reaction.key" :value="reaction.key">
              {{ reaction.icon }} {{ reaction.label }}
            </option>
          </select>
        </div>
        <div class="form-buttons">
          <button class="btn-primary" @click="addCustomFood">Ajouter</button>
          <button class="btn-secondary" @click="cancelAddCustomFood">Annuler</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.diversification-view {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  padding-bottom: 100px;
}

.header {
  text-align: center;
  margin-bottom: 20px;
}

.header h1 {
  margin: 0;
  color: var(--text-primary-color);
}

.child-name {
  color: var(--text-secondary-color);
  margin: 5px 0 0 0;
}

.stats-summary {
  background: var(--surface-color);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px var(--shadow-color);
}

.stat-card {
  text-align: center;
  margin-bottom: 15px;
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: bold;
  color: var(--primary-color);
}

.stat-label {
  color: var(--text-secondary-color);
  font-size: 0.9rem;
}

.reactions-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.reaction-stat {
  text-align: center;
  padding: 10px;
  background: var(--background-color);
  border-radius: 8px;
}

.reaction-icon {
  display: block;
  font-size: 1.2rem;
  margin-bottom: 5px;
}

.reaction-count {
  font-weight: bold;
  color: var(--text-primary-color);
}

.categories-nav {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 10px;
  margin-bottom: 30px;
}

.category-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px 10px;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  background: var(--surface-color);
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.category-btn:hover {
  border-color: var(--primary-color);
}

.category-btn.active {
  border-color: var(--primary-color);
  background: var(--primary-light-color);
}

.category-icon {
  font-size: 1.5rem;
  margin-bottom: 5px;
}

.category-label {
  font-size: 0.8rem;
  color: var(--text-primary-color);
  margin-bottom: 3px;
}

.category-count {
  font-size: 0.7rem;
  color: var(--text-secondary-color);
  background: var(--background-color);
  padding: 2px 6px;
  border-radius: 10px;
}

.discovered-foods,
.suggested-foods {
  margin-bottom: 30px;
}

.discovered-foods h3,
.suggested-foods h3 {
  color: var(--text-primary-color);
  margin-bottom: 15px;
}

.search-bar {
  margin-bottom: 15px;
}

.search-input {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--surface-color);
  color: var(--text-primary-color);
}

.foods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 15px;
}

.food-card {
  background: var(--surface-color);
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 10px var(--shadow-color);
  border: 1px solid var(--border-color);
}

.food-card.discovered {
  border-left: 4px solid var(--primary-color);
}

.food-card.suggested.already-discovered {
  opacity: 0.6;
  border-left: 4px solid #4caf50;
}

.food-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.food-name {
  font-weight: bold;
  color: var(--text-primary-color);
}

.remove-btn {
  background: #f44336;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.food-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.reaction {
  font-weight: bold;
  font-size: 0.9rem;
}

.tasting-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tasting-info small {
  color: var(--text-secondary-color);
  font-size: 0.8rem;
}

.reaction-buttons {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.reaction-btn {
  border: none;
  border-radius: 6px;
  padding: 8px;
  cursor: pointer;
  color: white;
  font-size: 1rem;
  flex: 1;
  transition: opacity 0.2s;
}

.reaction-btn:hover {
  opacity: 0.8;
}

.already-tried {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  color: #4caf50;
}

.check-icon {
  font-size: 1.2rem;
}

.no-foods {
  text-align: center;
  color: var(--text-secondary-color);
  font-style: italic;
  padding: 20px;
}

.add-custom {
  margin-top: 30px;
}

.add-custom-btn {
  width: 100%;
  padding: 15px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-custom-btn:hover {
  background: var(--primary-dark-color);
}

.custom-form {
  background: var(--surface-color);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px var(--shadow-color);
}

.custom-input {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  margin-bottom: 15px;
  background: var(--background-color);
  color: var(--text-primary-color);
}

.reaction-selector {
  margin-bottom: 15px;
}

.reaction-selector label {
  display: block;
  margin-bottom: 8px;
  color: var(--text-primary-color);
  font-weight: bold;
}

.reaction-select {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--background-color);
  color: var(--text-primary-color);
}

.form-buttons {
  display: flex;
  gap: 10px;
}

.btn-primary,
.btn-secondary {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-dark-color);
}

.btn-secondary {
  background: var(--border-color);
  color: var(--text-primary-color);
}

.btn-secondary:hover {
  background: var(--text-secondary-color);
}
</style>
