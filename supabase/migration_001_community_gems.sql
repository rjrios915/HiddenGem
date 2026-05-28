-- Migration 001: Community gem submissions + photo storage
-- Run this in the Supabase SQL editor

-- 1. Add submitted_by column to activities
ALTER TABLE public.activities
  ADD COLUMN IF NOT EXISTS submitted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS activities_submitted_by_idx
  ON public.activities (submitted_by)
  WHERE submitted_by IS NOT NULL;

-- 2. RLS policies for community submissions
CREATE POLICY "Users can submit community gems"
  ON public.activities FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND submitted_by = auth.uid()
    AND source = 'community'
  );

CREATE POLICY "Users can update their own gems"
  ON public.activities FOR UPDATE
  USING (submitted_by = auth.uid() AND source = 'community');

CREATE POLICY "Users can delete their own gems"
  ON public.activities FOR DELETE
  USING (submitted_by = auth.uid() AND source = 'community');

-- 3. Supabase Storage bucket for gem photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gem-photos',
  'gem-photos',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload gem photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'gem-photos'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Public can read gem photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gem-photos');

CREATE POLICY "Users can delete their own gem photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'gem-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
