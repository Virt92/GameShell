export interface User {
  id: string
  name: string
  email: string
  role: 'owner' | 'devops' | 'operator' | 'accountant'
  clubId: string
  clubName: string
}

export interface Host {
  id: string
  name: string
  type: 'pc' | 'ps5' | 'ps4' | 'ps2'
  status: 'online' | 'offline' | 'busy' | 'maintenance' | 'booked'
  ipAddress?: string
  macAddress?: string
  zoneId?: string
  zone?: Zone
  controlMethod: string
  hardware?: Record<string, unknown>
  sessions?: Session[]
}

export interface Zone {
  id: string
  name: string
  color?: string
  sortOrder: number
}

export interface Session {
  id: string
  hostId: string
  playerId?: string
  tariffId?: string
  type: 'prepaid' | 'postpaid'
  status: 'active' | 'paused' | 'completed' | 'cancelled'
  startedAt: string
  endedAt?: string
  durationMin?: number
  actualMin?: number
  amount?: number
  host?: Host
  player?: Player
  tariff?: Tariff
}

export interface Player {
  id: string
  phone?: string
  nickname?: string
  balance: number
  bonusPoints: number
  loyaltyLevel: string
}

export interface Tariff {
  id: string
  name: string
  type: 'hourly' | 'fixed' | 'daily'
  price: number
  duration?: number
  appliesTo: string
}

export interface Game {
  id: string
  name: string
  category?: string
  launcher?: string
  coverUrl?: string
  sizeGb?: number
  _count?: { hostGames: number }
}

export interface Product {
  id: string
  name: string
  category?: string
  price: number
  imageUrl?: string
  inStock: boolean
}

export interface DashboardStats {
  activeSessions: number
  todayRevenue: number
  hosts: Record<string, number>
  onlinePlayers: number
}
