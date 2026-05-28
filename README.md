# HiddenGem

AI-powered discovery of underrated local experiences, tailored to you.

## About

HiddenGem surfaces hidden gems in your city — local spots and experiences that aren't on mainstream platforms. Built as a 10-week university project at Stanford.

**Stack:** Next.js 16 · React 19 · TypeScript · Supabase (Postgres + pgvector + Auth) · OpenAI · Mapbox · Tailwind CSS v4

## AI Usage

This project uses AI extensively, in two distinct ways:

### 1. AI-assisted development (Claude)
The majority of this codebase was built with [Claude Code](https://claude.ai/code) (Anthropic). Claude was used throughout the development process for:
- Architecture decisions and full feature implementation
- Debugging and iterative refinement based on live feedback
- UI/UX design system and component work
- Writing and evolving all API routes, database schema, and business logic

All code was reviewed, tested, and directed by the developer. Claude acted as a collaborative coding partner — the product decisions, feature direction, and final judgement on what shipped were entirely human-driven.

### 2. AI features built into the product (OpenAI)
The app itself uses OpenAI models as core product features:

| Feature | Model | How it's used |
|---|---|---|
| Personalized recommendations | `text-embedding-3-small` | Converts user preferences and mood queries into vectors; cosine similarity against activity embeddings drives the feed |
| Activity explanations | `gpt-4o-mini` | Generates a one-line explanation for why each gem matches the user's preferences |
| Itinerary generation | `gpt-4o-mini` | Takes a natural language day description and returns a structured itinerary of matching hidden gems |
| Dismiss signal learning | `text-embedding-3-small` | Categories the user repeatedly dismisses are appended as negative signals to the preference embedding, steering future recommendations away from them |

## Getting Started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
NEXT_PUBLIC_MAPBOX_TOKEN=
```
