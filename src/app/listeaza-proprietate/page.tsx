'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'

const propertySubmissionSchema = z.object({
  // Contact Information
  ownerName: z.string().min(2, 'Numele trebuie să aibă minim 2 caractere'),
  phone: z.string().min(10, 'Numărul de telefon trebuie să aibă minim 10 caractere'),
  email: z.string().email('Email invalid'),

  // Property Details
  propertyType: z.enum(['APARTAMENT', 'CASA', 'TEREN', 'SPATIU_COMERCIAL']),
  operationType: z.enum(['VANZARE', 'INCHIRIERE']),

  // Location
  locality: z.string().min(2, 'Localitatea este obligatorie'),
  zone: z.string().min(2, 'Zona este obligatorie'),
  address: z.string().min(5, 'Adresa este obligatorie'),

  // Property Specifications
  surface: z.string().min(1, 'Suprafața este obligatorie'),
  rooms: z.string().optional(),
  floor: z.string().optional(),
  totalFloors: z.string().optional(),

  // Pricing
  estimatedPrice: z.string().min(1, 'Prețul estimat este obligatoriu'),

  // Additional Info
  description: z.string().min(20, 'Descrierea trebuie să aibă minim 20 caractere'),

  // Features/Facilities
  features: z.string().optional(),
})

type PropertySubmissionForm = z.infer<typeof propertySubmissionSchema>

