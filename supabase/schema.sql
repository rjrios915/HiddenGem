-- Enable pgvector extension
create extension if not exists vector;

-- Users / profiles (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  onboarding_complete boolean default false,
  preferences jsonb default '{}',
  location_lat float,
  location_lon float,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Activities
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null,
  latitude float not null,
  longitude float not null,
  price_level text default '$',
  rating float default 0,
  review_count int default 0,
  source text,
  url text,
  image_url text,
  address text,
  hidden_gem_score float default 0,
  embedding vector(1536),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.activities enable row level security;

create policy "Activities are viewable by authenticated users"
  on public.activities for select using (auth.role() = 'authenticated');

-- Index for vector similarity search
create index if not exists activities_embedding_idx
  on public.activities using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Index for category/score filtering
create index if not exists activities_category_score_idx
  on public.activities (category, hidden_gem_score desc);

-- Saved activities
create table if not exists public.saved_activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  activity_id uuid references public.activities(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, activity_id)
);

alter table public.saved_activities enable row level security;

create policy "Users can view their own saved activities"
  on public.saved_activities for select using (auth.uid() = user_id);

create policy "Users can save activities"
  on public.saved_activities for insert with check (auth.uid() = user_id);

create policy "Users can unsave activities"
  on public.saved_activities for delete using (auth.uid() = user_id);

-- Logged experiences
create table if not exists public.logged_experiences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  activity_id uuid references public.activities(id) on delete cascade not null,
  rating int check (rating between 1 and 5) not null,
  reflection text,
  visited_at date not null,
  created_at timestamptz default now()
);

alter table public.logged_experiences enable row level security;

create policy "Users can view their own logged experiences"
  on public.logged_experiences for select using (auth.uid() = user_id);

create policy "Users can log experiences"
  on public.logged_experiences for insert with check (auth.uid() = user_id);

create policy "Users can update their own logs"
  on public.logged_experiences for update using (auth.uid() = user_id);

-- Itineraries
create table if not exists public.itineraries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  prompt text,
  itinerary_data jsonb not null,
  created_at timestamptz default now()
);

alter table public.itineraries enable row level security;

create policy "Users can view their own itineraries"
  on public.itineraries for select using (auth.uid() = user_id);

create policy "Users can create itineraries"
  on public.itineraries for insert with check (auth.uid() = user_id);

create policy "Users can delete their own itineraries"
  on public.itineraries for delete using (auth.uid() = user_id);

-- Recommendation function using pgvector cosine similarity
create or replace function public.match_activities(
  query_embedding vector(1536),
  match_count int default 20,
  filter_category text default null
)
returns table (
  id uuid,
  title text,
  description text,
  category text,
  latitude float,
  longitude float,
  price_level text,
  rating float,
  review_count int,
  source text,
  url text,
  image_url text,
  address text,
  hidden_gem_score float,
  similarity float
)
language sql stable
as $$
  select
    a.id, a.title, a.description, a.category,
    a.latitude, a.longitude, a.price_level,
    a.rating, a.review_count, a.source, a.url,
    a.image_url, a.address, a.hidden_gem_score,
    1 - (a.embedding <=> query_embedding) as similarity
  from public.activities a
  where
    a.embedding is not null
    and (filter_category is null or a.category = filter_category)
  order by
    (1 - (a.embedding <=> query_embedding)) * 0.6 + (a.hidden_gem_score / 10) * 0.4 desc
  limit match_count;
$$;
