'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircleIcon, StarIcon, ShieldCheckIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

export default function ExclusivityPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
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
        message: '',
        termsAccepted: false
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="bg-primary-600 text-white text-center py-6">
            <Link href="/" className="text-3xl font-bold hover:text-primary-100 transition-colors">
              <span className="font-normal">BEST</span>INVEST CAM<span className="font-bold">IMOB</span>
            </Link>
          </div>

          <div className="p-8">
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-4">
              EXCLUSIVITATE
            </h1>
            <p className="text-xl text-center text-primary-600 mb-8">
              by Carmen's Agency!
            </p>

            {/* Why is it important */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
                DE CE ESTE IMPORTANT?
              </h2>
              <p className="text-gray-700 text-justify mb-6">
                Dacă v-ați hotărât să vindeți apartamentul printr-o agenție imobiliară, sigur v-ați pus întrebarea:
                să alegi un anunț imobiliar exclusiv sau să colaborezi cu mai multe agenții?
              </p>

              <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-6 mb-6">
                <div className="flex items-center space-x-3 mb-3">
                  <StarIcon className="h-8 w-8 text-primary-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Contractul de Exclusivitate</h3>
                </div>
                <p className="text-gray-700">
                  Contractul de exclusivitate se încheie între client și agenția imobiliară și presupune
                  acordarea exclusivă a dreptului de reprezentare în cazul unei vânzări, închirierii sau
                  chiar cumpărări.
                </p>
              </div>
            </div>

            {/* Agency Role */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
                CE ROL ARE AGENȚIA IMOBILIARĂ?
              </h2>
              <p className="text-gray-700 text-justify mb-4">
                Vânzarea sau închirierea unor imobile necesită timp, bani, energie și eforturi mari din
                partea proprietarilor acestora. Printr-un contract de exclusivitate, agenția imobiliară
                poate propune o serie de acțiuni care pot duce la o vânzare mai rapidă a locuinței.
              </p>

              <div className="bg-blue-50 border-l-4 border-primary-600 p-6 mb-6">
                <p className="text-gray-700">
                  În cazul contractelor de exclusivitate, Agenția Imobiliară <strong>BESTINVEST CAMIMOB</strong> te
                  reprezintă numai pe tine, pe tot parcursul procesului de vânzare-cumpărare, asigurând
                  reprezentarea ta și a imobilului tău în relație cu ceilalți clienți.
                </p>
              </div>

              <p className="text-gray-700 text-justify mb-4">
                De asemenea, un agent imobiliar profesionist se va ocupa de conceperea și promovarea ofertei
                dumneavoastră, precum și de relația cu potențialii clienți. Ofertele exclusive au un regim
                special. Tocmai din acest motiv veți colabora cu un consultant dedicat care se va ocupa de
                oferta exclusivă până la finalizarea vânzării.
              </p>

              <p className="text-gray-700 text-justify mb-4">
                Proprietarii care apelează la pachetul de exclusivitate pot să finalizeze o tranzacție rapid
                și în cele mai bune condiții date de contextul pieței.
              </p>

              <p className="text-gray-700 text-justify">
                În imobiliare promovarea determină interesul pentru o proprietate. De aceea prezentarea vizuală
                este un instrument esențial de vânzare. De regulă, proprietarul, cât și cumpărătorul, vor
                beneficia de serviciile de consiliere a cumpărătorului, oferite de un consultant imobiliar
                profesionist. Acesta cunoaște toate detaliile legate de imobil.
              </p>
            </div>

            {/* Advantages */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
                AVANTAJUL CONTRACTULUI DE EXCLUSIVITATE
              </h2>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <p className="text-gray-700">
                    Imobilul tău va beneficia de cele mai bune campanii de promovare
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <p className="text-gray-700">
                    Veți avea parte de susținere și veți fi reprezentați fără rezerve în negocieri
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <p className="text-gray-700">
                    Veți avea parte de servicii post-vânzare sau post-închiriere
                  </p>
                </div>
              </div>
            </div>

            {/* Contract Details */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
                CONTRACTUL DE EXCLUSIVITATE
              </h2>

              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-6 mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <ShieldCheckIcon className="h-8 w-8 text-amber-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Responsabilitate și Investiție</h3>
                </div>
                <p className="text-gray-700 mb-4">
                  Pe noi ca și agenție, contractul de exclusivitate ne motivează. Ne încarcă cu o mare
                  responsabilitate, și nu în ultimul rând ne obligă să investim.
                </p>
                <p className="text-gray-700">
                  Din punct de vedere financiar pentru promovarea și publicitatea prin canalele proprii
                  (în site-ul propriu, în canalele media), cât și canalele partenere (site-uri locale,
                  ziare locale, altele); lucruri ce duc la vânzarea sau închirierea imobilului dumneavoastră.
                </p>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <ChartBarIcon className="h-8 w-8 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Prioritate și Evaluare</h3>
                </div>
                <p className="text-gray-700 mb-4">
                  Exclusivitatea ofertei de vânzare implică prioritate în prezentarea acesteia către
                  toți potențialii cumpărători.
                </p>
                <p className="text-gray-700">
                  Agentul imobiliar ar putea evalua proprietatea. Mai mult, v-ar putea sfătui în privința
                  obținerii unui preț real de vânzare.
                </p>
              </div>
            </div>

            {/* Call to Action */}
            <div className="bg-blue-50 border-l-4 border-primary-600 p-6 mb-8">
              <p className="text-gray-700 text-center mb-3 italic">
                Solicitați inițierea unui demers pentru exclusivitate? Lăsați un mesaj!
              </p>
              <p className="text-gray-700 text-center italic">
                Un agent imobiliar vă va contacta, după trimiterea formularului, în cel mai scurt timp!
              </p>
            </div>

            {/* Success Message */}
            {submitted && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 flex items-start space-x-3">
                <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-green-800 font-semibold mb-1">Solicitare trimisă cu succes!</h3>
                  <p className="text-green-700 text-sm">
                    Vă mulțumim pentru solicitare. Un agent imobiliar vă va contacta în cel mai scurt timp.
                  </p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <p className="text-sm text-red-600">* câmpuri obligatorii</p>

              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Numele Dvs. <span className="text-red-600">*</span>
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

              {/* Email Field */}
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

              {/* Message Field */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Mesaj <span className="text-red-600">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Mesajul Dvs. (inclusiv, numărul Dvs. de telefon)..."
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                />
              </div>

              {/* Terms Checkbox */}
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
                  Sunt de acord cu prelucrarea datelor mele personale, mai sus solicitate, cu Termenii și Condițiile de Utilizare și cu Politica privind Protecția Datelor cu Caracter Personal.{' '}
                  <Link href="/terms" className="text-primary-600 hover:text-primary-700 underline">
                    CITEȘTE TERMENI ȘI CONDIȚII
                  </Link>
                </label>
              </div>

              {/* Submit Button */}
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
              <div className="mb-4">
                <div className="w-32 h-32 mx-auto bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-5xl text-primary-600 font-bold">C</span>
                </div>
              </div>
              <p className="text-gray-600 italic text-lg">
                "Mândră să fiu prezentă de 20 de ani pe piața imobiliară din județul Buzău!"
              </p>
              <p className="text-gray-800 font-semibold mt-2">Carmen's Agency</p>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center">
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
