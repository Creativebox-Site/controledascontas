-- Add file size limit (5MB) and MIME type restrictions to profiles bucket
UPDATE storage.buckets 
SET file_size_limit = 5242880,  -- 5MB in bytes
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
WHERE name = 'profiles';