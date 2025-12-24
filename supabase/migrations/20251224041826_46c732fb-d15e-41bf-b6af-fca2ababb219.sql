-- Add can_manage_team column to profiles
ALTER TABLE public.profiles ADD COLUMN can_manage_team boolean NOT NULL DEFAULT false;

-- Drop existing restrictive policies for team_members INSERT/UPDATE/DELETE
DROP POLICY IF EXISTS "Admins can insert team members" ON public.team_members;
DROP POLICY IF EXISTS "Admins can update team members" ON public.team_members;
DROP POLICY IF EXISTS "Admins can delete team members" ON public.team_members;

-- Create new policies that allow users with can_manage_team permission
CREATE POLICY "Authorized users can insert team members" 
ON public.team_members 
FOR INSERT 
WITH CHECK (
  is_admin(auth.uid()) OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND can_manage_team = true)
);

CREATE POLICY "Authorized users can update team members" 
ON public.team_members 
FOR UPDATE 
USING (
  is_admin(auth.uid()) OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND can_manage_team = true)
);

CREATE POLICY "Authorized users can delete team members" 
ON public.team_members 
FOR DELETE 
USING (
  is_admin(auth.uid()) OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND can_manage_team = true)
);