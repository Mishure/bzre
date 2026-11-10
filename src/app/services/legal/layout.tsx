import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Asistență juridică imobiliară | BESTINVEST CAMIMOB Buzău',
  description:
    'Asistență juridică pentru tranzacții imobiliare în Buzău oferită de BESTINVEST CAMIMOB - acte, contracte și verificări.',
  alternates: {
    canonical: '/services/legal',
  },
};

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
