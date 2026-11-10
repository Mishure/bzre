import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Listează proprietatea ta | BESTINVEST CAMIMOB',
  description:
    'Adaugă proprietatea ta pe camimob.ro. Vinde sau închiriază apartamente, case, terenuri și spații comerciale în Buzău cu BESTINVEST CAMIMOB.',
  alternates: {
    canonical: '/listeaza-proprietate',
  },
};

export default function ListeazaProprietateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
