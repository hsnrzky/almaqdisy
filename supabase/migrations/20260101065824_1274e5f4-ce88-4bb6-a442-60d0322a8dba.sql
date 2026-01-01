-- Drop existing restrictive policies for team_members
DROP POLICY IF EXISTS "Anyone can view team members" ON public.team_members;
DROP POLICY IF EXISTS "Authorized users can delete team members" ON public.team_members;
DROP POLICY IF EXISTS "Authorized users can insert team members" ON public.team_members;
DROP POLICY IF EXISTS "Authorized users can update team members" ON public.team_members;

-- Recreate policies as PERMISSIVE (default) instead of RESTRICTIVE
CREATE POLICY "Anyone can view team members" 
ON public.team_members 
FOR SELECT 
TO public
USING (true);

CREATE POLICY "Authorized users can insert team members" 
ON public.team_members 
FOR INSERT 
TO authenticated
WITH CHECK (
  is_admin(auth.uid()) OR 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.can_manage_team = true
  )
);

CREATE POLICY "Authorized users can update team members" 
ON public.team_members 
FOR UPDATE 
TO authenticated
USING (
  is_admin(auth.uid()) OR 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.can_manage_team = true
  )
);

CREATE POLICY "Authorized users can delete team members" 
ON public.team_members 
FOR DELETE 
TO authenticated
USING (
  is_admin(auth.uid()) OR 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.can_manage_team = true
  )
);