"use client";

import { useState } from "react";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import {
  ArrowLeftIcon,
  HeartIcon,
  ShareIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";

type ImageItem = string | { url: string; isPrimary?: boolean };

export type PropertyViewModel = {
  id: number;
  name: string;
  price: number;
  currency?: string | null;
  zone?: string | null;
  street?: string | null;
  locality: string;
  surface: number;
  rooms?: number | null;
  floor?: number | null;
  totalFloors?: number | null;
  operationType: string;
  propertyType: string;
  description?: string | null;
  features?: string | string[] | null;
  images?: ImageItem[];
  createdAt: string;
  seoIntro?: string;
};

const AGENT = {
  name: "Carmen Tiu",
  phone: "+40 773 723 654",
  email: "contact@bestinvestcamimob.ro",
};

function formatPrice(price: number, currency: string = "RON") {
  return new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

function getFeatures(features?: string | string[] | null): string[] {
  if (!features) return [];
  if (Array.isArray(features)) return features;
  try {
    const parsed = JSON.parse(features);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getImageUrl(img: ImageItem | undefined): string {
  if (!img) return "/api/placeholder/600/400";
  return typeof img === "string" ? img : img.url;
}

export default function PropertyDetailView({
  property,
}: {
  property: PropertyViewModel;
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const images = property.images || [];
  const features = getFeatures(property.features);

  const nextImage = () => {
    if (images.length === 0) return;
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };
  const prevImage = () => {
    if (images.length === 0) return;
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const isVanzare = property.operationType === "VANZARE";
  const altText = `${property.name} - ${property.propertyType} ${
    isVanzare ? "de vânzare" : "de închiriat"
  } în ${property.zone || property.locality}, ${property.locality}`;

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs
          items={[
            { label: "Proprietăți", href: "/properties" },
            { label: property.name },
          ]}
        />

        <div className="mb-6">
          <Link
            href="/properties"
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Înapoi la proprietăți
          </Link>
        </div>

        <div className="relative h-96 md:h-[500px] mb-8 rounded-xl overflow-hidden bg-gray-100">
          {images.length > 0 && (
            <>
              <img
                src={getImageUrl(images[currentImageIndex])}
                alt={`${altText} - Imagine ${currentImageIndex + 1} din ${images.length}`}
                className="w-full h-full object-cover"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    aria-label="Imaginea anterioară"
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 p-2 rounded-full hover:bg-opacity-100 transition-all"
                  >
                    ←
                  </button>
                  <button
                    onClick={nextImage}
                    aria-label="Imaginea următoare"
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 p-2 rounded-full hover:bg-opacity-100 transition-all"
                  >
                    →
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        aria-label={`Imaginea ${index + 1}`}
                        className={`w-3 h-3 rounded-full ${
                          index === currentImageIndex
                            ? "bg-white"
                            : "bg-white bg-opacity-50"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          <div className="absolute top-4 right-4 flex space-x-2">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              aria-label="Adaugă la favorite"
              className="p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all"
            >
              {isFavorite ? (
                <HeartSolidIcon className="h-5 w-5 text-red-500" />
              ) : (
                <HeartIcon className="h-5 w-5 text-gray-600" />
              )}
            </button>
            <button
              aria-label="Distribuie"
              className="p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all"
            >
              <ShareIcon className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="border-b pb-6 mb-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {property.name}
                    </h1>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPinIcon className="h-5 w-5 mr-2" />
                      <span>
                        {[property.street, property.zone, property.locality]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary-600 mb-1">
                      {formatPrice(property.price, property.currency || "RON")}
                    </div>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium text-white ${
                        isVanzare ? "bg-green-600" : "bg-blue-600"
                      }`}
                    >
                      {isVanzare ? "De vânzare" : "De închiriat"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {property.rooms && property.rooms > 0 ? (
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">
                        {property.rooms}
                      </div>
                      <div className="text-sm text-gray-600">Camere</div>
                    </div>
                  ) : null}
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {property.surface}
                    </div>
                    <div className="text-sm text-gray-600">m²</div>
                  </div>
                  {property.floor ? (
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">
                        {property.floor}
                      </div>
                      <div className="text-sm text-gray-600">Etaj</div>
                    </div>
                  ) : null}
                  {property.totalFloors ? (
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">
                        {property.totalFloors}
                      </div>
                      <div className="text-sm text-gray-600">Etaje total</div>
                    </div>
                  ) : null}
                </div>
              </div>

              {property.seoIntro && (
                <div className="mb-6 bg-primary-50 border border-primary-100 rounded-lg p-4 text-gray-800 leading-relaxed">
                  {property.seoIntro}
                </div>
              )}

              {property.description && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">
                    Descriere
                  </h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {property.description}
                  </p>
                </div>
              )}

              {features.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">
                    Caracteristici
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t pt-6">
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Tip proprietate:</span>{" "}
                    {property.propertyType.replace("_", " ")}
                  </div>
                  <div>
                    <span className="font-medium">ID proprietate:</span> #
                    {property.id}
                  </div>
                  <div>
                    <span className="font-medium">Publicat:</span>{" "}
                    {new Date(property.createdAt).toLocaleDateString("ro-RO")}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Agent imobiliar
              </h2>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-semibold">
                    {AGENT.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
                <div className="ml-3">
                  <div className="font-medium text-gray-900">{AGENT.name}</div>
                  <div className="text-sm text-gray-500">
                    Agent specializat zona {property.zone || property.locality}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <a
                  href={`tel:${AGENT.phone}`}
                  className="flex items-center justify-center w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <PhoneIcon className="h-5 w-5 mr-2" />
                  Sună acum
                </a>
                <a
                  href={`mailto:${AGENT.email}?subject=Interesat de ${encodeURIComponent(property.name)}&body=${encodeURIComponent(
                    `Bună ziua,\n\nSunt interesat de proprietatea "${property.name}" (ID: ${property.id}).\n\nVă rog să mă contactați pentru mai multe detalii.\n\nMulțumesc!`
                  )}`}
                  className="flex items-center justify-center w-full border border-primary-600 text-primary-600 py-3 px-4 rounded-lg hover:bg-primary-50 transition-colors"
                >
                  <EnvelopeIcon className="h-5 w-5 mr-2" />
                  Trimite email
                </a>
              </div>

              <div className="mt-4 pt-4 border-t text-xs text-gray-500 text-center">
                <p>agent autorizat ANCPI</p>
                <p className="mt-1">Licența #1798</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Statistici rapide
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Preț/m²:</span>
                  <span className="font-medium">
                    {formatPrice(
                      Math.round(property.price / property.surface),
                      property.currency || "RON"
                    )}
                    /m²
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Zonă:</span>
                  <span className="font-medium">
                    {property.zone || property.locality}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tip:</span>
                  <span className="font-medium">
                    {property.propertyType.replace("_", " ")}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <Link
                  href={`/properties?type=${property.propertyType}&operation=${property.operationType}`}
                  className="flex items-center justify-center w-full text-primary-600 hover:text-primary-700 transition-colors"
                >
                  <EyeIcon className="h-4 w-4 mr-2" />
                  Vezi proprietăți similare
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Locația
              </h2>
              <Link
                href={`/properties/map-view?propertyId=${property.id}`}
                className="flex items-center justify-center w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors"
              >
                <MapPinIcon className="h-5 w-5 mr-2" />
                Vezi locația pe hartă
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
