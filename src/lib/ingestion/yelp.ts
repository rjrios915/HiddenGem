import { scoreFromActivityData } from '@/lib/scoring'
import type { Activity, ActivityCategory } from '@/types'

const YELP_CATEGORY_MAP: Record<string, ActivityCategory> = {
  restaurants: 'food',
  food: 'food',
  bars: 'nightlife',
  nightlife: 'nightlife',
  arts: 'art',
  museums: 'art',
  galleries: 'art',
  fitness: 'fitness',
  gyms: 'fitness',
  yoga: 'wellness',
  spas: 'wellness',
  coffee: 'cafes',
  cafes: 'cafes',
  parks: 'outdoors',
  hiking: 'outdoors',
  music: 'music',
  concerts: 'music',
  gaming: 'gaming',
}

interface YelpBusiness {
  id: string
  name: string
  categories: { alias: string; title: string }[]
  rating: number
  review_count: number
  price?: string
  url: string
  image_url?: string
  location: { display_address: string[] }
  coordinates: { latitude: number; longitude: number }
}

function mapCategory(yelpCategories: { alias: string }[]): ActivityCategory {
  for (const cat of yelpCategories) {
    const mapped = YELP_CATEGORY_MAP[cat.alias]
    if (mapped) return mapped
  }
  return 'food'
}

function mapPrice(price?: string): Activity['price_level'] {
  if (!price) return '$'
  if (price === '$') return '$'
  if (price === '$$') return '$$'
  if (price === '$$$' || price === '$$$$') return '$$$'
  return '$'
}

export async function fetchYelpActivities(
  location: string,
  term = 'activities',
  limit = 20
): Promise<Omit<Activity, 'id' | 'embedding' | 'created_at'>[]> {
  if (!process.env.YELP_API_KEY) {
    throw new Error('YELP_API_KEY not set')
  }

  const params = new URLSearchParams({
    location,
    term,
    limit: String(limit),
    sort_by: 'rating',
  })

  const response = await fetch(`https://api.yelp.com/v3/businesses/search?${params}`, {
    headers: { Authorization: `Bearer ${process.env.YELP_API_KEY}` },
  })

  if (!response.ok) {
    throw new Error(`Yelp API error: ${response.status}`)
  }

  const data = await response.json()
  const businesses: YelpBusiness[] = data.businesses ?? []

  return businesses.map((b) => {
    const priceLevel = mapPrice(b.price)
    const category = mapCategory(b.categories)
    const hidden_gem_score = scoreFromActivityData({
      rating: b.rating,
      review_count: b.review_count,
      price_level: priceLevel,
    })

    return {
      title: b.name,
      description: `${b.categories.map((c) => c.title).join(', ')} in ${b.location.display_address.join(', ')}`,
      category,
      latitude: b.coordinates.latitude,
      longitude: b.coordinates.longitude,
      price_level: priceLevel,
      rating: b.rating,
      review_count: b.review_count,
      source: 'yelp',
      url: b.url,
      image_url: b.image_url,
      address: b.location.display_address.join(', '),
      hidden_gem_score,
    }
  })
}
