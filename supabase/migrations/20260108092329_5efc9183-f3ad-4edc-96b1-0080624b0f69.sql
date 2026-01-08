-- Remove the conflicting public SELECT policy on site_settings
-- Keep only the authenticated users policy
DROP POLICY IF EXISTS "Anyone can view site settings" ON public.site_settings;