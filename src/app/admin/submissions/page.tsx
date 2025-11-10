'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

type PropertySubmission = {
  id: number
  ownerName: string
  phone: string
  email: string
  propertyType: string
  operationType: string
  locality: string
  zone: string
  address: string
  surface: number
  rooms: number | null
  floor: number | null
  totalFloors: number | null
  estimatedPrice: number
  description: string
  features: string | null
  status: string
  assignedTo: {
    id: number
    name: string
    email: string
  } | null
  createdAt: string
  updatedAt: string
  contactedAt: string | null
}

const statusColors: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-800',
  CONTACTED: 'bg-yellow-100 text-yellow-800',
  EVALUATED: 'bg-purple-100 text-purple-800',
  LISTED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
}

const statusLabels: Record<string, string> = {
  NEW: 'Nou',
  CONTACTED: 'Contactat',
  EVALUATED: 'Evaluat',
  LISTED: 'Listat',
  REJECTED: 'Respins',
}

const propertyTypeLabels: Record<string, string> = {
  APARTAMENT: 'Apartament',
  CASA: 'Casă',
  TEREN: 'Teren',
  SPATIU_COMERCIAL: 'Spațiu Comercial',
}

const operationTypeLabels: Record<string, string> = {
  VANZARE: 'Vânzare',
  INCHIRIERE: 'Închiriere',
}

export default function PropertySubmissionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [submissions, setSubmissions] = useState<PropertySubmission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [status, router])

  useEffect(() => {
    fetchSubmissions()
  }, [selectedStatus])

  const fetchSubmissions = async () => {
    setIsLoading(true)
    try {
      const url = selectedStatus === 'all'
        ? '/api/property-submissions'
        : `/api/property-submissions?status=${selectedStatus}`

      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        setSubmissions(data.submissions)
      } else {
        toast.error('Eroare la încărcarea cererilor')
      }
    } catch (error) {
      console.error('Error fetching submissions:', error)
      toast.error('Eroare la încărcarea cererilor')
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Cereri de Listare Proprietăți</h1>
        <p className="mt-2 text-gray-600">
          Gestionează cererile primite de la clienți pentru listarea proprietăților
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4 items-center">
        <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
          Filtrează după status:
        </label>
        <select
          id="status-filter"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="all">Toate</option>
          <option value="NEW">Noi</option>
          <option value="CONTACTED">Contactate</option>
          <option value="EVALUATED">Evaluate</option>
          <option value="LISTED">Listate</option>
          <option value="REJECTED">Respinse</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Noi</p>
          <p className="text-2xl font-bold text-blue-600">
            {submissions.filter(s => s.status === 'NEW').length}
          </p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Contactate</p>
          <p className="text-2xl font-bold text-yellow-600">
            {submissions.filter(s => s.status === 'CONTACTED').length}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Evaluate</p>
          <p className="text-2xl font-bold text-purple-600">
            {submissions.filter(s => s.status === 'EVALUATED').length}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Listate</p>
          <p className="text-2xl font-bold text-green-600">
            {submissions.filter(s => s.status === 'LISTED').length}
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Respinse</p>
          <p className="text-2xl font-bold text-red-600">
            {submissions.filter(s => s.status === 'REJECTED').length}
          </p>
        </div>
      </div>

      {/* Submissions List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {submissions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Nu există cereri de listare
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proprietar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proprietate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Locație
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preț Estimat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acțiuni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {submissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{submission.ownerName}</div>
                        <div className="text-sm text-gray-500">{submission.phone}</div>
                        <div className="text-sm text-gray-500">{submission.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {propertyTypeLabels[submission.propertyType]}
                        </div>
                        <div className="text-sm text-gray-500">
                          {operationTypeLabels[submission.operationType]}
                        </div>
                        <div className="text-sm text-gray-500">
                          {submission.surface} mp {submission.rooms ? `• ${submission.rooms} camere` : ''}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{submission.locality}</div>
                      <div className="text-sm text-gray-500">{submission.zone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {submission.estimatedPrice.toLocaleString('ro-RO')} EUR
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[submission.status]}`}>
                        {statusLabels[submission.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(submission.createdAt).toLocaleDateString('ro-RO')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          // TODO: Implement view details modal or navigate to details page
                          toast.success('Funcționalitate în dezvoltare')
                        }}
                        className="text-primary-600 hover:text-primary-900 mr-3"
                      >
                        Vezi detalii
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
