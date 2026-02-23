-- Add video_url column to events
ALTER TABLE events ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Create storage bucket for event videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-videos',
  'event-videos',
  true,
  104857600,  -- 100MB
  ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for event-videos bucket
CREATE POLICY "Public read event videos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'event-videos');

CREATE POLICY "Auth users upload event videos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'event-videos'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Auth users update event videos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'event-videos'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Auth users delete event videos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'event-videos'
    AND auth.role() = 'authenticated'
  );
