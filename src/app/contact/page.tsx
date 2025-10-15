'use client';

import { useState } from 'react';
import { MapPinIcon, PhoneIcon, EnvelopeIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'general',
    message: ''
  });

  const [gdprConsent, setGdprConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        setSubmitMessage('Mesajul a fost trimis cu succes! Vă vom contacta în curând.');
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: 'general',
          message: ''
        });
        setGdprConsent(false);
      } else {
        setSubmitMessage('A apărut o eroare. Vă rugăm să încercați din nou.');
      }
    } catch (error) {
      setSubmitMessage('A apărut o eroare. Vă rugăm să încercați din nou.');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitMessage(''), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-center">Contactează-ne</h1>
          <p className="text-xl text-center mt-4 opacity-90">
            Suntem aici să te ajutăm să găsești proprietatea perfectă
          </p>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-6">Trimite-ne un mesaj</h2>
              
              {submitMessage && (
                <div className={`mb-6 p-4 rounded-md ${submitMessage.includes('succes') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                  {submitMessage}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Nume complet *
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subiect
                    </label>
                    <select
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="general">Informații generale</option>
                      <option value="buy">Doresc să cumpăr</option>
                      <option value="sell">Doresc să vând</option>
                      <option value="rent">Doresc să închiriez</option>
                      <option value="evaluation">Evaluare proprietate</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-6">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Mesaj *
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  ></textarea>
                </div>

                <div className="mt-6">
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      checked={gdprConsent}
                      onChange={(e) => setGdprConsent(e.target.checked)}
                      className="mt-1 mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      required
                    />
                    <span className="text-sm text-gray-700">
                      Sunt de acord cu prelucrarea datelor mele personale, mai sus solicitate, cu Termenii si Conditiile de Utilizare si cu Politica privind Protectia Datelor cu Caracter Personal.{' '}
                      <a
                        href="/termeni-si-conditii"
                        target="_blank"
                        className="text-primary-600 hover:text-primary-700 underline"
                      >
                        Citește Termeni și Condiții
                      </a>
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !gdprConsent}
                  className="mt-6 w-full bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Se trimite...' : 'Trimite mesajul'}
                </button>
              </form>
            </div>
          </div>
          
          <div>
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-semibold mb-6">Informații de contact</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPinIcon className="h-6 w-6 text-primary-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Adresă</p>
                    <p className="text-gray-600">Blv. Maresal Alexandru Averescu, nr.28</p>
                    <p className="text-gray-600">Buzău, România</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <PhoneIcon className="h-6 w-6 text-primary-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Telefon</p>
                    <p className="text-gray-600">+40 773 723 654</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <EnvelopeIcon className="h-6 w-6 text-primary-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-600">contact@bestinvestcamimob.ro</p>
                    <p className="text-gray-600">info@bestinvestcamimob.ro</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <ClockIcon className="h-6 w-6 text-primary-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Program de lucru</p>
                    <p className="text-gray-600">Luni - Vineri: 09:00 - 18:00</p>
                    <p className="text-gray-600">Sâmbătă: 10:00 - 14:00</p>
                    <p className="text-gray-600">Duminică: Închis</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-primary-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-primary-900 mb-3">
                Programează o vizionare
              </h3>
              <p className="text-primary-700 mb-4">
                Dorești să vezi o proprietate? Contactează-ne pentru a programa o vizionare la momentul potrivit pentru tine.
              </p>
              <a
                href="tel:+40773723654"
                className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
              >
                <PhoneIcon className="h-5 w-5 mr-2" />
                Sună acum
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-12">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2827.5651296854043!2d26.823079315522723!3d45.14911597909841!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40b2f5c5e5c5c5c5%3A0x0!2sBuzău%2C%20România!5e0!3m2!1sro!2sro!4v1635959680000!5m2!1sro!2sro"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
}