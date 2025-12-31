-- Create site_settings table for maintenance mode and other settings
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings (needed for maintenance check)
CREATE POLICY "Anyone can view site settings"
ON public.site_settings FOR SELECT
USING (true);

-- Only admins can update settings
CREATE POLICY "Only admins can update site settings"
ON public.site_settings FOR UPDATE
USING (is_admin(auth.uid()));

-- Only admins can insert settings
CREATE POLICY "Only admins can insert site settings"
ON public.site_settings FOR INSERT
WITH CHECK (is_admin(auth.uid()));

-- Only admins can delete settings
CREATE POLICY "Only admins can delete site settings"
ON public.site_settings FOR DELETE
USING (is_admin(auth.uid()));

-- Add updated_at trigger
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default maintenance mode setting
INSERT INTO public.site_settings (key, value)
VALUES ('maintenance_mode', '{"enabled": false, "message": "Website sedang dalam perbaikan. Silakan kembali beberapa saat lagi."}'::jsonb);