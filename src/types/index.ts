export type ActivityCategory =
  | 'music'
  | 'art'
  | 'cafes'
  | 'outdoors'
  | 'fitness'
  | 'volunteering'
  | 'nightlife'
  | 'food'
  | 'workshops'
  | 'gaming'
  | 'wellness'

export type BudgetRange = 'free' | '$' | '$$' | '$$$'
export type SocialLevel = 'solo' | 'small_group' | 'large_group'
export type TimePreference = 'morning' | 'afternoon' | 'evening' | 'late_night'
export type IntensityLevel = 'chill' | 'moderate' | 'active'
export type IndoorOutdoor = 'indoor' | 'outdoor' | 'both'

export interface UserPreferences {
  categories: ActivityCategory[]
  budget: BudgetRange[]
  indoor_outdoor: IndoorOutdoor
  social_level: SocialLevel
  time_preference: TimePreference[]
  intensity: IntensityLevel
}

export interface Activity {
  id: string
  title: string
  description: string
  category: ActivityCategory
  latitude: number
  longitude: number
  price_level: BudgetRange
  rating: number
  review_count: number
  source: string
  url: string
  image_url?: string
  address?: string
  hidden_gem_score: number
  created_at: string
}

export interface SavedActivity {
  id: string
  user_id: string
  activity_id: string
  created_at: string
  activity?: Activity
}

export interface LoggedExperience {
  id: string
  user_id: string
  activity_id: string
  rating: number
  reflection?: string
  visited_at: string
  created_at: string
  activity?: Activity
}

export interface ItineraryActivity {
  activity: Activity
  start_time: string
  duration_minutes: number
  notes?: string
}

export interface Itinerary {
  id?: string
  title: string
  activities: ItineraryActivity[]
  estimated_cost: string
  estimated_duration: string
  reasoning: string
  created_at?: string
}

export interface RecommendationCard extends Activity {
  explanation: string
  distance_km?: number
}
