export type EventType = 'pipi' | 'caca' | 'biberon' | 'dodo' | 'allaitement'

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
}

export interface DailyStats {
  date: string
  pipiCount: number
  cacaCount: number
  biberonCount: number
  biberonTotal: number // en millilitres
  dodoCount: number
  dodoTotal: number // en minutes
  allaitementCount: number
}

export interface Child {
  id: string
  firstName: string
  lastName: string // Première lettre du nom de famille
}
