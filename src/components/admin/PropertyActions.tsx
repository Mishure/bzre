'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  EyeIcon,
  PencilIcon,
  ArchiveBoxIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'

interface PropertyActionsProps {
  propertyId: number
  propertyName: string
}

export default function PropertyActions({ propertyId, propertyName }: PropertyActionsProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Sigur vrei să ștergi proprietatea "${propertyName}"?\n\nAceastă acțiune nu poate fi anulată.`)) {
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete property')
      }

      // Refresh the page to show updated list
      router.refresh()
    } catch (error) {
      console.error('Error deleting property:', error)
      alert('Eroare la ștergerea proprietății. Te rog încearcă din nou.')
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <Link
        href={`/admin/properties/${propertyId}`}
        className="text-primary-600 hover:text-primary-900 inline-block"
        title="Vezi detalii"
      >
        <EyeIcon className="h-4 w-4" />
      </Link>
      <Link
        href={`/admin/properties/${propertyId}/edit`}
        className="text-gray-600 hover:text-gray-900 inline-block"
        title="Editează"
      >
        <PencilIcon className="h-4 w-4" />
      </Link>
      <button
        className="text-yellow-600 hover:text-yellow-900"
        title="Arhivează"
      >
        <ArchiveBoxIcon className="h-4 w-4" />
      </button>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Șterge"
      >
        <TrashIcon className="h-4 w-4" />
      </button>
    </div>
  )
}
