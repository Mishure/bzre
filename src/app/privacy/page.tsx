import { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Politica de Confidențialitate | BESTINVEST CAMIMOB',
  description: 'Politica de confidențialitate și protecția datelor personale pentru serviciile BESTINVEST CAMIMOB - Agenție Imobiliară Buzău.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-primary-100 rounded-full p-4">
              <ShieldCheckIcon className="h-12 w-12 text-primary-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 text-center mb-4">
            Politica de Confidențialitate
          </h1>
          <p className="text-gray-600 text-center">
            Ultima actualizare: {new Date().toLocaleDateString('ro-RO', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">

          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introducere</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              BESTINVEST CAMIMOB ("noi", "noastră" sau "Compania") respectă confidențialitatea vizitatorilor
              site-ului nostru web și a utilizatorilor serviciilor noastre. Această Politică de Confidențialitate
              descrie modul în care colectăm, utilizăm, stocăm și protejăm informațiile dumneavoastră personale.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Prin utilizarea site-ului www.camimob.ro și a serviciilor noastre, acceptați practicile descrise în
              această politică.
            </p>
          </section>

          {/* Data Collection */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Informații pe care le colectăm</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1. Informații furnizate direct de dumneavoastră</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
              <li>Nume și prenume</li>
              <li>Adresă de email</li>
              <li>Număr de telefon</li>
              <li>Adresa proprietății (pentru evaluări și listări)</li>
              <li>Detalii despre proprietatea de interes</li>
              <li>Mesaje și comunicări trimise prin formulare de contact</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">2.2. Informații colectate automat</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Adresa IP</li>
              <li>Tipul de browser și versiunea</li>
              <li>Paginile vizitate și timpul petrecut pe site</li>
              <li>Referrer URL (site-ul de la care ați venit)</li>
              <li>Date despre dispozitivul utilizat</li>
            </ul>
          </section>

          {/* Data Usage */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Cum folosim informațiile</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Utilizăm informațiile colectate pentru următoarele scopuri:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Răspunsuri la solicitările dumneavoastră și furnizarea serviciilor solicitate</li>
              <li>Contactarea dumneavoastră cu privire la proprietăți de interes</li>
              <li>Evaluarea și listarea proprietăților dumneavoastră</li>
              <li>Îmbunătățirea serviciilor și experienței pe site-ul nostru</li>
              <li>Trimiterea de newsletter-e și comunicări de marketing (cu consimțământul dumneavoastră)</li>
              <li>Conformitatea cu obligațiile legale</li>
            </ul>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Partajarea informațiilor</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              BESTINVEST CAMIMOB nu vinde, închiriază sau schimbă informațiile dumneavoastră personale cu terți.
              Putem partaja informațiile doar în următoarele situații:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Cu consimțământul dumneavoastră explicit</li>
              <li>Cu furnizori de servicii care ne ajută să operăm site-ul (hosting, analiză, email marketing)</li>
              <li>Când este necesar pentru conformitatea cu legea sau pentru protejarea drepturilor noastre</li>
              <li>În cazul unei fuziuni, achiziții sau vânzări de active</li>
            </ul>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Cookie-uri și tehnologii similare</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Site-ul nostru utilizează cookie-uri pentru a îmbunătăți experiența utilizatorului. Cookie-urile sunt
              fișiere mici de text stocate pe dispozitivul dumneavoastră. Puteți gestiona preferințele pentru
              cookie-uri din setările browser-ului.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Pentru mai multe detalii, consultați{' '}
              <Link href="/cookies" className="text-primary-600 hover:text-primary-700 font-medium">
                Politica de Cookie-uri
              </Link>.
            </p>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Securitatea datelor</h2>
            <p className="text-gray-700 leading-relaxed">
              Luăm măsuri tehnice și organizatorice adecvate pentru a proteja datele dumneavoastră personale împotriva
              accesului neautorizat, modificării, divulgării sau distrugerii. Acestea includ: criptarea datelor în
              tranzit (SSL/TLS), acces restricționat la datele personale și monitorizarea regulată a sistemelor noastre
              de securitate.
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Păstrarea datelor</h2>
            <p className="text-gray-700 leading-relaxed">
              Păstrăm informațiile dumneavoastră personale doar atât timp cât este necesar pentru îndeplinirea
              scopurilor pentru care au fost colectate, inclusiv pentru conformitatea cu obligațiile legale,
              rezolvarea litigiilor și aplicarea acordurilor noastre.
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Drepturile dumneavoastră</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              În conformitate cu GDPR și legislația română privind protecția datelor, aveți următoarele drepturi:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>Dreptul de acces:</strong> Puteți solicita o copie a datelor personale pe care le deținem despre dumneavoastră</li>
              <li><strong>Dreptul la rectificare:</strong> Puteți solicita corectarea datelor inexacte sau incomplete</li>
              <li><strong>Dreptul la ștergere:</strong> Puteți solicita ștergerea datelor dumneavoastră personale</li>
              <li><strong>Dreptul la restricționarea prelucrării:</strong> Puteți solicita limitarea modului în care folosim datele</li>
              <li><strong>Dreptul la portabilitatea datelor:</strong> Puteți solicita transferul datelor către alt operator</li>
              <li><strong>Dreptul de opoziție:</strong> Puteți obiecta la prelucrarea datelor în anumite circumstanțe</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Pentru a exercita aceste drepturi, vă rugăm să ne contactați la{' '}
              <a href="mailto:contact@camimob.ro" className="text-primary-600 hover:text-primary-700 font-medium">
                contact@camimob.ro
              </a>.
            </p>
          </section>

          {/* Children Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Confidențialitatea copiilor</h2>
            <p className="text-gray-700 leading-relaxed">
              Serviciile noastre nu sunt destinate persoanelor sub 18 ani. Nu colectăm cu bună știință informații
              personale de la copii. Dacă aflăm că am colectat informații personale de la un copil fără consimțământul
              părinților, vom lua măsuri pentru a șterge aceste informații.
            </p>
          </section>

          {/* Changes */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Modificări ale politicii</h2>
            <p className="text-gray-700 leading-relaxed">
              Ne rezervăm dreptul de a modifica această Politică de Confidențialitate în orice moment. Modificările vor
              fi publicate pe această pagină cu data actualizării. Vă recomandăm să revedeți periodic această politică
              pentru a fi la curent cu modul în care protejăm informațiile dumneavoastră.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Pentru întrebări sau nelămuriri legate de această Politică de Confidențialitate, vă rugăm să ne contactați:
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
