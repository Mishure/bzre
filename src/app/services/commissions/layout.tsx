import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Comisioane | BESTINVEST CAMIMOB - Agenție Imobiliară Buzău',
  description:
    'Structura de comisioane BESTINVEST CAMIMOB pentru tranzacții imobiliare în Buzău.',
  alternates: {
    canonical: '/services/commissions',
  },
};

export default function CommissionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
