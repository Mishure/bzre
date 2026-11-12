import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Evaluare proprietate | BESTINVEST CAMIMOB Buzău',
  description:
    'Evaluare gratuită și profesionistă a proprietății tale în Buzău cu BESTINVEST CAMIMOB - apartamente, case, terenuri și spații comerciale.',
  alternates: {
    canonical: '/servicii/evaluare-proprietate',
  },
};

export default function EvaluationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
