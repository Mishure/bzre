import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Termeni și condiții | BESTINVEST CAMIMOB',
  description:
    'Termenii și condițiile de utilizare a site-ului BESTINVEST CAMIMOB - Agenție Imobiliară Buzău.',
  alternates: {
    canonical: '/termeni-si-conditii',
  },
};

export default function TermeniLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
