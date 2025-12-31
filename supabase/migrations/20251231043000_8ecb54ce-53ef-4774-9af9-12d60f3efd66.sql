-- Fix 1: Update storage deletion policy to separate permissions for gallery vs team photos
-- Drop existing overly permissive policy
DROP POLICY IF EXISTS "Authorized users can delete gallery files" ON storage.objects;

-- Create separate policy for gallery photos (admin or can_upload users)
CREATE POLICY "Authorized users can delete gallery files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'gallery' 
  AND (
    is_admin(auth.uid()) 
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.can_upload = true
    )
  )
);

-- Fix 2: Add explicit immutability policies for activity_logs
CREATE POLICY "Activity logs are immutable - no updates"
ON public.activity_logs FOR UPDATE
USING (false);

CREATE POLICY "Activity logs are immutable - no deletes"
ON public.activity_logs FOR DELETE
USING (false);

-- Fix 3: Add database constraint for Instagram username validation
ALTER TABLE public.team_members 
ADD CONSTRAINT valid_instagram_username 
CHECK (instagram IS NULL OR instagram ~ '^[a-zA-Z0-9._]{1,30}$');