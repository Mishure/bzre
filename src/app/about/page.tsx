'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CheckCircleIcon, UsersIcon, HomeIcon, StarIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AboutPage() {
  const { t } = useLanguage();
  const stats = [
    { label: t('about.yearsExperience'), value: '20+' },
    { label: t('about.propertiesSold'), value: '500+' },
    { label: t('about.satisfiedClients'), value: '1000+' },
    { label: t('about.professionalAgents'), value: '10' }
  ];

  const values = [
    {
      icon: CheckCircleIcon,
      title: t('about.totalTransparency'),
      description: t('about.totalTransparencyDesc')
    },
    {
      icon: UsersIcon,
      title: t('about.clientOriented'),
      description: t('about.clientOrientedDesc')
    },
    {
      icon: HomeIcon,
      title: t('about.localExpertise'),
      description: t('about.localExpertiseDesc')
    },
    {
      icon: StarIcon,
      title: t('about.premiumServices'),
      description: t('about.premiumServicesDesc')
    }
  ];

  const team = [
    {
      name: 'Alexandru Popescu',
      role: t('about.directorGeneral'),
      description: t('about.teamMember1Desc'),
      image: '/images/team/alexandru.jpg'
    },
    {
      name: 'Maria Ionescu',
      role: t('about.salesManager'),
      description: t('about.teamMember2Desc'),
      image: '/images/team/maria.jpg'
    },
    {
      name: 'Andrei Dumitrescu',
      role: t('about.seniorConsultant'),
      description: t('about.teamMember3Desc'),
      image: '/images/team/andrei.jpg'
    },
    {
      name: 'Elena Popa',
      role: t('about.realEstateAgent'),
      description: t('about.teamMember4Desc'),
      image: '/images/team/elena.jpg'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <section className="relative bg-primary-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              {t('about.title')}
            </h1>
            <p className="text-xl lg:text-2xl opacity-90 max-w-3xl mx-auto">
              {t('about.subtitle')}
            </p>
          </div>
        </div>
      </section>
      
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                {t('about.ourStory')}
              </h2>
              <p className="text-gray-600 mb-4">
                {t('about.ourStoryP1')}
              </p>
              <p className="text-gray-600 mb-4">
                {t('about.ourStoryP2')}
              </p>
              <p className="text-gray-600">
                {t('about.ourStoryP3')}
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
              {t('about.numbersSpeakTitle')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('about.numbersSpeakSubtitle')}
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
              {t('about.ourValues')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('about.ourValuesSubtitle')}
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
              {t('about.ourTeam')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('about.ourTeamSubtitle')}
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