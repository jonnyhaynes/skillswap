-- Neighbourhoods lookup table
-- Provides a single source of truth for valid neighbourhood names

-- ============================================
-- TABLE
-- ============================================

CREATE TABLE public.neighbourhoods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SEED DATA
-- ============================================

INSERT INTO public.neighbourhoods (name, latitude, longitude) VALUES
  ('Aston cum Aughton', 53.3547, -1.2862),
  ('Aughton Common', 53.3500, -1.2700),
  ('Bradgate', 53.3700, -1.2300),
  ('Bramley', 53.4250, -1.3530),
  ('Brampton Bierlow', 53.4700, -1.3600),
  ('Brinsworth', 53.4080, -1.3470),
  ('Catcliffe', 53.4050, -1.3620),
  ('Dalton', 53.4880, -1.3020),
  ('Dinnington', 53.3660, -1.2130),
  ('East Herringthorpe', 53.4200, -1.3280),
  ('Eastwood', 53.4340, -1.3650),
  ('East Dene', 53.4260, -1.3450),
  ('Firbeck', 53.3580, -1.1920),
  ('Gildingwells', 53.3540, -1.1800),
  ('Greasborough', 53.4580, -1.3700),
  ('Harthill', 53.3530, -1.2400),
  ('Hellaby', 53.3930, -1.2730),
  ('Herringthorpe', 53.4180, -1.3300),
  ('Hooton Levitt', 53.3850, -1.2560),
  ('Hooton Roberts', 53.4580, -1.3200),
  ('Kimberworth', 53.4450, -1.3750),
  ('Kimberworth Park', 53.4500, -1.3850),
  ('Laughton-en-le-Morthen', 53.3720, -1.2300),
  ('Kiveton', 53.3400, -1.2400),
  ('Letwell', 53.3550, -1.1700),
  ('Maltby', 53.3870, -1.2500),
  ('Masbrough', 53.4400, -1.3700),
  ('North Anston', 53.3420, -1.2100),
  ('South Anston', 53.3300, -1.2100),
  ('Orgreave', 53.3980, -1.3500),
  ('Ravenfield', 53.4530, -1.3050),
  ('Rawmarsh', 53.4600, -1.3700),
  ('Swallownest', 53.3800, -1.2900),
  ('Swinton', 53.4800, -1.3700),
  ('Thorpe Hesley', 53.4650, -1.4100),
  ('Thorpe Salvin', 53.3500, -1.1850),
  ('Throapham', 53.3600, -1.1900),
  ('Thrybergh', 53.4400, -1.3100),
  ('Thurcroft', 53.3750, -1.2200),
  ('Todwick', 53.3480, -1.2200),
  ('Treeton', 53.3950, -1.3350),
  ('Ulley', 53.3900, -1.3100),
  ('Wales', 53.3380, -1.2350),
  ('Waverley', 53.3900, -1.3200),
  ('Wentworth', 53.4750, -1.4000),
  ('West Melton', 53.4750, -1.3800),
  ('Whiston', 53.3990, -1.3050),
  ('Wickersley', 53.4100, -1.2900),
  ('Woodall', 53.3450, -1.1600),
  ('Woodsetts', 53.3600, -1.1700);

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
