/**
 * Static fallback list of neighbourhoods.
 *
 * Primary sources (in priority order):
 *   1. OS Names API — live typeahead search for any place in Great Britain
 *   2. Supabase `neighbourhoods` table — stores places users have selected
 *   3. This array — offline/fallback only
 *
 * This list is used when both the API and database are unreachable.
 * It does NOT need to be kept in sync — the database is the source of truth.
 */
export const NEIGHBOURHOODS = [
  'Aston cum Aughton',
  'Aughton Common',
  'Bradgate',
  'Bramley',
  'Brampton Bierlow',
  'Brinsworth',
  'Catcliffe',
  'Dalton',
  'Dinnington',
  'East Dene',
  'East Herringthorpe',
  'Eastwood',
  'Firbeck',
  'Gildingwells',
  'Greasborough',
  'Harthill',
  'Hellaby',
  'Herringthorpe',
  'Hooton Levitt',
  'Hooton Roberts',
  'Kimberworth',
  'Kimberworth Park',
  'Kiveton',
  'Laughton-en-le-Morthen',
  'Letwell',
  'Maltby',
  'Masbrough',
  'North Anston',
  'Orgreave',
  'Ravenfield',
  'Rawmarsh',
  'South Anston',
  'Swallownest',
  'Swinton',
  'Thorpe Hesley',
  'Thorpe Salvin',
  'Throapham',
  'Thrybergh',
  'Thurcroft',
  'Todwick',
  'Treeton',
  'Ulley',
  'Wales',
  'Waverley',
  'Wentworth',
  'West Melton',
  'Whiston',
  'Wickersley',
  'Woodall',
  'Woodsetts',
] as const;

export type Neighbourhood = typeof NEIGHBOURHOODS[number];
