'use client'

import * as React from 'react'

export type TempleCrowdLevel = 'Normal' | 'Moderate' | 'High'

export type CameraStatus = 'live' | 'offline'

export interface TempleCamera {
  id: string
  label: string
  status: CameraStatus
}

export interface LiveTempleMetrics {
  id: number
  name: string
  location: string
  icon: string

  currentCrowd: number
  capacity: number
  utilization: number
  waitTime: number
  level: TempleCrowdLevel

  temperatureC: number
  crowdDensityPct: number

  facilities: string[]
  cameras: TempleCamera[]

  securityOfficers: number
  medicalTeams: number
  buses: number
}

export interface LiveAdminStats {
  totalPilgrims: number
  activeEmergencies: number
  criticalCenters: number
  avgUtilization: number
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

const computeLevel = (utilization: number): TempleCrowdLevel => {
  if (utilization > 75) return 'High'
  if (utilization > 50) return 'Moderate'
  return 'Normal'
}

const baseTemples: LiveTempleMetrics[] = [
  {
    id: 1,
    name: 'Somnath Temple',
    location: 'Veraval, Gir Somnath',
    icon: '🕉',
    currentCrowd: 1220,
    capacity: 5000,
    utilization: 24,
    waitTime: 21,
    level: 'Normal',
    temperatureC: 28,
    crowdDensityPct: 24,
    facilities: ['Parking', 'Medical', 'Wheelchair', 'Lockers', '+1 more'],
    cameras: [
      { id: 'som-c1', label: 'Gate Entrance', status: 'live' },
      { id: 'som-c2', label: 'Queue Area', status: 'live' },
      { id: 'som-c3', label: 'Sanctum Line', status: 'live' },
    ],
    securityOfficers: 8,
    medicalTeams: 2,
    buses: 5,
  },
  {
    id: 2,
    name: 'Dwarkadhish Temple',
    location: 'Dwarka',
    icon: '🏛',
    currentCrowd: 360,
    capacity: 6000,
    utilization: 6,
    waitTime: 5,
    level: 'Normal',
    temperatureC: 28,
    crowdDensityPct: 5,
    facilities: ['Parking', 'Medical', 'Wheelchair', 'Rest Area', '+1 more'],
    cameras: [
      { id: 'dwa-c1', label: 'Main Entry', status: 'live' },
      { id: 'dwa-c2', label: 'Parking', status: 'live' },
      { id: 'dwa-c3', label: 'Crowd Corridor', status: 'live' },
    ],
    securityOfficers: 8,
    medicalTeams: 2,
    buses: 5,
  },
  {
    id: 3,
    name: 'Ambaji Temple',
    location: 'Ambaji, Banaskantha',
    icon: '🙏',
    currentCrowd: 480,
    capacity: 4000,
    utilization: 12,
    waitTime: 10,
    level: 'Normal',
    temperatureC: 28,
    crowdDensityPct: 12,
    facilities: ['Parking', 'Medical', 'Lockers', 'Cloak Room'],
    cameras: [
      { id: 'amb-c1', label: 'Queue Gate', status: 'live' },
      { id: 'amb-c2', label: 'Main Hall', status: 'live' },
      { id: 'amb-c3', label: 'Exit', status: 'live' },
    ],
    securityOfficers: 8,
    medicalTeams: 2,
    buses: 5,
  },
  {
    id: 4,
    name: 'Kalika Mata Temple',
    location: 'Pavagadh, Panchmahal',
    icon: '⛰',
    currentCrowd: 1730,
    capacity: 3000,
    utilization: 58,
    waitTime: 52,
    level: 'Moderate',
    temperatureC: 28,
    crowdDensityPct: 58,
    facilities: ['Ropeway', 'Medical', 'Wheelchair', 'Rest Area'],
    cameras: [
      { id: 'kal-c1', label: 'Ropeway', status: 'live' },
      { id: 'kal-c2', label: 'Steps Queue', status: 'live' },
      { id: 'kal-c3', label: 'Darshan Line', status: 'live' },
    ],
    securityOfficers: 10,
    medicalTeams: 3,
    buses: 8,
  },
]

const computeStats = (temples: LiveTempleMetrics[]): LiveAdminStats => {
  const totalPilgrims = temples.reduce((sum, t) => sum + t.currentCrowd, 0)
  const avgUtilization = Math.round(temples.reduce((sum, t) => sum + t.utilization, 0) / Math.max(1, temples.length))
  const criticalCenters = temples.filter(t => t.utilization >= 85).length

  return {
    totalPilgrims,
    avgUtilization,
    criticalCenters,
    activeEmergencies: 0,
  }
}

const formatLevelClasses = (level: TempleCrowdLevel) => {
  if (level === 'High') {
    return {
      badge: 'bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-200',
      border: 'border-orange-300 dark:border-orange-400/40',
      bg: 'bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-500/10 dark:to-red-500/5',
    }
  }
  if (level === 'Moderate') {
    return {
      badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-200',
      border: 'border-yellow-300 dark:border-yellow-400/40',
      bg: 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-500/10 dark:to-amber-500/5',
    }
  }
  return {
    badge: 'bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-200',
    border: 'border-green-300 dark:border-green-400/40',
    bg: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-500/10 dark:to-emerald-500/5',
  }
}

export function useLiveAdminMetrics() {
  const [temples, setTemples] = React.useState<LiveTempleMetrics[]>(() => baseTemples)
  const [now, setNow] = React.useState(() => new Date())

  React.useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date())
      setTemples(prev =>
        prev.map(t => {
          const crowdChange = Math.floor(Math.random() * 31) - 15
          const currentCrowd = clamp(t.currentCrowd + crowdChange, 0, t.capacity)
          const utilization = Math.round((currentCrowd / t.capacity) * 100)

          const baseWait = utilization > 75 ? 60 : utilization > 50 ? 45 : 30
          const waitTime = clamp(baseWait + (Math.floor(Math.random() * 11) - 5), 4, 120)

          const level = computeLevel(utilization)

          const temperatureC = clamp(t.temperatureC + (Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0), 24, 34)
          const crowdDensityPct = utilization

          // Small chance that one camera goes offline temporarily.
          const cameras = t.cameras.map(c => {
            if (Math.random() < 0.01) {
              const status: CameraStatus = c.status === 'live' ? 'offline' : 'live'
              return { ...c, status }
            }
            return c
          })

          // Optional tiny resource fluctuations for realism
          const securityOfficers = clamp(t.securityOfficers + (Math.random() < 0.02 ? (Math.random() > 0.5 ? 1 : -1) : 0), 4, 25)
          const medicalTeams = clamp(t.medicalTeams + (Math.random() < 0.02 ? (Math.random() > 0.5 ? 1 : -1) : 0), 1, 8)
          const buses = clamp(t.buses + (Math.random() < 0.02 ? (Math.random() > 0.5 ? 1 : -1) : 0), 2, 20)

          return {
            ...t,
            currentCrowd,
            utilization,
            waitTime,
            level,
            temperatureC,
            crowdDensityPct,
            cameras,
            securityOfficers,
            medicalTeams,
            buses,
          }
        }),
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const stats = React.useMemo(() => computeStats(temples), [temples])

  const templesWithUi = React.useMemo(() => {
    return temples.map(t => {
      const ui = formatLevelClasses(t.level)
      return {
        ...t,
        levelColor: ui.badge,
        borderColor: ui.border,
        bgColor: ui.bg,
      }
    })
  }, [temples])

  return {
    now,
    stats,
    temples: templesWithUi,
  }
}
