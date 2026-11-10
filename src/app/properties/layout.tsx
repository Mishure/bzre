import type { Metadata } from 'next';

// Self-referencing canonical for the whole /properties route.
// The listing filters live in query params (?type=, ?zone=, ?operation=, ...)
// which serve the same page, so we point every variant back to /properties.
// This resolves GSC's "Duplicate without user-selected canonical" for URLs
// like /properties?type=SPATIU_COMERCIAL.
export const metadata: Metadata = {
  title: 'Proprietăți de vânzare și de închiriat în Buzău | BESTINVEST CAMIMOB',
  description:
    'Toate proprietățile disponibile în Buzău: apartamente, case, terenuri și spații comerciale de vânzare și de închiriat.',
  alternates: {
    canonical: '/properties',
  },
};

export default function PropertiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
