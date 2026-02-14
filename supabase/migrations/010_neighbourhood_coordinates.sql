-- Add latitude/longitude columns to neighbourhoods table
-- Stores WGS84 coordinates for distance calculations

ALTER TABLE public.neighbourhoods
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Seed coordinates for existing neighbourhoods (South Yorkshire)
-- Coordinates are approximate WGS84 lat/lng

UPDATE public.neighbourhoods SET latitude = 53.3547, longitude = -1.2862 WHERE name = 'Aston cum Aughton';
UPDATE public.neighbourhoods SET latitude = 53.3500, longitude = -1.2700 WHERE name = 'Aughton Common';
UPDATE public.neighbourhoods SET latitude = 53.3700, longitude = -1.2300 WHERE name = 'Bradgate';
UPDATE public.neighbourhoods SET latitude = 53.4250, longitude = -1.3530 WHERE name = 'Bramley';
UPDATE public.neighbourhoods SET latitude = 53.4700, longitude = -1.3600 WHERE name = 'Brampton Bierlow';
UPDATE public.neighbourhoods SET latitude = 53.4080, longitude = -1.3470 WHERE name = 'Brinsworth';
UPDATE public.neighbourhoods SET latitude = 53.4050, longitude = -1.3620 WHERE name = 'Catcliffe';
UPDATE public.neighbourhoods SET latitude = 53.4880, longitude = -1.3020 WHERE name = 'Dalton';
UPDATE public.neighbourhoods SET latitude = 53.3660, longitude = -1.2130 WHERE name = 'Dinnington';
UPDATE public.neighbourhoods SET latitude = 53.4200, longitude = -1.3280 WHERE name = 'East Herringthorpe';
UPDATE public.neighbourhoods SET latitude = 53.4340, longitude = -1.3650 WHERE name = 'Eastwood';
UPDATE public.neighbourhoods SET latitude = 53.4260, longitude = -1.3450 WHERE name = 'East Dene';
UPDATE public.neighbourhoods SET latitude = 53.3580, longitude = -1.1920 WHERE name = 'Firbeck';
UPDATE public.neighbourhoods SET latitude = 53.3540, longitude = -1.1800 WHERE name = 'Gildingwells';
UPDATE public.neighbourhoods SET latitude = 53.4580, longitude = -1.3700 WHERE name = 'Greasborough';
UPDATE public.neighbourhoods SET latitude = 53.3530, longitude = -1.2400 WHERE name = 'Harthill';
UPDATE public.neighbourhoods SET latitude = 53.3930, longitude = -1.2730 WHERE name = 'Hellaby';
UPDATE public.neighbourhoods SET latitude = 53.4180, longitude = -1.3300 WHERE name = 'Herringthorpe';
UPDATE public.neighbourhoods SET latitude = 53.3850, longitude = -1.2560 WHERE name = 'Hooton Levitt';
UPDATE public.neighbourhoods SET latitude = 53.4580, longitude = -1.3200 WHERE name = 'Hooton Roberts';
UPDATE public.neighbourhoods SET latitude = 53.4450, longitude = -1.3750 WHERE name = 'Kimberworth';
UPDATE public.neighbourhoods SET latitude = 53.4500, longitude = -1.3850 WHERE name = 'Kimberworth Park';
UPDATE public.neighbourhoods SET latitude = 53.3720, longitude = -1.2300 WHERE name = 'Laughton-en-le-Morthen';
UPDATE public.neighbourhoods SET latitude = 53.3400, longitude = -1.2400 WHERE name = 'Kiveton';
UPDATE public.neighbourhoods SET latitude = 53.3550, longitude = -1.1700 WHERE name = 'Letwell';
UPDATE public.neighbourhoods SET latitude = 53.3870, longitude = -1.2500 WHERE name = 'Maltby';
UPDATE public.neighbourhoods SET latitude = 53.4400, longitude = -1.3700 WHERE name = 'Masbrough';
UPDATE public.neighbourhoods SET latitude = 53.3420, longitude = -1.2100 WHERE name = 'North Anston';
UPDATE public.neighbourhoods SET latitude = 53.3300, longitude = -1.2100 WHERE name = 'South Anston';
UPDATE public.neighbourhoods SET latitude = 53.3980, longitude = -1.3500 WHERE name = 'Orgreave';
UPDATE public.neighbourhoods SET latitude = 53.4530, longitude = -1.3050 WHERE name = 'Ravenfield';
UPDATE public.neighbourhoods SET latitude = 53.4600, longitude = -1.3700 WHERE name = 'Rawmarsh';
UPDATE public.neighbourhoods SET latitude = 53.3800, longitude = -1.2900 WHERE name = 'Swallownest';
UPDATE public.neighbourhoods SET latitude = 53.4800, longitude = -1.3700 WHERE name = 'Swinton';
UPDATE public.neighbourhoods SET latitude = 53.4650, longitude = -1.4100 WHERE name = 'Thorpe Hesley';
UPDATE public.neighbourhoods SET latitude = 53.3500, longitude = -1.1850 WHERE name = 'Thorpe Salvin';
UPDATE public.neighbourhoods SET latitude = 53.3600, longitude = -1.1900 WHERE name = 'Throapham';
UPDATE public.neighbourhoods SET latitude = 53.4400, longitude = -1.3100 WHERE name = 'Thrybergh';
UPDATE public.neighbourhoods SET latitude = 53.3750, longitude = -1.2200 WHERE name = 'Thurcroft';
UPDATE public.neighbourhoods SET latitude = 53.3480, longitude = -1.2200 WHERE name = 'Todwick';
UPDATE public.neighbourhoods SET latitude = 53.3950, longitude = -1.3350 WHERE name = 'Treeton';
UPDATE public.neighbourhoods SET latitude = 53.3900, longitude = -1.3100 WHERE name = 'Ulley';
UPDATE public.neighbourhoods SET latitude = 53.3380, longitude = -1.2350 WHERE name = 'Wales';
UPDATE public.neighbourhoods SET latitude = 53.3900, longitude = -1.3200 WHERE name = 'Waverley';
UPDATE public.neighbourhoods SET latitude = 53.4750, longitude = -1.4000 WHERE name = 'Wentworth';
UPDATE public.neighbourhoods SET latitude = 53.4750, longitude = -1.3800 WHERE name = 'West Melton';
UPDATE public.neighbourhoods SET latitude = 53.3990, longitude = -1.3050 WHERE name = 'Whiston';
UPDATE public.neighbourhoods SET latitude = 53.4100, longitude = -1.2900 WHERE name = 'Wickersley';
UPDATE public.neighbourhoods SET latitude = 53.3450, longitude = -1.1600 WHERE name = 'Woodall';
UPDATE public.neighbourhoods SET latitude = 53.3600, longitude = -1.1700 WHERE name = 'Woodsetts';
