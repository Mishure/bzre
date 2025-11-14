import { Metadata } from 'next';
import Link from 'next/link';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Politica de Cookie-uri | BESTINVEST CAMIMOB',
  description: 'Politica de utilizare a cookie-urilor pe site-ul BESTINVEST CAMIMOB - Agenție Imobiliară Buzău. Aflați cum folosim cookie-urile și cum le puteți gestiona.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-primary-100 rounded-full p-4">
              <DocumentTextIcon className="h-12 w-12 text-primary-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 text-center mb-4">
            Politica de Cookie-uri
          </h1>
          <p className="text-gray-600 text-center">
            Ultima actualizare: {new Date().toLocaleDateString('ro-RO', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">

          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Ce sunt cookie-urile?</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Cookie-urile sunt fișiere text mici stocate pe dispozitivul dumneavoastră (computer, smartphone, tabletă)
              atunci când vizitați un site web. Acestea permit site-ului să vă recunoască și să rețină preferințele
              dumneavoastră, îmbunătățind experiența de navigare.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Cookie-urile în sine nu conțin informații personale identificabile și nu pot accesa sau modifica alte
              fișiere de pe dispozitivul dumneavoastră.
            </p>
          </section>

          {/* Why We Use Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. De ce folosim cookie-uri?</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              BESTINVEST CAMIMOB folosește cookie-uri pentru a:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Asigura funcționarea corectă a site-ului</li>
              <li>Îmbunătăți experiența dumneavoastră de navigare</li>
              <li>Înțelege modul în care utilizați site-ul nostru</li>
              <li>Personaliza conținutul și ofertele în funcție de preferințele dumneavoastră</li>
              <li>Analiza traficului și comportamentul utilizatorilor</li>
              <li>Afișa anunțuri relevante</li>
            </ul>
          </section>

          {/* Types of Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Tipuri de cookie-uri folosite</h2>

            <div className="space-y-6">
              {/* Essential Cookies */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">3.1. Cookie-uri esențiale (necesare)</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Aceste cookie-uri sunt necesare pentru funcționarea corectă a site-ului și nu pot fi dezactivate în
                  sistemele noastre. De obicei, ele sunt setate doar ca răspuns la acțiunile dumneavoastră, cum ar fi
                  setarea preferințelor de confidențialitate sau completarea formularelor.
                </p>
                <p className="text-sm text-gray-600 italic">
                  Exemple: cookie-uri de sesiune, cookie-uri de securitate, cookie-uri de funcționalitate de bază
                </p>
              </div>

              {/* Analytics Cookies */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">3.2. Cookie-uri de analiză și performanță</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Aceste cookie-uri ne permit să numărăm vizitele și sursele de trafic pentru a putea măsura și
                  îmbunătăți performanța site-ului nostru. Ne ajută să știm care pagini sunt cele mai populare și
                  cele mai puțin populare și să vedem cum se mișcă vizitatorii pe site.
                </p>
                <p className="text-sm text-gray-600 italic">
                  Exemple: Google Analytics, cookie-uri de monitorizare a performanței
                </p>
              </div>

              {/* Functionality Cookies */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">3.3. Cookie-uri funcționale</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Aceste cookie-uri permit site-ului să ofere funcționalitate îmbunătățită și personalizare. Pot fi
                  setate de noi sau de furnizori terți ale căror servicii le-am adăugat pe paginile noastre.
                </p>
                <p className="text-sm text-gray-600 italic">
                  Exemple: memorarea preferințelor de limbă, lista de proprietăți favorite
                </p>
              </div>

              {/* Marketing Cookies */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">3.4. Cookie-uri de marketing și publicitate</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Aceste cookie-uri pot fi setate prin site-ul nostru de către partenerii noștri de publicitate.
                  Pot fi folosite de acele companii pentru a crea un profil al intereselor dumneavoastră și pentru a
                  vă afișa anunțuri relevante pe alte site-uri.
                </p>
                <p className="text-sm text-gray-600 italic">
                  Exemple: cookie-uri Facebook Pixel, Google Ads, cookie-uri de retargeting
                </p>
              </div>
            </div>
          </section>

          {/* Cookie Duration */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Durata cookie-urilor</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Cookie-uri de sesiune</h3>
                <p className="text-gray-700 leading-relaxed">
                  Temporare și expiră când închideți browser-ul. Sunt folosite pentru a vă ghida prin site în timpul
                  vizitei.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Cookie-uri persistente</h3>
                <p className="text-gray-700 leading-relaxed">
                  Rămân pe dispozitivul dumneavoastră pentru o perioadă determinată (de obicei între 30 de zile și 2
                  ani). Sunt folosite pentru a vă recunoaște la vizitele ulterioare și pentru a vă aminti preferințele.
                </p>
              </div>
            </div>
          </section>

          {/* Third Party Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Cookie-uri terțe</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Pe lângă cookie-urile noastre proprii, putem folosi diverse servicii terțe care setează, de asemenea,
              cookie-uri pe dispozitivul dumneavoastră pentru a furniza serviciile lor. Aceste servicii includ:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>Google Analytics:</strong> Pentru analiza traficului pe site</li>
              <li><strong>Google Maps:</strong> Pentru afișarea hărților interactive</li>
              <li><strong>Facebook:</strong> Pentru funcționalitățile social media și publicitate</li>
              <li><strong>OpenStreetMap:</strong> Pentru vizualizarea locațiilor proprietăților</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Pentru mai multe informații despre modul în care aceste servicii terțe utilizează cookie-urile, vă rugăm
              să consultați politicile lor de confidențialitate.
            </p>
          </section>

          {/* Managing Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Gestionarea cookie-urilor</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Aveți control complet asupra cookie-urilor și puteți alege să le acceptați sau să le respingeți. Iată
              cum puteți gestiona cookie-urile:
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mb-3">6.1. Setările browser-ului</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Majoritatea browser-elor vă permit să controlați cookie-urile prin setările lor. Iată cum puteți accesa
              setările pentru cele mai populare browsere:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
              <li><strong>Google Chrome:</strong> Setări → Confidențialitate și securitate → Cookie-uri și alte date ale site-urilor</li>
              <li><strong>Mozilla Firefox:</strong> Opțiuni → Confidențialitate și securitate → Cookie-uri și date ale site-urilor</li>
              <li><strong>Safari:</strong> Preferințe → Confidențialitate → Cookie-uri și date ale site-urilor web</li>
              <li><strong>Microsoft Edge:</strong> Setări → Cookie-uri și permisiuni site</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mb-3">6.2. Dezactivarea cookie-urilor</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Puteți dezactiva toate cookie-urile sau puteți selecta individual ce tip de cookie-uri doriți să
              acceptați. Vă rugăm să rețineți că dezactivarea anumitor cookie-uri poate afecta funcționalitatea site-ului.
            </p>

            <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
              <p className="text-amber-800">
                <strong>Atenție:</strong> Dacă dezactivați cookie-urile esențiale, este posibil să nu puteți utiliza
                toate funcționalitățile site-ului nostru.
              </p>
            </div>
          </section>

          {/* Cookie List */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Lista cookie-urilor folosite</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nume cookie
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Scop
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durată
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">_session</td>
                    <td className="px-6 py-4 text-sm text-gray-700">Gestionarea sesiunii utilizatorului</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">Sesiune</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">_ga</td>
                    <td className="px-6 py-4 text-sm text-gray-700">Google Analytics - distinge utilizatorii</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">2 ani</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">_gid</td>
                    <td className="px-6 py-4 text-sm text-gray-700">Google Analytics - distinge utilizatorii</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">24 ore</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">preferences</td>
                    <td className="px-6 py-4 text-sm text-gray-700">Memorarea preferințelor utilizatorului</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">1 an</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Updates */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Actualizări ale politicii</h2>
            <p className="text-gray-700 leading-relaxed">
              Ne rezervăm dreptul de a actualiza această Politică de Cookie-uri în orice moment pentru a reflecta
              modificările în practicile noastre sau din motive legale. Vă recomandăm să revedeți periodic această
              pagină pentru a fi la curent cu modul în care utilizăm cookie-urile.
            </p>
          </section>

          {/* More Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Mai multe informații</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Pentru mai multe informații despre modul în care protejăm datele dumneavoastră, vă rugăm să consultați{' '}
              <Link href="/privacy" className="text-primary-600 hover:text-primary-700 font-medium">
                Politica de Confidențialitate
              </Link>.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Pentru resurse externe despre cookie-uri, puteți vizita:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mt-2">
              <li>
                <a
                  href="https://www.allaboutcookies.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700"
                >
                  All About Cookies
                </a>
              </li>
              <li>
                <a
                  href="https://ec.europa.eu/info/cookies_ro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700"
                >
                  Comisia Europeană - Cookies
                </a>
              </li>
            </ul>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Pentru întrebări sau nelămuriri legate de această Politică de Cookie-uri, vă rugăm să ne contactați:
            </p>
            <div className="bg-gray-50 rounded-lg p-6 space-y-2">
              <p className="text-gray-700"><strong>BESTINVEST CAMIMOB</strong></p>
              <p className="text-gray-700">Blv. Maresal Alexandru Averescu, nr.28, Buzău, Romania</p>
              <p className="text-gray-700">Email: <a href="mailto:contact@camimob.ro" className="text-primary-600 hover:text-primary-700">contact@camimob.ro</a></p>
              <p className="text-gray-700">Telefon: <a href="tel:+40773723654" className="text-primary-600 hover:text-primary-700">+40 773 723 654</a></p>
            </div>
          </section>

        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Înapoi la pagina principală
          </Link>
        </div>

      </div>
    </div>
  );
}
