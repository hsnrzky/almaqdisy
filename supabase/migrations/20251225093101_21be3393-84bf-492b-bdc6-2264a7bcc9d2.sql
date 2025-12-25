-- Fix storage deletion policy to allow users with can_manage_team permission
-- First drop the existing admin-only delete policy
DROP POLICY IF EXISTS "Admins can delete gallery files" ON storage.objects;

-- Create new policy that allows both admins and users with can_manage_team permission
CREATE POLICY "Authorized users can delete gallery files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'gallery' 
  AND (
    is_admin(auth.uid()) 
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.can_manage_team = true
    )
  )
);