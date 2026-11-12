import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  ScaleIcon,
  StarIcon,
  CurrencyEuroIcon,
  MapIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';

// The "Servicii" item in the header menu points at /services, which had no
// page and returned 404. This is the hub it was always meant to open, and it
// doubles as the internal-link source for the two service landing pages.
export const metadata: Metadata = {
  title: 'Servicii imobiliare în Buzău | BESTINVEST CAMIMOB',
  description:
    'Serviciile BESTINVEST CAMIMOB în Buzău: intermediere tranzacții, evaluare, consultanță, consiliere juridică, cadastru și intabulare, certificat de performanță energetică.',
  alternates: {
    canonical: '/services',
  },
};

const services = [
  {
    href: '/services/evaluation',
    icon: ChartBarIcon,
    name: 'Evaluare proprietate',
    description:
      'Evaluare recunoscută de bănci și estimare realistă a prețului de piață pentru imobilul tău.',
  },
  {
    href: '/services/consulting',
    icon: ChatBubbleLeftRightIcon,
    name: 'Consultanță imobiliară',
    description:
      'Îndrumare pe tot parcursul tranzacției, de la stabilirea bugetului până la predarea cheilor.',
  },
  {
    href: '/services/legal',
    icon: ScaleIcon,
    name: 'Consiliere juridică',
    description:
      'Verificarea actelor și asistență juridică până la semnarea la notar.',
  },
  {
    href: '/services/exclusivity',
    icon: StarIcon,
    name: 'Contract de exclusivitate',
    description:
      'Promovare dedicată și un singur punct de contact pentru vânzarea proprietății tale.',
  },
  {
    href: '/services/commissions',
    icon: CurrencyEuroIcon,
    name: 'Comisioane',
    description:
      'Structura comisioanelor noastre, comunicată transparent înainte de orice vizionare.',
  },
  {
    href: '/cadastru-si-intabulare-buzau',
    icon: MapIcon,
    name: 'Cadastru și intabulare',
    description:
      'Măsurători, documentație cadastrală și înscriere în cartea funciară, până la extrasul de carte funciară.',
  },
  {
    href: '/certificat-energetic-buzau',
    icon: BoltIcon,
    name: 'Certificat energetic (CPE)',
    description:
      'Certificat de performanță energetică prin auditor atestat, plus proiectele tehnice pentru renovare și finanțare.',
  },
];

export default function ServicesPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-600">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-primary-600">
                Acasă
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-gray-900 font-medium" aria-current="page">
              Servicii
            </li>
          </ol>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Serviciile BESTINVEST CAMIMOB
          </h1>
          <p className="text-lg text-gray-700 leading-relaxed max-w-3xl">
            Pe lângă intermedierea tranzacțiilor imobiliare, acoperim și
            documentele tehnice de care ai nevoie în jurul lor: cadastru și
            intabulare, certificat de performanță energetică, evaluare pentru
            bancă și asistență juridică. Pentru tine, asta înseamnă un singur
            interlocutor de la prima discuție până la semnarea la notar.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {services.map((service) => (
            <Link
              key={service.href}
              href={service.href}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-transparent hover:border-primary-200"
            >
              <service.icon className="h-10 w-10 text-primary-600 mb-4" />
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                {service.name}
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed">
                {service.description}
              </p>
            </Link>
          ))}
        </div>

        <section className="bg-primary-50 border border-primary-200 rounded-xl p-6 md:p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            Nu ești sigur de ce ai nevoie?
          </h2>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            Spune-ne ce imobil ai și ce vrei să faci cu el, iar un consultant
            CAMIMOB îți spune exact ce documente îți trebuie, în ce ordine și
            cât durează fiecare.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Contactează-ne
            </Link>
            <Link
              href="/properties"
              className="inline-block bg-white text-primary-700 border border-primary-300 px-6 py-3 rounded-lg hover:bg-primary-50 transition-colors font-medium"
            >
              Vezi proprietățile
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
