import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m away`
  return `${km.toFixed(1)}km away`
}

export function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function priceLevelLabel(level: string): string {
  const map: Record<string, string> = {
    free: 'Free',
    '$': 'Under $15',
    '$$': '$15–$40',
    '$$$': '$40+',
  }
  return map[level] ?? level
}

export function gemScoreColor(score: number): string {
  if (score >= 8) return 'text-emerald-500'
  if (score >= 6) return 'text-yellow-500'
  return 'text-orange-400'
}
