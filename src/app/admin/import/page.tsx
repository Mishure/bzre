'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

type ImportResult = {
  url: string
  success: boolean
  propertyId?: number
  imagesUploaded?: number
  error?: string
}

export default function ImportStoriaPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [urls, setUrls] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const [results, setResults] = useState<ImportResult[]>([])
  const [importStats, setImportStats] = useState({ imported: 0, failed: 0 })

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!session) {
    router.push('/admin/login')
    return null
  }

  const handleImport = async () => {
    // Parse URLs from textarea
    const urlList = urls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url && url.startsWith('http'))

    if (urlList.length === 0) {
      toast.error('Te rog să introduci cel puțin un URL valid Storia')
      return
    }

    setIsImporting(true)
    setResults([])
    setImportStats({ imported: 0, failed: 0 })

    try {
      const response = await fetch('/api/import-storia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ urls: urlList }),
      })

      const data = await response.json()

      if (data.success) {
        setResults(data.results || [])
        setImportStats({
          imported: data.imported,
          failed: data.failed,
        })

        if (data.imported > 0) {
          toast.success(`✅ ${data.imported} proprietăți importate cu succes!`)
        }

        if (data.failed > 0) {
          toast.error(`❌ ${data.failed} proprietăți au eșuat`)
        }
      } else {
        toast.error(data.error || 'Eroare la import')
      }
    } catch (error) {
      console.error('Import error:', error)
      toast.error('Eroare la import. Vezi consola pentru detalii.')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Import Proprietăți Storia</h1>
        <p className="mt-2 text-gray-600">
          Importă proprietăți direct de pe Storia.ro, inclusiv imaginile
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h2 className="font-semibold text-blue-900 mb-2 flex items-center">
          <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Cum funcționează?
        </h2>
        <ul className="space-y-1 text-sm text-gray-700">
          <li>• Copiază link-urile anunțurilor tale de pe Storia.ro</li>
          <li>• Pune fiecare link pe o linie nouă în câmpul de mai jos</li>
          <li>• Apasă "Importă Proprietăți" și așteaptă</li>
          <li>• Sistemul va extrage automat toate datele și imaginile</li>
          <li>• Proprietățile vor apărea în lista ta de proprietăți active</li>
        </ul>
      </div>

      {/* URL Input */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <label htmlFor="urls" className="block text-sm font-medium text-gray-700 mb-2">
          Link-uri Storia (unul pe linie)
        </label>
        <textarea
          id="urls"
          rows={10}
          className="w-full border border-gray-300 rounded-md p-3 font-mono text-sm"
          placeholder="https://www.storia.ro/ro/oferta/...&#10;https://www.storia.ro/ro/oferta/...&#10;https://www.storia.ro/ro/oferta/..."
          value={urls}
          onChange={(e) => setUrls(e.target.value)}
          disabled={isImporting}
        />

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {urls.split('\n').filter(url => url.trim().startsWith('http')).length} URL-uri detectate
          </p>

          <button
            onClick={handleImport}
            disabled={isImporting || !urls.trim()}
            className={`px-6 py-3 rounded-md font-medium text-white transition-colors ${
              isImporting || !urls.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-700'
            }`}
          >
            {isImporting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Se importă...
              </>
            ) : (
              'Importă Proprietăți'
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Rezultate Import</h2>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Importate cu succes</p>
              <p className="text-3xl font-bold text-green-600">{importStats.imported}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Eșuate</p>
              <p className="text-3xl font-bold text-red-600">{importStats.failed}</p>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="space-y-3">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${
                  result.success
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      {result.success ? (
                        <svg className="h-5 w-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                      <span className={`font-medium ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                        {result.success ? 'Succes' : 'Eșuat'}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-1 break-all">{result.url}</p>

                    {result.success && (
                      <div className="text-sm text-gray-700 mt-2">
                        <span className="inline-block bg-white px-2 py-1 rounded mr-2">
                          ID Proprietate: #{result.propertyId}
                        </span>
                        <span className="inline-block bg-white px-2 py-1 rounded">
                          {result.imagesUploaded} imagini importate
                        </span>
                      </div>
                    )}

                    {!result.success && result.error && (
                      <p className="text-sm text-red-700 mt-2">
                        Eroare: {result.error}
                      </p>
                    )}
                  </div>

                  {result.success && result.propertyId && (
                    <a
                      href={`/admin/properties`}
                      className="ml-4 text-primary-600 hover:text-primary-700 text-sm font-medium whitespace-nowrap"
                    >
                      Vezi proprietate →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
