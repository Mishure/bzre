import Link from "next/link";
import { HomeIcon } from "@heroicons/react/24/outline";
import { Property } from "@/types/property";

function formatPrice(price: number, currency = "RON") {
  const formatter = new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency: currency === "EUR" ? "EUR" : "RON",
    maximumFractionDigits: 0,
  });
  return formatter.format(price);
}

function getPrimaryImage(property: Property): string {
  const images = property.images;
  if (!images || images.length === 0) return "/api/placeholder/400/300";
  const first = images[0];
  if (typeof first === "string") return first;
  return first.url || "/api/placeholder/400/300";
}

function describeRoomsOrType(property: Property): string {
  if (property.propertyType === "TEREN") return "Teren";
  if (property.propertyType === "SPATIU_COMERCIAL") return "Spațiu comercial";
  if (property.rooms && property.rooms > 0) return `${property.rooms} camere`;
  return "Proprietate";
}

export default function PropertyCard({ property }: { property: Property }) {
  const isVanzare = property.operationType === "VANZARE";
  const operationLabel = isVanzare ? "De vânzare" : "De închiriat";
  const altText = `${property.name} - ${property.propertyType.toLowerCase()} ${
    isVanzare ? "de vânzare" : "de închiriat"
  } în ${property.zone || property.locality}, ${
    property.rooms ? property.rooms + " camere, " : ""
  }${property.surface} mp`;

  return (
    <article className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="relative h-48">
        <img
          src={getPrimaryImage(property)}
          alt={altText}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
              isVanzare ? "bg-green-600" : "bg-blue-600"
            }`}
          >
            {operationLabel}
          </span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">
          {property.name}
        </h3>

        <p className="text-2xl font-bold text-primary-600 mb-3">
          {formatPrice(property.price, property.currency || "RON")}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <HomeIcon className="h-4 w-4 mr-2" />
            <span>
              {property.street}
              {property.zone ? `, ${property.zone}` : ""}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{describeRoomsOrType(property)}</span>
            <span>{property.surface} m²</span>
          </div>
        </div>

        <Link
          href={`/properties/${property.id}`}
          className="block w-full bg-primary-600 text-white text-center py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Vezi detalii
        </Link>
      </div>
    </article>
  );
}
