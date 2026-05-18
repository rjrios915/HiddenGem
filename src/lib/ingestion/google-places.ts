import { scoreFromActivityData } from '@/lib/scoring'
import type { Activity, ActivityCategory } from '@/types'

const TYPE_CATEGORY_MAP: Record<string, ActivityCategory> = {
  restaurant:                'food',
  food:                      'food',
  cafe:                      'cafes',
  coffee_shop:               'cafes',
  bakery:                    'cafes',
  bar:                       'nightlife',
  night_club:                'nightlife',
  art_gallery:               'art',
  museum:                    'art',
  performing_arts_theater:   'music',
  concert_hall:              'music',
  park:                      'outdoors',
  hiking_area:               'outdoors',
  national_park:             'outdoors',
  gym:                       'fitness',
  fitness_center:            'fitness',
  yoga_studio:               'wellness',
  spa:                       'wellness',
  library:                   'workshops',
  community_center:          'workshops',
}

// Text Search queries tailored to surface hidden/local gems
const SEARCH_QUERIES: { query: string; category: ActivityCategory }[] = [
  { query: 'local hidden gem cafe coffee',          category: 'cafes'      },
  { query: 'independent art gallery local artist',  category: 'art'        },
  { query: 'scenic hiking trail park',              category: 'outdoors'   },
  { query: 'hole in the wall local restaurant',     category: 'food'       },
  { query: 'yoga wellness studio small',            category: 'wellness'   },
  { query: 'live music jazz blues venue',           category: 'music'      },
  { query: 'community workshop pottery craft',      category: 'workshops'  },
  { query: 'boutique fitness gym',                  category: 'fitness'    },
  { query: 'underground nightlife bar',             category: 'nightlife'  },
]

interface GooglePlace {
  id: string
  displayName: { text: string }
  types: string[]
  primaryType?: string
  rating?: number
  userRatingCount?: number
  priceLevel?: string
  websiteUri?: string
  formattedAddress?: string
  location: { latitude: number; longitude: number }
  editorialSummary?: { text: string }
  photos?: { name: string }[]
}

async function fetchPhotoUri(photoName: string, apiKey: string): Promise<string | undefined> {
  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=800&skipHttpRedirect=true&key=${apiKey}`
    )
    if (!res.ok) return undefined
    const data = await res.json()
    return data.photoUri as string | undefined
  } catch {
    return undefined
  }
}

function mapCategory(types: string[], primaryType?: string): ActivityCategory {
  const candidates = primaryType ? [primaryType, ...types] : types
  for (const t of candidates) {
    const mapped = TYPE_CATEGORY_MAP[t]
    if (mapped) return mapped
  }
  return 'food'
}

function mapPrice(priceLevel?: string): Activity['price_level'] {
  switch (priceLevel) {
    case 'PRICE_LEVEL_FREE':          return 'free'
    case 'PRICE_LEVEL_INEXPENSIVE':   return '$'
    case 'PRICE_LEVEL_MODERATE':      return '$$'
    case 'PRICE_LEVEL_EXPENSIVE':
    case 'PRICE_LEVEL_VERY_EXPENSIVE':return '$$$'
    default:                          return '$'
  }
}

const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.types',
  'places.primaryType',
  'places.rating',
  'places.userRatingCount',
  'places.priceLevel',
  'places.websiteUri',
  'places.formattedAddress',
  'places.location',
  'places.editorialSummary',
  'places.photos',
].join(',')

export async function fetchGooglePlacesActivities(
  location: string,
  limit = 40,
): Promise<Omit<Activity, 'id' | 'embedding' | 'created_at'>[]> {
  if (!process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_PLACES_API_KEY.startsWith('your_')) {
    throw new Error('GOOGLE_PLACES_API_KEY not configured')
  }

  const results: Omit<Activity, 'id' | 'embedding' | 'created_at'>[] = []
  const seenIds = new Set<string>()
  const perQuery = Math.max(5, Math.ceil(limit / SEARCH_QUERIES.length))

  for (const { query, category: fallbackCategory } of SEARCH_QUERIES) {
    if (results.length >= limit) break

    try {
      const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type':   'application/json',
          'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY!,
          'X-Goog-FieldMask': FIELD_MASK,
        },
        body: JSON.stringify({
          textQuery:    `${query} in ${location}`,
          pageSize:     perQuery,
          languageCode: 'en',
        }),
      })

      if (!res.ok) continue

      const data = await res.json()
      const places: GooglePlace[] = data.places ?? []

      for (const place of places) {
        if (seenIds.has(place.id)) continue
        seenIds.add(place.id)

        const category    = mapCategory(place.types, place.primaryType) ?? fallbackCategory
        const priceLevel  = mapPrice(place.priceLevel)
        const rating      = place.rating ?? 4.0
        const reviewCount = place.userRatingCount ?? 30
        const imageUrl    = place.photos?.[0]?.name
          ? await fetchPhotoUri(place.photos[0].name, process.env.GOOGLE_PLACES_API_KEY!)
          : undefined

        results.push({
          title:            place.displayName.text,
          description:      place.editorialSummary?.text ?? `${place.types.slice(0, 2).join(', ')} in ${location}`,
          category,
          latitude:         place.location.latitude,
          longitude:        place.location.longitude,
          price_level:      priceLevel,
          rating,
          review_count:     reviewCount,
          source:           'google',
          url:              place.websiteUri ?? `https://maps.google.com/?q=${encodeURIComponent(place.displayName.text)}`,
          image_url:        imageUrl,
          address:          place.formattedAddress,
          hidden_gem_score: scoreFromActivityData({ rating, review_count: reviewCount }),
        })
      }
    } catch {
      // skip failed query, continue with next
    }
  }

  return results.slice(0, limit)
}
