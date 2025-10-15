'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircleIcon,
  CurrencyEuroIcon,
  HomeIcon,
  KeyIcon,
  QuestionMarkCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export default function CommissionsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
        message: ''
      });
    }, 1000);
  };

  const questions = [
    'Cât înseamnă comisionul unei agenții imobiliare pentru vânzător?',
    'Care este comisionul agenției imobiliare la închirieri?',
    'Când se plătește comisionul agenției imobiliare?',
    'Se plătește comision agenției imobiliare și la cumpărarea unui apartament?',
    'Ce specificații are mai exact contractul de comision al unei agenții imobiliare, ce implică acesta?'
  ];

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="bg-primary-600 text-white text-center py-6">
            <Link href="/" className="text-3xl font-bold hover:text-primary-100 transition-colors">
              <span className="font-normal">BEST</span>INVEST CAM<span className="font-bold">IMOB</span>
            </Link>
          </div>

          <div className="p-8">
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-4">
              COMISIOANE
            </h1>
            <p className="text-xl text-center text-primary-600 mb-8">
              Carmen's Agency!
            </p>

            {/* Introduction */}
            <div className="mb-8">
              <p className="text-gray-700 text-justify mb-6">
                Experiența ne spune că e mult mai eficient să lași specialiștii să se ocupe de tot atunci când
                îți dorești să vinzi / cumperi / închiriezi un imobil sau un teren. E vorba în primul rând de
                timpul alocat sarcinii și de bătaia de cap pe care o poți evita cu ușurință. Beneficiezi în
                primul rând de avantajele pe care le are consultanța pe care ți-o oferă un agent imobiliar cu
                experiență.
              </p>
              <p className="text-gray-700 text-justify font-semibold">
                Subiectul este însă: comisionul agenției imobiliare.
              </p>
            </div>

            {/* Questions */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <QuestionMarkCircleIcon className="h-8 w-8 text-primary-600" />
                <h2 className="text-xl font-bold text-primary-600">
                  Întrebări legate de comisioanele care se plătesc unei agenții imobiliare:
                </h2>
              </div>
              <ul className="space-y-2">
                {questions.map((question, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <span className="text-primary-600 font-bold mt-1">•</span>
                    <span className="text-gray-700">{question}</span>
                  </li>
                ))}
                <li className="flex items-start space-x-3">
                  <span className="text-primary-600 font-bold mt-1">•</span>
                  <span className="text-gray-700">În cele ce urmează vom găsi răspunsul la fiecare dintre aceste întrebări.</span>
                </li>
              </ul>
            </div>

            {/* Who pays */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-primary-600 mb-4">
                Cine plătește comisionul agenției imobiliare?
              </h2>
              <p className="text-gray-700 text-justify mb-4">
                De la început trebuie să spunem că atât vânzătorul, cât și cumpărătorul se lovesc de comisionul
                agenției imobiliare. Serviciile pe care agenția le oferă sunt diferite.
              </p>
              <p className="text-gray-700 text-justify mb-4">
                Pe de o parte se ocupă cu promovarea online și offline a imobilului pus la vânzare, iar pe
                cealaltă parte ține cont de nevoile persoanei interesate și o pune la curent cu ce a mai aflat
                referitor la cererea sa.
              </p>
              <p className="text-gray-700 text-justify">
                Cumpărătorul are beneficiile sale, chiar dacă vânzătorul pare la o primă vedere mai câștigat.
              </p>
            </div>

            {/* When to pay */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <ClockIcon className="h-7 w-7 text-primary-600" />
                <h2 className="text-xl font-bold text-primary-600">
                  Când se plătește comisionul datorat agenției imobiliare?
                </h2>
              </div>
              <p className="text-gray-700 text-justify mb-4">
                În contractul de comision al agenției imobiliare, pe care solicitantul serviciilor îl va semna
                chiar la începutul colaborării, scrie negru pe alb că plata se face la momentul finalizării
                tranzacției dorite.
              </p>
              <div className="bg-green-50 border-l-4 border-green-500 p-6 mb-4">
                <p className="text-gray-700 mb-3">
                  <strong>Toate etapele pe care le facem intră în preț.</strong> Veți ști detaliile din primul moment,
                  motiv pentru care nu există șansa unor costuri ascunse. Transparența e la ea acasă.
                </p>
                <p className="text-gray-700">
                  Vânzătorii pot sta liniștiți pentru că vor achita abia atunci când banii în urma tranzacției
                  le ajung în cont.
                </p>
              </div>
              <p className="text-gray-700 text-justify">
                În plus, anumite agenții oferă bonusuri clienților săi. Agenția <strong>BESTINVEST CAMIMOB</strong> are,
                spre exemplu, <strong>consultanța gratuită</strong> pentru beneficiarii săi (cu privire la preț sau
                orice altceva) pe tot parcursul colaborării.
              </p>
            </div>

            {/* Commission rates */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <CurrencyEuroIcon className="h-7 w-7 text-primary-600" />
                <h2 className="text-xl font-bold text-primary-600">
                  Ce comision percepe o agenție imobiliară?
                </h2>
              </div>
              <p className="text-gray-700 text-justify mb-6">
                Interesant este că diferă comisionul în funcție de agenția imobiliară la care se apelează.
                Poate că nu avem noi cele mai mici comisioane posibile, dar te asigurăm că îți vom duce treaba
                la bun sfârșit într-un mod eficient.
              </p>

              {/* Pricing table */}
              <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl p-6">
                <h3 className="text-2xl font-bold text-center text-gray-900 mb-6">
                  PENTRU PROPRIETĂȚI DIN BUZĂU
                </h3>

                {/* Sales under 100k */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <HomeIcon className="h-6 w-6 text-green-600" />
                    <h4 className="text-xl font-bold text-gray-900">Vânzări sub 100.000 RON</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Comision proprietar</p>
                      <p className="text-2xl font-bold text-green-600">2.000 lei</p>
                      <p className="text-xs text-gray-500">taxă fixă</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Comision cumpărător</p>
                      <p className="text-2xl font-bold text-blue-600">2.000 lei</p>
                      <p className="text-xs text-gray-500">taxă fixă</p>
                    </div>
                  </div>
                </div>

                {/* Sales over 100k */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <HomeIcon className="h-6 w-6 text-primary-600" />
                    <h4 className="text-xl font-bold text-gray-900">Vânzări peste 100.000 RON</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-primary-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Comision proprietar</p>
                      <p className="text-2xl font-bold text-primary-600">2%</p>
                      <p className="text-xs text-gray-500">din valoarea tranzacției</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Comision cumpărător</p>
                      <p className="text-2xl font-bold text-blue-600">2%</p>
                      <p className="text-xs text-gray-500">din valoarea tranzacției</p>
                    </div>
                  </div>
                </div>

                {/* Rentals */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <KeyIcon className="h-6 w-6 text-amber-600" />
                    <h4 className="text-xl font-bold text-gray-900">Închirieri</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-amber-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Comision proprietar</p>
                      <p className="text-xl font-bold text-amber-600">50% din valoarea chiriei</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Comision chiriaș (rezidențial)</p>
                      <p className="text-xl font-bold text-orange-600">50% din valoarea chiriei</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Comision chiriaș (comercial)</p>
                      <p className="text-xl font-bold text-red-600">50% din valoarea chiriei</p>
                    </div>
                  </div>
                </div>

                {/* VAT notice */}
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    <strong>TVA în valoare de 19% este inclus</strong> în toate tarifele de mai sus
                  </p>
                </div>
              </div>
            </div>

            {/* Price vs Cost */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-primary-600 mb-4">
                Ce contează mai mult pentru tine: Prețul sau Costul final?
              </h2>
              <div className="bg-amber-50 border-l-4 border-amber-500 p-6">
                <p className="text-gray-700 mb-4">
                  De regulă, tindem să credem că un cost mai mic înseamnă mai bine, mai mulți bani rămași în
                  buzunarul nostru. <strong>Însă nu este mereu așa.</strong>
                </p>
                <p className="text-gray-700">
                  Câteodată, a strânge buzunarul, a te zgârci la preț, te face să înregistrezi per total un cost
                  mai mare decât te așteptai inițial. Vei pierde timp suplimentar, vei depune mai mult efort,
                  te vei stresa și enerva mult mai mult decât dacă ai fi plătit pe cei mai buni să se ocupe de
                  tranzacția imobiliară dorită.
                </p>
              </div>
            </div>

            {/* Success Message */}
            {submitted && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 flex items-start space-x-3">
                <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-green-800 font-semibold mb-1">Mesaj trimis cu succes!</h3>
                  <p className="text-green-700 text-sm">
                    Vă mulțumim pentru mesaj. Vă vom contacta în cel mai scurt timp.
                  </p>
                </div>
              </div>
            )}

            {/* Contact Form */}
            <div className="border-t pt-8">
              <p className="text-gray-600 italic text-center mb-6">
                Dorești să te contactăm, pentru a primi mai multe informații? Lasă un mesaj!
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Contact Info */}
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <svg className="h-6 w-6 text-primary-600 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900">Adresă</p>
                      <p className="text-gray-600">Buzău, România</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <svg className="h-6 w-6 text-primary-600 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900">Telefon</p>
                      <p className="text-gray-600">+40 773 723 654</p>
                      <p className="text-sm text-gray-500">Luni - Vineri: 09:00 - 18:00</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <svg className="h-6 w-6 text-primary-600 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <p className="text-gray-600">bestinvest.2005@gmail.com</p>
                    </div>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Numele Dvs. ..."
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Adresa Dvs. de e-mail ..."
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Mesajul Dvs. ..."
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Se trimite...' : 'Trimite'}
                  </button>
                </form>
              </div>
            </div>

            {/* Partners */}
            <div className="mt-8 text-center border-t pt-6">
              <p className="text-gray-600 mb-3">Parteneri:</p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <a href="https://imobiliarebuzau.storia.ro" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 underline">
                  Anunțuri promovate - Platforma STORIA.RO
                </a>
                <span className="text-gray-400">|</span>
                <a href="https://www.imobiliare.ro/agentii/buzau/X7GM" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 underline">
                  Anunțuri promovate - Platforma IMOBILIARE.RO
                </a>
              </div>
            </div>

            {/* Agent Info */}
            <div className="mt-8 text-center border-t pt-8">
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
