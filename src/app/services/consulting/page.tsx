'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  HomeIcon,
  CurrencyEuroIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

export default function ConsultingPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    termsAccepted: false
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setSubmitted(true);
      setIsSubmitting(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
        termsAccepted: false
      });
    }, 1000);
  };

  const services = [
    {
      icon: HomeIcon,
      title: 'Consultanță Cumpărare',
      description: 'Vă ajutăm să găsiți proprietatea perfectă pentru nevoile dvs.'
    },
    {
      icon: CurrencyEuroIcon,
      title: 'Consultanță Vânzare',
      description: 'Strategii optime pentru vânzarea proprietății la cel mai bun preț.'
    },
    {
      icon: DocumentTextIcon,
      title: 'Consultanță Închiriere',
      description: 'Asistență completă pentru închirierea proprietăților.'
    },
    {
      icon: ClipboardDocumentCheckIcon,
      title: 'Analiza Pieței',
      description: 'Rapoarte detaliate despre tendințele pieței imobiliare.'
    }
  ];

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Consultanță Imobiliară
          </h1>
          <p className="text-xl text-gray-600">
            Servicii profesionale de consultanță pentru toate tranzacțiile imobiliare
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {services.map((service, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <service.icon className="h-12 w-12 text-primary-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.title}</h3>
              <p className="text-gray-600 text-sm">{service.description}</p>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-primary-600 text-white text-center py-6">
            <Link href="/" className="text-3xl font-bold hover:text-primary-100 transition-colors">
              <span className="font-normal">BEST</span>INVEST CAM<span className="font-bold">IMOB</span>
            </Link>
          </div>

          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">De ce să alegeți serviciile noastre de consultanță?</h2>
              <div className="space-y-4 text-gray-700">
                <div className="flex items-start space-x-3">
                  <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <p><strong>Experiență de peste 20 de ani</strong> pe piața imobiliară din județul Buzău</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <p><strong>Evaluări profesionale</strong> și analize de piață detaliate</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <p><strong>Consultanță personalizată</strong> adaptată nevoilor dumneavoastră</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <p><strong>Asistență completă</strong> pe tot parcursul tranzacției</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-primary-600 p-6 mb-8">
              <p className="text-gray-700 text-center mb-3 italic">
                Aveți nevoie de consultanță imobiliară profesională? Lăsați un mesaj!
              </p>
              <p className="text-gray-700 text-center italic">
                Un consultant imobiliar vă va contacta în cel mai scurt timp pentru a discuta despre nevoile dvs.
              </p>
            </div>

            {/* Success Message */}
            {submitted && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 flex items-start space-x-3">
                <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-green-800 font-semibold mb-1">Solicitare trimisă cu succes!</h3>
                  <p className="text-green-700 text-sm">
                    Vă mulțumim pentru interes. Un consultant vă va contacta în cel mai scurt timp.
                  </p>
                </div>
              </div>
            )}

            {/* Contact Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Solicitați o consultanță gratuită</h3>
              <p className="text-sm text-red-600 mb-4">* câmpuri obligatorii</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nume complet <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Introduceți numele dvs..."
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+40..."
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Adresa de e-mail <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="adresa@email.com"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Mesaj <span className="text-red-600">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Descrieți pe scurt despre ce tip de consultanță aveți nevoie..."
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                />
              </div>

              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="termsAccepted"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleChange}
                  required
                  className="mt-1 h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="termsAccepted" className="text-sm text-gray-700">
                  <span className="text-red-600">* </span>
                  Sunt de acord cu prelucrarea datelor mele personale și cu{' '}
                  <Link href="/terms" className="text-primary-600 hover:text-primary-700 underline">
                    Termenii și Condițiile
                  </Link>
                </label>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Se trimite...' : 'Trimite solicitare'}
                </button>
              </div>
            </form>

            {/* Agent Info */}
            <div className="mt-12 text-center border-t pt-8">
              <p className="text-gray-600 italic text-lg">
                "Experiență și profesionalism în consultanță imobiliară!"
              </p>
              <p className="text-gray-800 font-semibold mt-2">Carmen's Agency - BESTINVEST CAMIMOB</p>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Înapoi la pagina principală
          </Link>
        </div>
      </div>
    </div>
  );
}
