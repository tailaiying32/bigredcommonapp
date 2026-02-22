-- Create public resumes storage bucket
-- Public so team owners/reviewers can view resumes via URL
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- Users can upload to their own folder only
CREATE POLICY "Users can upload own resume"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'resumes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can replace their own resume
CREATE POLICY "Users can update own resume"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'resumes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own resume
CREATE POLICY "Users can delete own resume"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'resumes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Public read (bucket is public, allows getPublicUrl to work)
CREATE POLICY "Public can read resumes"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'resumes');
