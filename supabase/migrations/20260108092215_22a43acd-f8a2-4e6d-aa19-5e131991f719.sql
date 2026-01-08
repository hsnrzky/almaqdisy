-- Fix profiles table: Only allow users to view their own profile (already exists, but let's ensure email is protected)
-- The current policy "Users can view own profile" already restricts to auth.uid() = id, so this is actually fine

-- Fix site_settings: Restrict SELECT to authenticated users only
-- First, drop the existing public read policy
DROP POLICY IF EXISTS "Site settings are viewable by everyone" ON public.site_settings;

-- Create new policy for authenticated users only
CREATE POLICY "Site settings are viewable by authenticated users" 
ON public.site_settings 
FOR SELECT 
USING (auth.uid() IS NOT NULL);