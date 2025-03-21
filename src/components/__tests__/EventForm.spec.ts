import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import EventForm from '../EventForm.vue'
import { useEventsStore } from '@/stores/events'
import type { EventType } from '@/types'

describe('EventForm', () => {
  beforeEach(() => {
    // Créer une nouvelle instance de Pinia pour chaque test
    setActivePinia(createPinia())
  })

  it("affiche correctement le formulaire avec les options de type d'événement", () => {
    const wrapper = mount(EventForm)
    expect(wrapper.text()).toContain('Ajouter un événement')
    expect(wrapper.text()).toContain('Pipi')
    expect(wrapper.text()).toContain('Caca')
    expect(wrapper.text()).toContain('Biberon')
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
    expect(spy).toHaveBeenCalledWith('biberon', 60, 'Test biberon')
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
  })
})
