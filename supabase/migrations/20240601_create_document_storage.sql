-- Create a bucket for storing pet document files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('pet-documents', 'Pet Documents', true);

-- Set up security policies for the bucket
-- Allow public read access to files
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'pet-documents');

-- Only allow authenticated users to insert files
CREATE POLICY "User Insert Access"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'pet-documents');

-- Only allow file owners to update their files
CREATE POLICY "User Update Access"
ON storage.objects FOR UPDATE
USING (bucket_id = 'pet-documents')
WITH CHECK (bucket_id = 'pet-documents');

-- Only allow file owners to delete their files
CREATE POLICY "User Delete Access"
ON storage.objects FOR DELETE
USING (bucket_id = 'pet-documents');