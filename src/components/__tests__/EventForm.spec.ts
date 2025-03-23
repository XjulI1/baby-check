import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import EventForm from '../EventForm.vue'
import { useEventsStore } from '@/stores/events'

describe('EventForm', () => {
  beforeEach(() => {
    // Créer une nouvelle instance de Pinia pour chaque test
    setActivePinia(createPinia())

    // Mock Date pour avoir une heure constante pendant les tests
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2023-01-01T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("affiche correctement le formulaire avec les options de type d'événement", () => {
    const wrapper = mount(EventForm)
    expect(wrapper.text()).toContain('Ajouter un événement')
    expect(wrapper.text()).toContain('Pipi')
    expect(wrapper.text()).toContain('Caca')
    expect(wrapper.text()).toContain('Biberon')
    expect(wrapper.text()).toContain('Date et heure:')
  })

  it('montre le champ de quantité uniquement pour les biberons', async () => {
    const wrapper = mount(EventForm)

    // Par défaut, le champ quantité ne devrait pas être visible (pipi est sélectionné)
    expect(wrapper.find('input[type="number"]').exists()).toBe(false)

    // Cliquer sur le bouton biberon
    await wrapper.findAll('button')[2].trigger('click')

    // Le champ quantité devrait maintenant être visible
    expect(wrapper.find('input[type="number"]').exists()).toBe(true)
  })

  it("affiche toujours les champs de sélection de date et d'heure", async () => {
    const wrapper = mount(EventForm)

    // Les champs de date et d'heure devraient être visibles par défaut
    expect(wrapper.find('input[type="date"]').exists()).toBe(true)
    expect(wrapper.find('input[type="time"]').exists()).toBe(true)

    // Vérifier que les valeurs par défaut sont celles du système
    const dateInput = wrapper.find('input[type="date"]')
    const timeInput = wrapper.find('input[type="time"]')

    expect(dateInput.element.value).toBe('2023-01-01')
    expect(timeInput.element.value).toBe('12:00')
  })

  it("ajoute un événement avec la date et l'heure spécifiées", async () => {
    const wrapper = mount(EventForm)
    const eventStore = useEventsStore()
    const spy = vi.spyOn(eventStore, 'addEvent')

    // Définir une date et une heure personnalisées
    await wrapper.find('input[type="date"]').setValue('2023-01-15')
    await wrapper.find('input[type="time"]').setValue('14:30')

    // Soumettre le formulaire
    await wrapper.find('.submit-button').trigger('click')

    // Vérifier que addEvent a été appelé avec la date et l'heure personnalisées
    expect(spy).toHaveBeenCalled()

    // Extraire l'argument de date
    const date = spy.mock.calls[0][3]
    expect(date).toBeDefined()
    expect(date?.getFullYear()).toBe(2023)
    expect(date?.getMonth()).toBe(0) // Janvier = 0
    expect(date?.getDate()).toBe(15)
    expect(date?.getHours()).toBe(14)
    expect(date?.getMinutes()).toBe(30)
  })

  it('ajoute un événement au store quand le formulaire est soumis', async () => {
    const wrapper = mount(EventForm)
    const eventStore = useEventsStore()
    const spy = vi.spyOn(eventStore, 'addEvent')

    // Sélectionner le type biberon et ajouter une quantité
    await wrapper.findAll('button')[2].trigger('click')
    const quantityInput = wrapper.find('input[type="number"]')
    await quantityInput.setValue(60)

    // Ajouter des notes
    const notesInput = wrapper.find('textarea')
    await notesInput.setValue('Test biberon')

    // Soumettre le formulaire
    await wrapper.find('.submit-button').trigger('click')

    // Vérifier que la méthode addEvent a été appelée avec les bons arguments
    expect(spy).toHaveBeenCalledWith('biberon', 60, 'Test biberon', expect.any(Date))
  })

  it('réinitialise le formulaire après soumission', async () => {
    const wrapper = mount(EventForm)

    // Sélectionner le type biberon et ajouter une quantité
    await wrapper.findAll('button')[2].trigger('click')
    const quantityInput = wrapper.find('input[type="number"]')
    await quantityInput.setValue(60)

    // Ajouter des notes
    const notesInput = wrapper.find('textarea')
    await notesInput.setValue('Test biberon')

    // Soumettre le formulaire
    await wrapper.find('.submit-button').trigger('click')

    // Vérifier que les champs sont réinitialisés
    expect((quantityInput.element as HTMLInputElement).value).toBe('')
    expect((notesInput.element as HTMLTextAreaElement).value).toBe('')

    // La date et l'heure devraient être réinitialisées à la date et l'heure actuelles
    const dateInput = wrapper.find('input[type="date"]')
    expect(dateInput.element.value).toBe('2023-01-01')
  })

  it('montre les champs de durée de sommeil uniquement pour le type dodo', async () => {
    const wrapper = mount(EventForm)

    // Par défaut, les champs de durée de sommeil ne devraient pas être visibles
    expect(wrapper.find('#sleepHours').exists()).toBe(false)

    // Cliquer sur le bouton dodo
    await wrapper.findAll('button')[3].trigger('click')

    // Les champs de durée de sommeil devraient maintenant être visibles
    expect(wrapper.find('#sleepHours').exists()).toBe(true)
    expect(wrapper.find('#sleepMinutes').exists()).toBe(true)
  })

  it('ajoute un événement dodo avec la durée spécifiée', async () => {
    const wrapper = mount(EventForm)
    const eventStore = useEventsStore()
    const spy = vi.spyOn(eventStore, 'addEvent')

    // Sélectionner le type dodo et configurer la durée
    await wrapper.findAll('button')[3].trigger('click')
    await wrapper.find('#sleepHours').setValue(1)
    await wrapper.find('#sleepMinutes').setValue(30)

    // Soumettre le formulaire
    await wrapper.find('.submit-button').trigger('click')

    // Vérifier que addEvent a été appelé avec la bonne quantité (90 minutes)
    expect(spy).toHaveBeenCalledWith('dodo', 90, '', expect.any(Date))
  })
})
