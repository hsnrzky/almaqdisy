-- Add UPDATE policy for admin_users table
CREATE POLICY "Only admins can update admin records"
ON public.admin_users FOR UPDATE
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));