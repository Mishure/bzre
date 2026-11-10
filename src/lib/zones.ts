/**
 * Single source of truth for Buzău zones.
 *
 * This list used to be copy-pasted in five places that drifted apart: the
 * admin "add property" dropdown carried 29 zones while the three public
 * filters carried 15, so zones that were perfectly enterable in admin
 * (Micro 14, Micro 21, Brosteni, Dorobanti 1/2, …) could never be filtered
 * by a visitor. Import from here instead of re-declaring.
 *
 * Note that `Property.zone` is a free-text column — the admin edit form uses
 * a plain input, and imported listings bring their own spellings. Anything
 * matching on zone should normalize and compare loosely (see
 * `normalizeText` in lib/seoPages.ts) rather than assume a value from this
 * list.
 */
export const BUZAU_ZONES = [
  'Centru',
  'Micro 3',
  'Micro 4',
  'Micro 5',
  'Micro 6',
  'Micro 14',
  'Micro 21',
  'Unirii',
  'Unirii Sud',
  'Dorobanti',
  'Dorobanti 1',
  'Dorobanti 2',
  'Bdul Bucuresti',
  'Victoriei',
  'Brosteni',
  'Dragaica',
  'Crang',
  'Posta',
  'Marghiloman',
  'Spiru Haret',
  'Balcescu',
  'Episcopiei',
  'Orizont',
  '23 August',
  'Gara',
  'Nord',
  'Sud',
  'Est',
  'Vest',
  'Marginal',
  'Zona Industriala',
] as const;

export type BuzauZone = (typeof BUZAU_ZONES)[number];
