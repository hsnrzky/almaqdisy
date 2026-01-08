-- Drop the admin-only policy we just created
DROP POLICY IF EXISTS "Only admins can view site settings" ON public.site_settings;

-- Create a more nuanced policy:
-- Public users can ONLY read maintenance_mode setting
-- All other settings require admin access
CREATE POLICY "Public can view maintenance mode only" 
ON public.site_settings 
FOR SELECT 
USING (key = 'maintenance_mode');

-- Admins can view all settings
CREATE POLICY "Admins can view all site settings" 
ON public.site_settings 
FOR SELECT 
USING (is_admin(auth.uid()));