export default function PropertySubmissionPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PropertySubmissionForm>({
    resolver: zodResolver(propertySubmissionSchema),
  })

  const onSubmit = async (data: PropertySubmissionForm) => {
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/property-submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to submit property')
      }

      toast.success('Mulțumim! Cererea dumneavoastră a fost trimisă cu succes. Vă vom contacta în curând!')
      reset()

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch (error) {
      console.error('Error submitting property:', error)
      toast.error('A apărut o eroare. Vă rugăm încercați din nou.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Listează-ți Proprietatea
          </h1>
          <p className="text-lg text-gray-600">
            Completează formularul de mai jos și te vom contacta în cel mai scurt timp pentru o evaluare gratuită și listarea proprietății tale.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white shadow-lg rounded-lg p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Contact Information Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
                Date de Contact
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700 mb-1">
                    Nume complet *
                  </label>
                  <input
                    type="text"
                    id="ownerName"
                    {...register('ownerName')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ion Popescu"
                  />
                  {errors.ownerName && (
                    <p className="mt-1 text-sm text-red-600">{errors.ownerName.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Telefon *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    {...register('phone')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="0740123456"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    {...register('email')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="ion.popescu@email.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Property Type Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
                Tipul Proprietății
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-1">
                    Tip proprietate *
                  </label>
                  <select
                    id="propertyType"
                    {...register('propertyType')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Selectează tipul</option>
                    <option value="APARTAMENT">Apartament</option>
                    <option value="CASA">Casă</option>
                    <option value="TEREN">Teren</option>
                    <option value="SPATIU_COMERCIAL">Spațiu Comercial</option>
                  </select>
                  {errors.propertyType && (
                    <p className="mt-1 text-sm text-red-600">{errors.propertyType.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="operationType" className="block text-sm font-medium text-gray-700 mb-1">
                    Tip operațiune *
                  </label>
                  <select
                    id="operationType"
                    {...register('operationType')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Selectează operațiunea</option>
                    <option value="VANZARE">Vânzare</option>
                    <option value="INCHIRIERE">Închiriere</option>
                  </select>
                  {errors.operationType && (
                    <p className="mt-1 text-sm text-red-600">{errors.operationType.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Location Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
                Locație
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="locality" className="block text-sm font-medium text-gray-700 mb-1">
                    Localitate *
                  </label>
                  <input
                    type="text"
                    id="locality"
                    {...register('locality')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Buzău"
                  />
                  {errors.locality && (
                    <p className="mt-1 text-sm text-red-600">{errors.locality.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="zone" className="block text-sm font-medium text-gray-700 mb-1">
                    Zonă *
                  </label>
                  <input
                    type="text"
                    id="zone"
                    {...register('zone')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Centru, Micro 3, etc."
                  />
                  {errors.zone && (
                    <p className="mt-1 text-sm text-red-600">{errors.zone.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Adresă *
                  </label>
                  <input
                    type="text"
                    id="address"
                    {...register('address')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Str. Unirii, nr. 10"
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Property Specifications */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
                Specificații Proprietate
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="surface" className="block text-sm font-medium text-gray-700 mb-1">
                    Suprafață (mp) *
                  </label>
                  <input
                    type="number"
                    id="surface"
                    {...register('surface')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="75"
                  />
                  {errors.surface && (
                    <p className="mt-1 text-sm text-red-600">{errors.surface.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="rooms" className="block text-sm font-medium text-gray-700 mb-1">
                    Număr camere
                  </label>
                  <input
                    type="number"
                    id="rooms"
                    {...register('rooms')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="3"
                  />
                  {errors.rooms && (
                    <p className="mt-1 text-sm text-red-600">{errors.rooms.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="floor" className="block text-sm font-medium text-gray-700 mb-1">
                    Etaj
                  </label>
                  <input
                    type="number"
                    id="floor"
                    {...register('floor')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="2"
                  />
                </div>

                <div>
                  <label htmlFor="totalFloors" className="block text-sm font-medium text-gray-700 mb-1">
                    Total etaje
                  </label>
                  <input
                    type="number"
                    id="totalFloors"
                    {...register('totalFloors')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="4"
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
                Preț
              </h2>
              <div>
                <label htmlFor="estimatedPrice" className="block text-sm font-medium text-gray-700 mb-1">
                  Preț estimat (EUR) *
                </label>
                <input
                  type="number"
                  id="estimatedPrice"
                  {...register('estimatedPrice')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="75000"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Introduceți prețul dorit sau estimat. Vă vom oferi o evaluare profesională gratuită.
                </p>
                {errors.estimatedPrice && (
                  <p className="mt-1 text-sm text-red-600">{errors.estimatedPrice.message}</p>
                )}
              </div>
            </div>

            {/* Description & Features */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
                Detalii Suplimentare
              </h2>
              <div className="space-y-6">
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Descriere *
                  </label>
                  <textarea
                    id="description"
                    {...register('description')}
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Descrieți proprietatea: stare, renovări, particularități..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="features" className="block text-sm font-medium text-gray-700 mb-1">
                    Dotări și facilități
                  </label>
                  <textarea
                    id="features"
                    {...register('features')}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ex: balcon, centrală termică, parcare, gradină, etc."
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Separați cu virgulă diferitele dotări
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-lg"
              >
                {isSubmitting ? 'Se trimite...' : 'Trimite Cererea'}
              </button>
              <p className="mt-3 text-sm text-gray-500 text-center">
                Prin trimiterea acestui formular, sunteți de acord ca BESTINVEST CAMIMOB să vă contacteze pentru evaluarea proprietății.
              </p>
            </div>
          </form>
        </div>

        {/* Benefits Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <div className="text-primary-600 text-3xl mb-3">✓</div>
            <h3 className="font-semibold text-lg mb-2">Evaluare Gratuită</h3>
            <p className="text-gray-600 text-sm">
              Primești o evaluare profesională fără costuri
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <div className="text-primary-600 text-3xl mb-3">✓</div>
            <h3 className="font-semibold text-lg mb-2">Răspuns Rapid</h3>
            <p className="text-gray-600 text-sm">
              Te contactăm în maximum 24 de ore
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <div className="text-primary-600 text-3xl mb-3">✓</div>
            <h3 className="font-semibold text-lg mb-2">Experiență</h3>
            <p className="text-gray-600 text-sm">
              Peste 10 ani în piața imobiliară din Buzău
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
