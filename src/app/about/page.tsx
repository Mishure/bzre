import Image from 'next/image';
import Link from 'next/link';
import { CheckCircleIcon, UsersIcon, HomeIcon, StarIcon } from '@heroicons/react/24/outline';

export default function AboutPage() {
  const stats = [
    { label: 'Ani de experiență', value: '20+' },
    { label: 'Proprietăți vândute', value: '500+' },
    { label: 'Clienți mulțumiți', value: '1000+' },
    { label: 'Agenți profesioniști', value: '10' }
  ];
  
  const values = [
    {
      icon: CheckCircleIcon,
      title: 'Transparență totală',
      description: 'Oferim informații clare și complete despre fiecare proprietate, fără costuri ascunse.'
    },
    {
      icon: UsersIcon,
      title: 'Orientare către client',
      description: 'Punem nevoile clienților pe primul loc și oferim soluții personalizate pentru fiecare.'
    },
    {
      icon: HomeIcon,
      title: 'Expertiză locală',
      description: 'Cunoaștem în detaliu piața imobiliară din Buzău și vă ghidăm către cele mai bune decizii.'
    },
    {
      icon: StarIcon,
      title: 'Servicii premium',
      description: 'Oferim consultanță completă, de la evaluare până la finalizarea tranzacției.'
    }
  ];
  
  const team = [
    {
      name: 'Carmen Otilia',
      role: 'Director General',
      description: 'Cu peste 20 de ani de experiență în domeniul imobiliar.',
      image: '/images/team/carmen.jpg'
    },
    {
      name: 'Carmen Otilia',
      role: 'Manager Vânzări',
      description: 'Specialist în proprietăți rezidențiale și comerciale.',
      image: '/images/team/carmen.jpg'
    },
    {
      name: 'Marian T',
      role: 'Consultant Senior',
      description: 'Expert în evaluări imobiliare și investiții.',
      image: '/images/team/marian.jpg'
    },
    {
      name: 'Carmen Otilia',
      role: 'Agent Imobiliar',
      description: 'Dedicată găsirii casei perfecte pentru fiecare client.',
      image: '/images/team/carmen.jpg'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <section className="relative bg-primary-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Despre BESTINVEST CAMIMOB
            </h1>
            <p className="text-xl lg:text-2xl opacity-90 max-w-3xl mx-auto">
              Partenerul tău de încredere în tranzacțiile imobiliare din Buzău și împrejurimi
            </p>
          </div>
        </div>
      </section>
      
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Povestea noastră
              </h2>
              <p className="text-gray-600 mb-4">
                Fondată în 2005, BESTINVEST CAMIMOB s-a născut din dorința de a oferi servicii imobiliare
                de calitate superioară în județul Buzău. De-a lungul anilor, am crescut organic,
                construind relații solide cu clienții noștri și câștigând încrederea comunității locale.
              </p>
              <p className="text-gray-600 mb-4">
                Misiunea noastră este simplă: să facem procesul de cumpărare, vânzare sau închiriere 
                a unei proprietăți cât mai simplu și plăcut posibil. Ne mândrim cu abordarea noastră 
                personalizată și atenția la detalii care ne diferențiază de competiție.
              </p>
              <p className="text-gray-600">
                Astăzi, suntem una dintre cele mai respectate agenții imobiliare din regiune, 
                cu o echipă dedicată de profesioniști care lucrează neobosit pentru a îndeplini 
                visurile imobiliare ale clienților noștri.
              </p>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative w-96 h-96 rounded-full overflow-hidden shadow-xl border-4 border-primary-600">
                <Image
                  src="/images/profile.png"
                  alt="BESTINVEST CAMIMOB Profile"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Cifre care vorbesc
            </h2>
            <p className="text-xl text-gray-600">
              Rezultatele noastre demonstrează angajamentul față de excelență
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-primary-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Valorile noastre
            </h2>
            <p className="text-xl text-gray-600">
              Principiile care ne ghidează în fiecare zi
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div key={value.title} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                  <value.icon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Echipa noastră
            </h2>
            <p className="text-xl text-gray-600">
              Profesioniști dedicați succesului tău
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member) => (
              <div key={member.name} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="h-48 bg-gray-200 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <UsersIcon className="h-20 w-20 text-gray-400" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-primary-600 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Hai să găsim împreună proprietatea perfectă
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Contactează-ne astăzi pentru o consultanță gratuită
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/properties"
              className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Vezi proprietățile
            </Link>
            <Link
              href="/contact"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
            >
              Contactează-ne
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}