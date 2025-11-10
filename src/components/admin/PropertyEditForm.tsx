'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

interface Property {
  id: number
  name: string
  price: number
  zone: string | null
  street: string | null
  locality: string
  latitude: number | null
  longitude: number | null
  surface: number
  rooms: number | null
  floor: number | null
  totalFloors: number | null
  operationType: string
  propertyType: string
  description: string | null
  heating: string | null
  condition: string | null
  availableFrom: string | null
  deposit: string | null
  buildingType: string | null
  buildingMaterial: string | null
  yearBuilt: number | null
  status: string
}

export default function PropertyEditForm({ property }: { property: Property }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: property.name || '',
    price: property.price || 0,
    zone: property.zone || '',
    street: property.street || '',
    locality: property.locality || 'Buzau',
    latitude: property.latitude || null,
    longitude: property.longitude || null,
    surface: property.surface || 0,
    rooms: property.rooms || null,
    floor: property.floor || null,
    totalFloors: property.totalFloors || null,
    operationType: property.operationType || 'VANZARE',
    propertyType: property.propertyType || 'APARTAMENT',
    description: property.description || '',
    heating: property.heating || '',
    condition: property.condition || '',
    availableFrom: property.availableFrom || '',
    deposit: property.deposit || '',
    buildingType: property.buildingType || '',
    buildingMaterial: property.buildingMaterial || '',
    yearBuilt: property.yearBuilt || null,
    status: property.status || 'ACTIVE'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/properties/${property.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to update property')
      }

      router.push('/admin/properties')
      router.refresh()
    } catch (error) {
      console.error('Error updating property:', error)
      alert('Eroare la actualizarea proprietății. Te rog încearcă din nou.')
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
      <div className="mb-6">
        <Link
          href="/admin/properties"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Înapoi la listă
        </Link>
      </div>

      <div className="space-y-6">
        {/* Informații de bază */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Informații de bază</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nume proprietate *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preț (RON) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tip proprietate *
              </label>
              <select
                name="propertyType"
                value={formData.propertyType}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="APARTAMENT">Apartament</option>
                <option value="CASA">Casă</option>
                <option value="TEREN">Teren</option>
                <option value="SPATIU_COMERCIAL">Spațiu Comercial</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tip operație *
              </label>
              <select
                name="operationType"
                value={formData.operationType}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="VANZARE">Vânzare</option>
                <option value="INCHIRIERE">Închiriere</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="ACTIVE">Activă</option>
                <option value="INACTIVE">Inactivă</option>
                <option value="ARCHIVED">Arhivată</option>
                <option value="SOLD">Vândută</option>
                <option value="RENTED">Închiriată</option>
              </select>
            </div>
          </div>
        </div>

        {/* Locație */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Locație</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zonă
              </label>
              <input
                type="text"
                name="zone"
                value={formData.zone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stradă / Adresă
              </label>
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Localitate *
              </label>
              <input
                type="text"
                name="locality"
                value={formData.locality}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitudine
                </label>
                <input
                  type="number"
                  name="latitude"
                  value={formData.latitude || ''}
                  onChange={handleChange}
                  step="0.000001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="45.xxx"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitudine
                </label>
                <input
                  type="number"
                  name="longitude"
                  value={formData.longitude || ''}
                  onChange={handleChange}
                  step="0.000001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="26.xxx"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Caracteristici */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Caracteristici</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Suprafață (m²) *
              </label>
              <input
                type="number"
                name="surface"
                value={formData.surface}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Camere
              </label>
              <input
                type="number"
                name="rooms"
                value={formData.rooms || ''}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Etaj
              </label>
              <input
                type="number"
                name="floor"
                value={formData.floor || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total etaje
              </label>
              <input
                type="number"
                name="totalFloors"
                value={formData.totalFloors || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Încălzire
              </label>
              <input
                type="text"
                name="heating"
                value={formData.heating}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stare
              </label>
              <input
                type="text"
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Liber de la
              </label>
              <input
                type="text"
                name="availableFrom"
                value={formData.availableFrom}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Garanție
              </label>
              <input
                type="text"
                name="deposit"
                value={formData.deposit}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tip clădire
              </label>
              <input
                type="text"
                name="buildingType"
                value={formData.buildingType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Material construcție
              </label>
              <input
                type="text"
                name="buildingMaterial"
                value={formData.buildingMaterial}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                An construcție
              </label>
              <input
                type="number"
                name="yearBuilt"
                value={formData.yearBuilt || ''}
                onChange={handleChange}
                min="1800"
                max={new Date().getFullYear()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Descriere */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descriere
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Descriere detaliată a proprietății..."
          />
        </div>

        {/* Butoane */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t">
          <Link
            href="/admin/properties"
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Anulează
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Se salvează...' : 'Salvează modificările'}
          </button>
        </div>
      </div>
    </form>
  )
}
