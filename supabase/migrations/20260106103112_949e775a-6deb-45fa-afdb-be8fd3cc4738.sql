-- Drop existing delete policy and create new one that allows admin to delete
DROP POLICY IF EXISTS "Activity logs are immutable - no deletes" ON public.activity_logs;

CREATE POLICY "Only admins can delete activity logs" 
ON public.activity_logs 
FOR DELETE 
USING (is_admin(auth.uid()));