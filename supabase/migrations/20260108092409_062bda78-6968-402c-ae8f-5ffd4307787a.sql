-- Drop the authenticated users policy and restrict to admins only
DROP POLICY IF EXISTS "Site settings are viewable by authenticated users" ON public.site_settings;

-- Create admin-only SELECT policy
CREATE POLICY "Only admins can view site settings" 
ON public.site_settings 
FOR SELECT 
USING (is_admin(auth.uid()));