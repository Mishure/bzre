'use client';

import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-center">Termeni și Condiții</h1>
          <p className="text-xl text-center mt-4 opacity-90">
            BESTINVEST CAMIMOB - Agenție Imobiliară Buzău
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-primary-600 hover:text-primary-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Înapoi la pagina principală
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">

          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introducere</h2>
            <p className="text-gray-700 leading-relaxed">
              Prezentele Termene și Condiții reglementează utilizarea site-ului web și a serviciilor oferite de
              BESTINVEST CAMIMOB SRL, societate înregistrată în România. Prin accesarea și utilizarea acestui site,
              acceptați în mod expres și fără rezerve acești termeni și condiții.
            </p>
          </section>

          {/* Services */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Servicii Oferite</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              BESTINVEST CAMIMOB oferă servicii de intermediere în tranzacții imobiliare, incluzând dar fără a se limita la:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Intermediere vânzare/cumpărare proprietăți imobiliare</li>
              <li>Intermediere închiriere proprietăți imobiliare</li>
              <li>Evaluare proprietăți</li>
              <li>Consultanță imobiliară</li>
              <li>Servicii juridice în domeniul imobiliar</li>
              <li>Management exclusivitate proprietăți</li>
            </ul>
          </section>

          {/* User Obligations */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Obligațiile Utilizatorului</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Prin utilizarea serviciilor noastre, vă angajați să:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Furnizați informații corecte și complete</li>
              <li>Nu utilizați serviciile în scopuri ilegale sau neautorizate</li>
              <li>Respectați drepturile de proprietate intelectuală</li>
              <li>Nu transmiteți conținut malițios sau dăunător</li>
              <li>Respectați confidențialitatea informațiilor primite</li>
            </ul>
          </section>

          {/* Commission and Payment */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Comisioane și Plăți</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Comisioanele pentru serviciile noastre sunt stabilite prin contracte individuale și variază în funcție de:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Tipul serviciului solicitat</li>
              <li>Valoarea tranzacției</li>
              <li>Complexitatea operațiunii</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              Plata comisionului se efectuează conform contractului de intermediere semnat între părți,
              de regulă la finalizarea tranzacției.
            </p>
          </section>

          {/* Data Protection */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Protecția Datelor cu Caracter Personal</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              BESTINVEST CAMIMOB respectă legislația în vigoare privind protecția datelor personale (GDPR -
              Regulamentul UE 2016/679). Datele dumneavoastră personale sunt colectate și procesate în scopul:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Furnizării serviciilor solicitate</li>
              <li>Comunicării cu dumneavoastră</li>
              <li>Îndeplinirii obligațiilor legale</li>
              <li>Îmbunătățirii serviciilor noastre</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              Aveți dreptul de acces, rectificare, ștergere, restricționare, portabilitate și opoziție
              privind datele dumneavoastră personale. Pentru exercitarea acestor drepturi, ne puteți
              contacta la adresa de email: contact@bestinvestcamimob.ro
            </p>
          </section>

          {/* Confidentiality */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Confidențialitate</h2>
            <p className="text-gray-700 leading-relaxed">
              Toate informațiile primite de la clienți sunt tratate cu strictă confidențialitate.
              Ne angajăm să nu dezvăluim informații personale sau despre proprietăți către terți,
              cu excepția cazurilor prevăzute de lege sau cu acordul expres al clientului.
            </p>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Proprietate Intelectuală</h2>
            <p className="text-gray-700 leading-relaxed">
              Conținutul acestui site web, inclusiv dar fără a se limita la texte, imagini, logo-uri,
              grafice și cod software, este proprietatea BESTINVEST CAMIMOB sau a furnizorilor de conținut
              și este protejat de legile privind drepturile de autor și proprietatea intelectuală.
            </p>
          </section>

          {/* Liability */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Limitarea Răspunderii</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              BESTINVEST CAMIMOB depune toate eforturile pentru a furniza informații corecte și actualizate,
              însă nu își asumă răspunderea pentru:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Erori sau omisiuni în informațiile publicate</li>
              <li>Indisponibilitatea temporară a serviciilor online</li>
              <li>Prejudicii indirecte rezultate din utilizarea serviciilor</li>
              <li>Modificări ale condițiilor de piață</li>
            </ul>
          </section>

          {/* Contract Termination */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Rezilierea Contractului</h2>
            <p className="text-gray-700 leading-relaxed">
              Contractele de intermediere pot fi reziliate conform clauzelor specificate în contractul individual.
              Ambele părți au dreptul de a rezilia contractul cu respectarea termenilor de preaviz stabiliți.
            </p>
          </section>

          {/* Dispute Resolution */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Soluționarea Litigiilor</h2>
            <p className="text-gray-700 leading-relaxed">
              Orice diferend apărut în legătură cu acești termeni și condiții va fi rezolvat pe cale amiabilă.
              În cazul în care nu se ajunge la o înțelegere, litigiile vor fi soluționate de instanțele
              judecătorești competente din România, conform legislației române.
            </p>
          </section>

          {/* Modifications */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Modificări</h2>
            <p className="text-gray-700 leading-relaxed">
              BESTINVEST CAMIMOB își rezervă dreptul de a modifica acești termeni și condiții în orice moment.
              Modificările vor fi publicate pe această pagină și vor intra în vigoare imediat după publicare.
              Continuarea utilizării serviciilor după modificări constituie acceptarea noilor termeni.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Date de Contact</h2>
            <div className="text-gray-700 leading-relaxed space-y-2">
              <p><strong>BESTINVEST CAMIMOB SRL</strong></p>
              <p>Adresă: Blv. Maresal Alexandru Averescu, nr.28, Buzău, România</p>
              <p>Telefon: +40 773 723 654</p>
              <p>Email: contact@bestinvestcamimob.ro</p>
              <p>Program: Luni - Vineri: 09:00 - 18:00 | Sâmbătă: 10:00 - 14:00</p>
            </div>
          </section>

          {/* Last Update */}
          <section className="border-t pt-6">
            <p className="text-sm text-gray-500">
              Ultima actualizare: {new Date().toLocaleDateString('ro-RO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
