import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import StatisticsView from '../views/StatisticsView.vue'
import ChildSelectView from '../views/ChildSelectView.vue'
import AboutView from '../views/AboutView.vue'
import SettingsView from '../views/SettingsView.vue'
import { useChildStore } from '@/stores/child'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresChild: true },
    },
    {
      path: '/statistics',
      name: 'statistics',
      component: StatisticsView,
      meta: { requiresChild: true },
    },
    {
      path: '/select-child',
      name: 'selectChild',
      component: ChildSelectView,
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView,
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
    },
  ],
})

// Navigation guard pour vérifier si un enfant est sélectionné
router.beforeEach((to, from, next) => {
  if (to.meta.requiresChild) {
    const childStore = useChildStore()

    // Si on a besoin d'un enfant sélectionné et qu'aucun n'est sélectionné
    if (!childStore.currentChild) {
      next({ name: 'selectChild' })
      return
    }
  }
  next()
})

export default router
