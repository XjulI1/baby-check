import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import EventList from '../EventList.vue'
import { useEventsStore } from '@/stores/events'
import type { BabyEvent } from '@/types'

describe('EventList', () => {
  beforeEach(() => {
    // Créer une nouvelle instance de Pinia pour chaque test
    setActivePinia(createPinia())

    // Réinitialiser les mocks
    vi.restoreAllMocks()
  })

  it("affiche un message quand aucun événement n'est disponible", async () => {
    const wrapper = mount(EventList)

    // S'assurer que le composant est monté et que les calculs sont faits
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.empty-state').exists()).toBe(true)
    expect(wrapper.find('.empty-state').text()).toContain('Aucun événement pour cette journée')
  })

  it('affiche la liste des événements quand il y en a', async () => {
    const eventStore = useEventsStore()

    // Mock la méthode eventsForDate pour retourner des événements
    const mockEvents: BabyEvent[] = [
      {
        id: '1',
        type: 'pipi',
        timestamp: new Date(),
        notes: 'Note de test',
      },
      {
        id: '2',
        type: 'biberon',
        timestamp: new Date(),
        quantity: 90,
      },
    ]

    vi.spyOn(eventStore, 'eventsForDate').mockReturnValue(mockEvents)

    const wrapper = mount(EventList)

    // S'assurer que le composant est monté et que les calculs sont faits
    await wrapper.vm.$nextTick()

    // Vérifier que l'état vide n'est pas affiché
    expect(wrapper.find('.empty-state').exists()).toBe(false)

    // Vérifier que les événements sont affichés
    const eventItems = wrapper.findAll('.event-item')
    expect(eventItems.length).toBe(2)

    // Vérifier le contenu du premier événement
    expect(eventItems[0].text()).toContain('Pipi')
    expect(eventItems[0].text()).toContain('Note de test')

    // Vérifier le contenu du deuxième événement
    expect(eventItems[1].text()).toContain('Biberon')
    expect(eventItems[1].text()).toContain('90 cl')
  })

  it('affiche les statistiques journalières', async () => {
    const eventStore = useEventsStore()

    // Mock la méthode statsForDate
    vi.spyOn(eventStore, 'statsForDate').mockReturnValue({
      date: new Date().toISOString().split('T')[0],
      pipiCount: 5,
      cacaCount: 3,
      biberonCount: 6,
      biberonTotal: 450,
    })

    const wrapper = mount(EventList)

    // S'assurer que le composant est monté et que les calculs sont faits
    await wrapper.vm.$nextTick()

    const statItems = wrapper.findAll('.stat-item')

    // Vérifier que les statistiques sont correctes
    expect(statItems[0].text()).toContain('5') // pipi
    expect(statItems[1].text()).toContain('3') // caca
    expect(statItems[2].text()).toContain('450 cl') // biberon
  })

  it('appelle removeEvent quand on clique sur le bouton de suppression', async () => {
    const eventStore = useEventsStore()
    const spy = vi.spyOn(eventStore, 'removeEvent')

    // Mock confirm pour toujours retourner true
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    // Mock la méthode eventsForDate pour retourner des événements
    vi.spyOn(eventStore, 'eventsForDate').mockReturnValue([
      {
        id: '1',
        type: 'pipi',
        timestamp: new Date(),
        notes: 'Note de test',
      },
    ])

    const wrapper = mount(EventList)
    await wrapper.vm.$nextTick()

    // Cliquer sur le bouton de suppression
    await wrapper.find('.delete-button').trigger('click')

    // Vérifier que removeEvent a été appelé avec le bon ID
    expect(spy).toHaveBeenCalledWith('1')
  })

  it('permet de naviguer entre les jours', async () => {
    const wrapper = mount(EventList)
    // Utiliser getAttribute pour récupérer la date ou faire un casting explicite
    const initialDate = (wrapper.vm as any).currentDate

    // Naviguer vers le jour précédent
    await wrapper.find('.date-selector button:first-child').trigger('click')

    // Vérifier que la date a été modifiée
    const previousDay = new Date(initialDate)
    previousDay.setDate(previousDay.getDate() - 1)
    const expectedPreviousDate = previousDay.toISOString().split('T')[0]
    expect((wrapper.vm as any).currentDate).toBe(expectedPreviousDate)

    // Naviguer vers le jour suivant
    await wrapper.find('.date-selector button:last-child').trigger('click')

    // Vérifier qu'on est revenu à la date initiale
    expect((wrapper.vm as any).currentDate).toBe(initialDate)
  })
})
