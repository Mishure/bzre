import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import PropertyEditForm from '@/components/admin/PropertyEditForm'

async function getProperty(id: string) {
  const property = await prisma.property.findUnique({
    where: { id: parseInt(id) },
    include: {
      images: { orderBy: { order: 'asc' } }
    }
  })

  return property
}

export default async function EditPropertyPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const property = await getProperty(id)

  if (!property) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Editează proprietatea
        </h1>
        <p className="text-sm text-gray-600">
          Modifică detaliile proprietății #{property.id}
        </p>
      </div>

      <PropertyEditForm property={property} />
    </div>
  )
}
