import type { Activity } from '@/types'

export interface ScoringInputs {
  rating: number         // 0–5
  reviewCount: number
  uniqueness: number     // 0–10, computed from review count saturation
  novelty: number        // 0–10, computed from embedding distance to popular items
  overpopularity: number // 0–10, high = very popular/touristy
}

export function computeHiddenGemScore(inputs: ScoringInputs): number {
  const { rating, uniqueness, novelty, overpopularity } = inputs

  const normalizedRating = (rating / 5) * 10

  const score =
    normalizedRating * 0.35 +
    uniqueness * 0.30 +
    novelty * 0.20 -
    overpopularity * 0.15

  return Math.min(10, Math.max(0, Math.round(score * 10) / 10))
}

export function deriveUniqueness(reviewCount: number): number {
  // Fewer reviews = more unique (inversely proportional, capped)
  if (reviewCount <= 10) return 10
  if (reviewCount <= 50) return 8
  if (reviewCount <= 200) return 6
  if (reviewCount <= 500) return 4
  if (reviewCount <= 2000) return 2
  return 1
}

export function deriveOverpopularity(reviewCount: number, rating: number): number {
  // High review count + high rating = tourist trap
  const popularityRaw = Math.log10(reviewCount + 1) * (rating / 5)
  return Math.min(10, popularityRaw * 2)
}

export function scoreFromActivityData(activity: Partial<Activity> & { rating: number; review_count: number }): number {
  const uniqueness = deriveUniqueness(activity.review_count)
  const overpopularity = deriveOverpopularity(activity.review_count, activity.rating)

  return computeHiddenGemScore({
    rating: activity.rating,
    reviewCount: activity.review_count,
    uniqueness,
    novelty: uniqueness * 0.8, // proxy until we have embedding-based novelty
    overpopularity,
  })
}
