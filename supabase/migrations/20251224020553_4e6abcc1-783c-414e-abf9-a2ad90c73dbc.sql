-- Drop existing restrictive insert policy
DROP POLICY IF EXISTS "Admins can insert gallery photos" ON public.gallery_photos;

-- Create new policy that allows admins OR users with can_upload permission
CREATE POLICY "Authorized users can insert gallery photos"
ON public.gallery_photos
FOR INSERT
WITH CHECK (
  is_admin(auth.uid()) 
  OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND can_upload = true
  )
);

-- Also add storage policy for gallery bucket to allow users with can_upload permission
DROP POLICY IF EXISTS "Authorized users can upload to gallery" ON storage.objects;

CREATE POLICY "Authorized users can upload to gallery"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'gallery' 
  AND (
    is_admin(auth.uid()) 
    OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND can_upload = true
    )
  )
);