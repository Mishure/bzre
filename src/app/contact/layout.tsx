import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact | BESTINVEST CAMIMOB - Agenție Imobiliară Buzău',
  description:
    'Contactează BESTINVEST CAMIMOB - agenție imobiliară în Buzău. Telefon, email și adresă pentru apartamente, case, terenuri și spații comerciale.',
  alternates: {
    canonical: '/contact',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
