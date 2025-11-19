-- Add latitude and longitude columns to profiles table for storing birth location coordinates
ALTER TABLE public.profiles 
ADD COLUMN birth_lat DOUBLE PRECISION,
ADD COLUMN birth_lon DOUBLE PRECISION;

COMMENT ON COLUMN public.profiles.birth_lat IS 'Latitude coordinate of birth place';
COMMENT ON COLUMN public.profiles.birth_lon IS 'Longitude coordinate of birth place';