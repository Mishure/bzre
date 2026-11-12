import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contract de exclusivitate | BESTINVEST CAMIMOB Buzău',
  description:
    'Avantajele contractului de exclusivitate cu BESTINVEST CAMIMOB pentru vânzarea proprietății tale în Buzău.',
  alternates: {
    canonical: '/servicii/exclusivitate',
  },
};

export default function ExclusivityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
