export type EventType = 'pipi' | 'caca' | 'biberon' | 'dodo'

export interface BabyEvent {
  id: string
  type: EventType
  timestamp: Date
  quantity?: number // en centilitres pour les biberons
  notes?: string
}

export interface DailyStats {
  date: string
  pipiCount: number
  cacaCount: number
  biberonCount: number
  biberonTotal: number // en centilitres
  dodoCount: number
  dodoTotal: number // en minutes
}
