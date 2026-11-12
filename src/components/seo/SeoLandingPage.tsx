import Link from "next/link";
import PropertyCard from "@/components/PropertyCard";
import { fetchSeoProperties, type SeoPageConfig } from "@/lib/seoPages";

const BASE_URL = "https://www.camimob.ro";

export default async function SeoLandingPage({
  config,
}: {
  config: SeoPageConfig;
}) {
  // Service pages carry no filter and list no offers.
  const properties = config.filter
    ? await fetchSeoProperties(config.filter)
    : [];
  const canonicalUrl = `${BASE_URL}/${config.slug}`;
  const parent = config.service
    ? { name: "Servicii", item: `${BASE_URL}/services` }
    : { name: "Proprietăți", item: `${BASE_URL}/properties` };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Acasă",
        item: BASE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: parent.name,
        item: parent.item,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: config.breadcrumbLabel,
        item: canonicalUrl,
      },
    ],
  };

  const serviceLd = config.service
    ? {
        "@context": "https://schema.org",
        "@type": "Service",
        name: config.service.name,
        description: config.description,
        url: canonicalUrl,
        serviceType: config.service.name,
        areaServed: {
          "@type": "AdministrativeArea",
          name: "Județul Buzău",
        },
        provider: {
          "@type": "RealEstateAgent",
          name: "BESTINVEST CAMIMOB",
          url: BASE_URL,
          areaServed: "Buzău",
        },
      }
    : null;

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: config.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      {serviceLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }}
        />
      )}

      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-600">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="hover:text-primary-600">
                  Acasă
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link
                  href={config.service ? "/services" : "/properties"}
                  className="hover:text-primary-600"
                >
                  {parent.name}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-gray-900 font-medium" aria-current="page">
                {config.breadcrumbLabel}
              </li>
            </ol>
          </nav>

          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {config.h1}
            </h1>
            <p className="text-lg text-gray-700 leading-relaxed">
              {config.intro}
            </p>
          </header>

          {config.filter && (
          <section
            aria-label="Oferte"
            className="mb-12 bg-white rounded-xl p-6 shadow-sm"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Oferte disponibile ({properties.length})
            </h2>
            {properties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="text-gray-700">
                <p className="mb-3">
                  Momentan nu avem oferte active care să corespundă exact
                  acestor criterii.
                </p>
                <p>
                  Lasă-ne datele tale prin{" "}
                  <Link
                    href="/contact"
                    className="text-primary-600 underline hover:text-primary-700"
                  >
                    formularul de contact
                  </Link>{" "}
                  și te anunțăm imediat ce apare o proprietate potrivită. De
                  asemenea, poți explora{" "}
                  <Link
                    href="/properties"
                    className="text-primary-600 underline hover:text-primary-700"
                  >
                    toate proprietățile disponibile
                  </Link>
                  .
                </p>
              </div>
            )}
          </section>
          )}

          <article className="bg-white rounded-xl p-6 md:p-8 shadow-sm mb-8 prose prose-lg max-w-none">
            {config.sections.map((section, idx) => (
              <section key={idx} className="mb-8 last:mb-0">
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                  {section.heading}
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {section.body}
                </p>
              </section>
            ))}
          </article>

          <section
            aria-label="Întrebări frecvente"
            className="bg-white rounded-xl p-6 md:p-8 shadow-sm mb-8"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Întrebări frecvente
            </h2>
            <div className="space-y-6">
              {config.faq.map((item, idx) => (
                <div key={idx}>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {item.q}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-primary-50 border border-primary-200 rounded-xl p-6 md:p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              {config.service
                ? "Cere o ofertă pentru acest serviciu"
                : "Caută în continuare împreună cu CAMIMOB"}
            </h2>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              {config.service
                ? "Spune-ne ce imobil ai și pentru ce ai nevoie de document, iar un specialist CAMIMOB îți comunică lista exactă de acte, termenul de execuție și costul total, fără surprize."
                : "Spune-ne ce cauți și un consultant CAMIMOB îți pregătește o listă personalizată cu cele mai potrivite oferte din portofoliul nostru."}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Contactează-ne
              </Link>
              <Link
                href={config.service ? "/services" : "/properties"}
                className="inline-block bg-white text-primary-700 border border-primary-300 px-6 py-3 rounded-lg hover:bg-primary-50 transition-colors font-medium"
              >
                {config.service ? "Toate serviciile" : "Toate proprietățile"}
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
