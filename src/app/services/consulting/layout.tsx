import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Consultanță imobiliară | BESTINVEST CAMIMOB Buzău',
  description:
    'Servicii de consultanță imobiliară în Buzău oferite de BESTINVEST CAMIMOB pentru cumpărători, vânzători și investitori.',
  alternates: {
    canonical: '/services/consulting',
  },
};

export default function ConsultingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
