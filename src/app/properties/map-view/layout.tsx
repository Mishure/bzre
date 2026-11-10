import type { Metadata } from 'next';

// map-view shares the /properties filters (query params) but is a distinct
// page. Keep its own canonical so it isn't folded into /properties, while its
// own ?type=/?zone= variants consolidate here.
export const metadata: Metadata = {
  title: 'Hartă proprietăți în Buzău | BESTINVEST CAMIMOB',
  description:
    'Vezi pe hartă toate proprietățile disponibile în Buzău: apartamente, case, terenuri și spații comerciale.',
  alternates: {
    canonical: '/properties/map-view',
  },
};

export default function MapViewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
