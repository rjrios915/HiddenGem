import OpenAI from 'openai'
import type { Activity, Itinerary, UserPreferences } from '@/types'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  })
  return response.data[0].embedding
}

export async function generateActivityExplanation(
  activity: Activity,
  preferences: UserPreferences
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'You generate short, friendly recommendation explanations (1–2 sentences) for a hidden gem discovery app. Focus on why this specific experience matches the user\'s personality and preferences. Be warm and specific, not generic.',
      },
      {
        role: 'user',
        content: `Activity: ${activity.title} — ${activity.description}
Category: ${activity.category}, Price: ${activity.price_level}, HiddenGem Score: ${activity.hidden_gem_score}/10
User preferences: categories ${preferences.categories.join(', ')}, budget ${preferences.budget.join('/')}, ${preferences.indoor_outdoor}, ${preferences.social_level}, ${preferences.intensity} intensity

Write a short explanation for why this is recommended to this user.`,
      },
    ],
    max_tokens: 100,
    temperature: 0.7,
  })

  return response.choices[0].message.content ?? 'A hidden gem worth exploring.'
}

export async function generateItinerary(
  prompt: string,
  activities: Activity[],
  preferences: UserPreferences
): Promise<Itinerary> {
  const activityList = activities
    .slice(0, 15)
    .map((a) => `- ${a.title} (${a.category}, ${a.price_level}, score: ${a.hidden_gem_score}/10): ${a.description}`)
    .join('\n')

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are an AI itinerary planner for a hidden gem discovery app. Generate personalized, realistic itineraries based on the user's prompt and available local activities. Return valid JSON only.`,
      },
      {
        role: 'user',
        content: `User prompt: "${prompt}"
User preferences: ${preferences.social_level}, ${preferences.intensity} intensity, budget ${preferences.budget.join('/')}

Available activities:
${activityList}

Generate an itinerary. Return JSON matching this schema:
{
  "title": "string",
  "activities": [
    {
      "activity_title": "string (must match one from the list above)",
      "start_time": "HH:MM",
      "duration_minutes": number,
      "notes": "string (optional tip)"
    }
  ],
  "estimated_cost": "string (e.g. '$20–$40')",
  "estimated_duration": "string (e.g. '4 hours')",
  "reasoning": "string (2–3 sentences explaining the choices)"
}`,
      },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 800,
    temperature: 0.8,
  })

  const raw = JSON.parse(response.choices[0].message.content ?? '{}')

  const matchedActivities = (raw.activities ?? []).map((item: { activity_title: string; start_time: string; duration_minutes: number; notes?: string }) => {
    const match = activities.find((a) =>
      a.title.toLowerCase().includes(item.activity_title?.toLowerCase() ?? '')
    )
    return {
      activity: match ?? activities[0],
      start_time: item.start_time,
      duration_minutes: item.duration_minutes,
      notes: item.notes,
    }
  })

  return {
    title: raw.title ?? prompt,
    activities: matchedActivities,
    estimated_cost: raw.estimated_cost ?? 'Unknown',
    estimated_duration: raw.estimated_duration ?? 'Unknown',
    reasoning: raw.reasoning ?? '',
  }
}
