-- Create gallery_photos table
CREATE TABLE public.gallery_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;

-- Public can view all photos
CREATE POLICY "Anyone can view gallery photos" 
ON public.gallery_photos 
FOR SELECT 
USING (true);

-- Create admin_users table for admin access
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Admin check function
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = _user_id
  )
$$;

-- Admins can manage gallery photos
CREATE POLICY "Admins can insert gallery photos" 
ON public.gallery_photos 
FOR INSERT 
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update gallery photos" 
ON public.gallery_photos 
FOR UPDATE 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete gallery photos" 
ON public.gallery_photos 
FOR DELETE 
USING (public.is_admin(auth.uid()));

-- Create storage bucket for gallery
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', true);

-- Storage policies for gallery bucket
CREATE POLICY "Anyone can view gallery images"
ON storage.objects FOR SELECT
USING (bucket_id = 'gallery');

CREATE POLICY "Admins can upload gallery images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'gallery' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete gallery images"
ON storage.objects FOR DELETE
USING (bucket_id = 'gallery' AND public.is_admin(auth.uid()));

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_gallery_photos_updated_at
BEFORE UPDATE ON public.gallery_photos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();