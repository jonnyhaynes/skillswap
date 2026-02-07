-- Neighbourhoods lookup table
-- Provides a single source of truth for valid neighbourhood names

-- ============================================
-- TABLE
-- ============================================

CREATE TABLE public.neighbourhoods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SEED DATA
-- ============================================

INSERT INTO public.neighbourhoods (name) VALUES
  ('Aston cum Aughton'),
  ('Aughton Common'),
  ('Bradgate'),
  ('Bramley'),
  ('Brampton Bierlow'),
  ('Brinsworth'),
  ('Catcliffe'),
  ('Dalton'),
  ('Dinnington'),
  ('East Herringthorpe'),
  ('Eastwood'),
  ('East Dene'),
  ('Firbeck'),
  ('Gildingwells'),
  ('Greasborough'),
  ('Harthill'),
  ('Hellaby'),
  ('Herringthorpe'),
  ('Hooton Levitt'),
  ('Hooton Roberts'),
  ('Kimberworth'),
  ('Kimberworth Park'),
  ('Laughton-en-le-Morthen'),
  ('Kiveton'),
  ('Letwell'),
  ('Maltby'),
  ('Masbrough'),
  ('North Anston'),
  ('South Anston'),
  ('Orgreave'),
  ('Ravenfield'),
  ('Rawmarsh'),
  ('Swallownest'),
  ('Swinton'),
  ('Thorpe Hesley'),
  ('Thorpe Salvin'),
  ('Throapham'),
  ('Thrybergh'),
  ('Thurcroft'),
  ('Todwick'),
  ('Treeton'),
  ('Ulley'),
  ('Wales'),
  ('Waverley'),
  ('Wentworth'),
  ('West Melton'),
  ('Whiston'),
  ('Wickersley'),
  ('Woodall'),
  ('Woodsetts');

-- ============================================
-- INDEX
-- ============================================

CREATE INDEX idx_neighbourhoods_name ON public.neighbourhoods(name);

-- ============================================
-- FOREIGN KEY on profiles
-- ============================================

-- Add a foreign key constraint so profiles.neighbourhood must match
-- a valid entry in the neighbourhoods table.
-- First, ensure existing profiles with 'Unknown' get handled:
INSERT INTO public.neighbourhoods (name)
  SELECT DISTINCT neighbourhood FROM public.profiles
  WHERE neighbourhood NOT IN (SELECT name FROM public.neighbourhoods)
ON CONFLICT (name) DO NOTHING;

ALTER TABLE public.profiles
  ADD CONSTRAINT fk_profiles_neighbourhood
  FOREIGN KEY (neighbourhood) REFERENCES public.neighbourhoods(name);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.neighbourhoods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Neighbourhoods are viewable by everyone"
  ON public.neighbourhoods FOR SELECT
  USING (true);
