export type EventType = 'pipi' | 'caca' | 'biberon' | 'dodo' | 'allaitement' | 'medicaments' | 'aliment'

export interface BabyEvent {
  id: string
  type: EventType
  timestamp: Date
  quantity?: number // en millilitres pour les biberons
  notes?: string
  childId?: string // ID de l'enfant associé à l'événement
  // Pour l'allaitement
  breastLeft?: boolean // sein gauche
  breastRight?: boolean // sein droit
  // Pour les médicaments
  medicationName?: string // nom du médicament saisi librement
  medicationList?: string[] // liste des médicaments sélectionnés
  // Pour les aliments
  foodItem?: string // nom de l'aliment
  foodCategory?: FoodCategory // catégorie de l'aliment
  foodReaction?: FoodReaction // réaction de l'enfant
}

export type FoodCategory = 'fruits' | 'legumes' | 'viandes' | 'poissons' | 'cereales' | 'laitiers' | 'autres'

export type FoodReaction = 'aime' | 'neutre' | 'naime_pas' | 'allergie'

export interface DailyStats {
  date: string
  pipiCount: number
  cacaCount: number
  biberonCount: number
  biberonTotal: number // en millilitres
  dodoCount: number
  dodoTotal: number // en minutes
  allaitementCount: number
  medicamentsCount?: number
}

export interface Child {
  id: string
  firstName: string
  lastName: string // Première lettre du nom de famille
}

export interface DiscoveredFood {
  id?: number
  name: string
  category: FoodCategory
  first_tasted_date: Date
  last_reaction: FoodReaction
  tasting_count: number
  child_id: string
  created_at?: Date
  updated_at?: Date
}
