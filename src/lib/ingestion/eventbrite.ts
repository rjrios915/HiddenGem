import { scoreFromActivityData } from '@/lib/scoring'
import type { Activity, ActivityCategory } from '@/types'

// Eventbrite category IDs → our categories
const EB_CATEGORY_MAP: Record<string, ActivityCategory> = {
  '103': 'music',       // Music
  '105': 'art',         // Arts
  '108': 'food',        // Food & Drink
  '109': 'wellness',    // Health & Wellness
  '110': 'fitness',     // Sports & Fitness
  '111': 'outdoors',    // Travel & Outdoor
  '113': 'workshops',   // Community & Culture
  '114': 'nightlife',   // Nightlife
  '117': 'workshops',   // Home & Lifestyle
  '118': 'workshops',   // Hobbies & Special Interest
}

interface EventbriteVenue {
  address: { localized_address_display: string }
  latitude: string
  longitude: string
}

interface EventbriteEvent {
  id: string
  name: { text: string }
  description?: { text: string }
  url: string
  logo?: { url: string }
  category_id?: string
  venue?: EventbriteVenue
  is_free: boolean
  ticket_availability?: {
    minimum_ticket_price?: { value: number }
  }
}

function mapCategory(categoryId?: string): ActivityCategory {
  if (!categoryId) return 'workshops'
  return EB_CATEGORY_MAP[categoryId] ?? 'workshops'
}

function mapPrice(event: EventbriteEvent): Activity['price_level'] {
  if (event.is_free) return 'free'
  const min = event.ticket_availability?.minimum_ticket_price?.value ?? 0
  if (min === 0) return 'free'
  if (min < 20) return '$'
  if (min < 60) return '$$'
  return '$$$'
}

export async function fetchEventbriteActivities(
  location: string,
  limit = 30,
): Promise<Omit<Activity, 'id' | 'embedding' | 'created_at'>[]> {
  if (!process.env.EVENTBRITE_API_KEY || process.env.EVENTBRITE_API_KEY.startsWith('your_')) {
    throw new Error('EVENTBRITE_API_KEY not configured')
  }

  const params = new URLSearchParams({
    'location.address':       location,
    'location.within':        '10mi',
    'expand':                 'venue,ticket_availability',
    'page_size':              String(limit),
    'sort_by':                'date',
    'start_date.keyword':     'current_future',
  })

  const res = await fetch(`https://www.eventbriteapi.com/v3/events/search/?${params}`, {
    headers: { Authorization: `Bearer ${process.env.EVENTBRITE_API_KEY}` },
  })

  if (!res.ok) {
    throw new Error(`Eventbrite API error: ${res.status}`)
  }

  const data = await res.json()
  const events: EventbriteEvent[] = data.events ?? []

  return events
    .filter((e) => e.venue?.latitude && e.venue?.longitude)
    .map((e) => {
      const category   = mapCategory(e.category_id)
      const priceLevel = mapPrice(e)

      return {
        title:        e.name.text,
        description:  e.description?.text?.replace(/<[^>]*>/g, '').slice(0, 300) ?? '',
        category,
        latitude:     parseFloat(e.venue!.latitude),
        longitude:    parseFloat(e.venue!.longitude),
        price_level:  priceLevel,
        rating:       4.2,    // events have no rating; use optimistic default
        review_count: 12,     // small count → high uniqueness score
        source:       'eventbrite',
        url:          e.url,
        image_url:    e.logo?.url,
        address:      e.venue?.address.localized_address_display,
        hidden_gem_score: scoreFromActivityData({ rating: 4.2, review_count: 12 }),
      }
    })
}
