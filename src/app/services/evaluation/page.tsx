'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

export default function EvaluationPage() {
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
              EVALUARE GRATUITĂ IMOBIL
            </h1>
            <p className="text-xl text-center text-primary-600 mb-6">
              by Carmen's Agency!
            </p>

            <div className="bg-blue-50 border-l-4 border-primary-600 p-6 mb-8">
              <p className="text-gray-700 text-center mb-3 italic">
                Solicitați o evaluare gratuită, în vederea vânzării sau închirierii unui imobil? Lăsați un mesaj!
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
