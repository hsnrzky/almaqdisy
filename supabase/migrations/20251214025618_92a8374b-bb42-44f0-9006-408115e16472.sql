-- Add RLS policies for admin_users table
-- Only admins can view the admin list
CREATE POLICY "Only admins can view admin list"
ON public.admin_users FOR SELECT
USING (is_admin(auth.uid()));

-- Only admins can insert new admins
CREATE POLICY "Only admins can add admins"
ON public.admin_users FOR INSERT
WITH CHECK (is_admin(auth.uid()));

-- Only admins can delete admins
CREATE POLICY "Only admins can remove admins"
ON public.admin_users FOR DELETE
USING (is_admin(auth.uid()));