// Site-wide structured data for the agency (LocalBusiness / RealEstateAgent).
// Anchors local SEO and the Google knowledge panel.
//
// Valorile din CONFIG trebuie să rămână IDENTICE cu cele din Google Business
// Profile (nume, adresă, telefon, geo) — Google le face cross-check.
const BASE_URL = "https://www.camimob.ro";

const CONFIG = {
  name: "BESTINVEST CAMIMOB",
  legalName: "REAL ESTATE BESTINVEST CAMIMOB SRL",
  telephone: "+40-773-723-654",
  email: "contact@camimob.ro",
  streetAddress: "Blv. Mareșal Alexandru Averescu, nr. 28",
  addressLocality: "Buzău",
  addressRegion: "Buzău",
  postalCode: "120253",
  // Coordonatele exacte ale biroului, din pinul Google Business Profile.
  latitude: 45.1442648,
  longitude: 26.8058391,
  priceRange: "$$",
  // Profiluri oficiale. Adaugă aici Facebook/Instagram dacă există.
  sameAs: [
    "https://www.google.com/maps/place/REAL+ESTATE+BESTINVEST+CAMIMOB+SRL/@45.1442648,26.8058391,17z/data=!4m6!3m5!1s0x40b1616a57278579:0x8ad135aa3139183f!8m2!3d45.1442648!4d26.8058391",
  ] as string[],
  // Program — ajustează după programul real al agenției.
  openingHours: [
    { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "09:00", closes: "18:00" },
    { days: ["Saturday"], opens: "10:00", closes: "14:00" },
  ],
};

export default function OrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": `${BASE_URL}/#organization`,
    name: CONFIG.name,
    legalName: CONFIG.legalName,
    url: BASE_URL,
    logo: `${BASE_URL}/imagecam.png`,
    image: `${BASE_URL}/imagecam.png`,
    telephone: CONFIG.telephone,
    email: CONFIG.email,
    priceRange: CONFIG.priceRange,
    address: {
      "@type": "PostalAddress",
      streetAddress: CONFIG.streetAddress,
      addressLocality: CONFIG.addressLocality,
      addressRegion: CONFIG.addressRegion,
      postalCode: CONFIG.postalCode,
      addressCountry: "RO",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: CONFIG.latitude,
      longitude: CONFIG.longitude,
    },
    areaServed: {
      "@type": "City",
      name: "Buzău",
    },
    knowsLanguage: ["ro"],
    openingHoursSpecification: CONFIG.openingHours.map((o) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: o.days,
      opens: o.opens,
      closes: o.closes,
    })),
    ...(CONFIG.sameAs.length > 0 && { sameAs: CONFIG.sameAs }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
