import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { withRetry } from "@/lib/db-retry";
import type { Property } from "@/types/property";

const BASE_URL = "https://www.camimob.ro";

export type SeoFilter = {
  propertyType?: "APARTAMENT" | "CASA" | "TEREN" | "SPATIU_COMERCIAL";
  operationType?: "VANZARE" | "INCHIRIERE";
  rooms?: number;
  roomsGte?: number;
  zoneNormalized?: string;
};

export type SeoSection = { heading: string; body: string };

export type SeoPageConfig = {
  slug: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  sections: SeoSection[];
  faq: { q: string; a: string }[];
  filter: SeoFilter;
  breadcrumbLabel: string;
  /**
   * Keep the page indexable and in the sitemap even with zero offers.
   *
   * Set on the per-neighbourhood pages. A zone has slow stock rotation, so
   * going empty for a while is normal rather than a sign the page is
   * worthless — and the copy carries standalone local value (park, schools,
   * bus lines) plus a "leave us your criteria" call to action that only
   * works if Google can still surface it. Category pages keep the default
   * behaviour: empty means noindex.
   */
  keepIndexableWhenEmpty?: boolean;
};

export function normalizeText(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

export async function fetchSeoProperties(
  filter: SeoFilter
): Promise<Property[]> {
  const where: Record<string, unknown> = { status: "ACTIVE" };
  if (filter.propertyType) where.propertyType = filter.propertyType;
  if (filter.operationType) where.operationType = filter.operationType;
  if (filter.rooms !== undefined) where.rooms = filter.rooms;
  else if (filter.roomsGte !== undefined) where.rooms = { gte: filter.roomsGte };

  // Retried: these pages are prerendered at build time, and a Neon cold start
  // on the first query would otherwise fail the whole deploy.
  const rows = await withRetry(async () =>
    prisma.property.findMany({
      where,
      include: { images: { where: { isPrimary: true }, take: 1 } },
      orderBy: { createdAt: "desc" },
    })
  );

  const mapped: Property[] = rows.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    currency: (p as { currency?: string }).currency,
    zone: p.zone || "",
    comfort: p.comfort || undefined,
    street: p.street ?? "",
    surface: p.surface,
    rooms: p.rooms ?? 0,
    floor: p.floor ?? undefined,
    totalFloors: p.totalFloors ?? undefined,
    position: p.position || undefined,
    locality: p.locality,
    operationType: p.operationType,
    propertyType: p.propertyType,
    latitude: p.latitude ?? undefined,
    longitude: p.longitude ?? undefined,
    images: p.images.map((img) => ({ url: img.url, isPrimary: img.isPrimary })),
    description: p.description || undefined,
    createdAt: p.createdAt.toISOString(),
  }));

  if (filter.zoneNormalized) {
    return mapped.filter((p) =>
      normalizeText(p.zone).includes(filter.zoneNormalized!)
    );
  }
  return mapped;
}

export const SEO_PAGES: SeoPageConfig[] = [
  {
    slug: "apartamente-de-vanzare-buzau",
    title: "Apartamente de vânzare în Buzău | CAMIMOB",
    description:
      "Apartamente de vânzare în Buzău: garsoniere, 2, 3 și 4 camere în toate zonele orașului. Oferte verificate, vizionări rapide. Agenția imobiliară BESTINVEST CAMIMOB.",
    h1: "Apartamente de vânzare în Buzău",
    breadcrumbLabel: "Apartamente de vânzare",
    intro:
      "Cauți un apartament de vânzare în Buzău? Pe această pagină găsești ofertele active CAMIMOB pentru apartamente din toate cartierele orașului — de la garsoniere accesibile, până la apartamente spațioase cu 3 sau 4 camere, în Centru, Micro 3, Broșteni sau zona Unirii. Toate proprietățile sunt verificate de echipa noastră, cu acte la zi și prețuri stabilite în concordanță cu piața locală. Te ajutăm de la prima vizionare până la semnarea actelor la notar.",
    sections: [
      {
        heading: "Piața apartamentelor din Buzău: ce trebuie să știi",
        body: "Buzăul este un oraș cu peste 100.000 de locuitori, cu o piață imobiliară matură și relativ stabilă comparativ cu marile centre urbane. Cererea pentru apartamente vine din mai multe direcții: tineri care își cumpără prima locuință, familii care fac upgrade dintr-o garsonieră, investitori care caută randament din chirii, dar și buzoieni întorși din străinătate. În ultimii ani, prețurile apartamentelor în Buzău au crescut constant, însă rămân considerabil mai accesibile decât în Brașov, Constanța sau București — un apartament cu 2 camere se poate cumpăra cu un buget pe care în alte orașe l-ai aloca doar pentru o garsonieră. Pentru cumpărători, asta înseamnă valoare reală: spații generoase, blocuri reabilitate termic, acces facil la dotări urbane.",
      },
      {
        heading: "Tipuri de apartamente și zone populare",
        body: "Oferta de apartamente acoperă toate categoriile: garsoniere (cca. 25-35 mp), apartamente cu 2 camere (45-60 mp), 3 camere (60-80 mp) și apartamente mai mari de 4 camere sau duplexuri. Confortul variază de la confort 1 decomandat (cele mai căutate), la semidecomandat și nedecomandat. Cele mai active zone sunt: Centru (preț per metru pătrat ridicat, dar acces imediat la magazine, școli, instituții), Micro 3 (densitate mare, mijloace de transport, școli și grădinițe), Broșteni (mix rezidențial cu blocuri mai vechi și case), Unirii (zonă semicentrală, cu acces bun la centru), precum și cartierele Dorobanți și Bulevardul București. Fiecare zonă are propriul profil de cumpărător — Centru atrage tineri profesioniști și investitori în chirii, Micro 3 atrage familii cu copii, iar Broșteni rămâne o opțiune echilibrată ca preț.",
      },
      {
        heading: "La ce să fii atent înainte să cumperi un apartament în Buzău",
        body: "Înainte să semnezi orice, verifică trei lucruri esențiale: actele proprietății (extras de carte funciară recent, certificat fiscal, dovada că nu există ipoteci sau litigii), starea reală a apartamentului (instalații electrice, sanitare, termopane, izolație termică — un apartament cu izolație exterioară te scutește de facturi mari la iarnă) și asociația de proprietari (cere ultimul proces verbal pentru a vedea dacă există datorii sau lucrări planificate la bloc). Pentru creditele ipotecare, băncile cer evaluare oficială — la CAMIMOB facem evaluări recunoscute de toate băncile mari. Dacă ești la prima achiziție, verifică și programul Noua Casă, care îți poate reduce semnificativ avansul necesar.",
      },
      {
        heading: "Cum te ajută CAMIMOB",
        body: "Echipa BESTINVEST CAMIMOB lucrează în Buzău de ani de zile și cunoaște fiecare cartier, fiecare bloc, fiecare nuanță a pieței locale. Te ajutăm cu: filtrarea ofertelor reale (eliminăm anunțurile cu prețuri umflate sau acte incomplete), organizarea vizionărilor în zilele și orele care îți convin, negocierea prețului final, verificarea documentelor cu un specialist juridic, evaluarea pentru bancă, asistență la notar și predarea cheilor. Comisionul este transparent, fără surprize. Sună-ne sau completează formularul de contact și un consultant CAMIMOB te va contacta în maxim câteva ore pentru a-ți face o ofertă personalizată în funcție de bugetul și preferințele tale.",
      },
    ],
    faq: [
      {
        q: "Cât costă în medie un apartament în Buzău?",
        a: "Prețul depinde puternic de zonă, număr de camere, an construcție și confort. La momentul actual, o garsonieră pornește de la cca. 30.000 EUR, un apartament cu 2 camere variază între 45.000 și 70.000 EUR, iar 3 camere între 60.000 și 90.000 EUR. Centru și apartamentele recent renovate ajung mai sus.",
      },
      {
        q: "Pot cumpăra cu credit ipotecar prin CAMIMOB?",
        a: "Da. Facem evaluări recunoscute de băncile mari (BCR, BRD, Raiffeisen, Banca Transilvania, ING etc.) și te asistăm cu documentația până la finalizarea creditului.",
      },
      {
        q: "Cât durează procesul de la rezervare la cheile predate?",
        a: "În medie 30-60 de zile pentru tranzacțiile cu credit ipotecar și 15-30 de zile pentru cele cu plata integrală. Variațiile țin de timpul de evaluare bancară, de pregătirea actelor la vânzător și de programarea notarului.",
      },
    ],
    filter: { propertyType: "APARTAMENT", operationType: "VANZARE" },
  },
  {
    slug: "apartamente-de-inchiriat-buzau",
    title: "Apartamente de închiriat în Buzău | CAMIMOB",
    description:
      "Apartamente de închiriat în Buzău: garsoniere și apartamente cu 2 camere în Centru, Micro 3, Broșteni, Crâng, Orizont și Unirii Sud. Contracte corecte, proprietari verificați. BESTINVEST CAMIMOB.",
    h1: "Apartamente de închiriat în Buzău",
    breadcrumbLabel: "Apartamente de închiriat",
    intro:
      "Cauți o locuință de închiriat în Buzău? Pe această pagină găsești apartamentele disponibile acum în portofoliul CAMIMOB — garsoniere și apartamente cu 2 camere, în zone precum Centru, Micro 3, Broșteni, Crâng, Orizont și Unirii Sud. Fiecare ofertă este verificată de echipa noastră: proprietar real, acte în regulă, chirie stabilită corect față de piața locală. Te ajutăm de la prima vizionare până la semnarea contractului și predarea cheilor, fără surprize pe parcurs.",
    sections: [
      {
        heading: "Cât costă o chirie în Buzău",
        body: "Chiriile din Buzău rămân semnificativ mai accesibile decât în Brașov, Constanța sau București, iar oferta se concentrează pe garsoniere și apartamente cu 2 camere — exact segmentul cu cea mai mare cerere. În portofoliul nostru actual, chiriile pentru apartamente se situează în intervalul 1.400–2.300 lei pe lună, iar ofertele cotate în euro între 350 și 400 EUR lunar. Diferențele vin din zonă, suprafață, etaj, nivelul de mobilare și starea apartamentului: un apartament recent renovat și mobilat complet în Centru se închiriază la capătul superior al intervalului, în timp ce o garsonieră nemobilată într-un cartier semicentral pleacă de la minim. La chirie se adaugă de regulă întreținerea și utilitățile, care iarna pot cântări serios într-un bloc fără reabilitare termică — întreabă întotdeauna cât au fost facturile în ultimul sezon rece, nu doar cât este chiria.",
      },
      {
        heading: "Ce verifici înainte să semnezi contractul",
        body: "Un contract de închiriere bun previne aproape toate conflictele ulterioare. Înainte să semnezi, clarifică în scris: durata contractului și condițiile de prelungire; valoarea garanției și, foarte important, în ce situații se reține și în cât timp se restituie; cine plătește întreținerea, cine utilitățile și cine eventualele reparații; dacă sunt permise animale de companie; dacă ai dreptul să faci modificări (găuri în perete, schimbat mobilier). Fă obligatoriu un proces-verbal de predare-primire cu inventarul mobilierului și al electrocasnicelor, plus fotografii datate ale stării apartamentului — este singura protecție reală a garanției tale. Notează indexul contoarelor de apă, gaz și curent în ziua mutării și cere ultima dovadă de plată a întreținerii, ca să nu moștenești datoriile fostului chiriaș la asociație. Verifică și cine este efectiv proprietarul: cere extrasul de carte funciară, nu te baza pe declarații.",
      },
      {
        heading: "Obligațiile proprietarului și ale chiriașului",
        body: "Proprietarul datorează un apartament în stare de folosință, cu instalații funcționale, și răspunde de reparațiile majore — centrală, instalație electrică, țevi, acoperiș, tocărie. Are obligația să încheie contract scris și să își declare veniturile din chirie la ANAF; regimul fiscal și termenele se schimbă periodic, așa că recomandăm confirmarea cu un contabil înainte de prima declarație. Chiriașul răspunde de întreținerea curentă, de plata la timp a chiriei și a utilităților, și de folosirea apartamentului potrivit destinației de locuință. Pentru ambele părți, o asigurare facultativă a locuinței costă puțin și acoperă exact scenariile care generează cele mai urâte dispute: inundarea vecinului de la parter, un scurtcircuit, un geam spart. Dacă închiriezi pentru o firmă sau ai nevoie de contract înregistrat pentru viză, spune-ne de la început — documentația diferă.",
      },
      {
        heading: "Cum te ajută CAMIMOB la închiriere",
        body: "Lucrăm în Buzău de ani de zile și cunoaștem proprietarii, blocurile și nivelul real al chiriilor din fiecare cartier. Pentru chiriași, asta înseamnă că îți arătăm doar apartamente care există, la prețul anunțat, cu proprietar dispus să semneze contract — fără anunțuri-momeală și fără vizionări pierdute. Organizăm vizionările grupat, în intervalul orar care îți convine, și negociem în locul tău acolo unde chiria este peste piață. Pentru proprietari, selectăm chiriași serioși, verificăm capacitatea de plată, redactăm contractul și procesul-verbal de predare, și rămânem punct de contact pe durata închirierii. Comisionul este transparent, comunicat înainte de orice vizionare. Contactează-ne și îți pregătim o listă personalizată cu apartamentele de închiriat care se potrivesc bugetului și zonei tale.",
      },
    ],
    faq: [
      {
        q: "Cât este chiria medie pentru un apartament în Buzău?",
        a: "În portofoliul nostru actual, apartamentele de închiriat se încadrează între 1.400 și 2.300 lei pe lună, iar cele cotate în euro între 350 și 400 EUR. Prețul final depinde de zonă, suprafață, etaj și gradul de mobilare. Întreținerea și utilitățile se plătesc de regulă separat.",
      },
      {
        q: "Ce garanție se cere la închiriere?",
        a: "Practica uzuală în Buzău este o garanție egală cu o chirie lunară, plătită la semnarea contractului și restituită la final dacă apartamentul este predat în starea din procesul-verbal. Unii proprietari cer și prima lună în avans. Condițiile exacte de reținere trebuie scrise în contract.",
      },
      {
        q: "Pe ce perioadă se încheie contractul de închiriere?",
        a: "Cel mai frecvent pe 12 luni, cu posibilitate de prelungire. Se pot încheia și contracte mai scurte, dar proprietarii preferă durata de un an pentru stabilitate. Verifică întotdeauna clauza de reziliere anticipată și termenul de preaviz — de obicei 30 de zile.",
      },
    ],
    filter: { propertyType: "APARTAMENT", operationType: "INCHIRIERE" },
  },
  {
    slug: "apartamente-2-camere-buzau",
    title: "Apartamente 2 camere de vânzare în Buzău | CAMIMOB",
    description:
      "Apartamente cu 2 camere de vânzare în Buzău. Garsoniere transformate, decomandate sau semidecomandate, în Centru, Micro 3 sau Broșteni. Vezi ofertele CAMIMOB.",
    h1: "Apartamente 2 camere de vânzare în Buzău",
    breadcrumbLabel: "Apartamente 2 camere",
    intro:
      "Apartamentele cu 2 camere sunt cele mai căutate proprietăți din Buzău — un echilibru perfect între preț accesibil și spațiu suficient pentru un cuplu, o familie tânără sau un investitor care vrea să le închirieze. Pe această pagină găsești ofertele active CAMIMOB pentru apartamente de 2 camere în toate zonele orașului, de la unități compacte de 40 mp până la apartamente generoase de 60 mp, decomandate, în blocuri reabilitate termic.",
    sections: [
      {
        heading: "De ce 2 camere este cea mai populară opțiune în Buzău",
        body: "Cererea pentru apartamente cu 2 camere depășește constant orice altă categorie. Motivele sunt practice: este suficient pentru un cuplu fără copii sau cu un copil mic, este accesibil ca preț pentru bugetele medii ale familiilor din Buzău, iar la revânzare se vinde rapid pentru că audiența potențială este largă. Pentru investitori, este și cel mai bun raport randament/preț — chiriile pentru 2 camere pleacă de la 250-300 EUR pe lună, iar gradul de ocupare anuală este aproape 100% în zonele centrale și semicentrale. Apartamentele cu 2 camere se împart în două categorii principale: decomandate (cele două camere nu comunică între ele, mai scumpe, mai căutate) și semidecomandate (una dintre camere este de trecere către cealaltă, mai accesibile ca preț).",
      },
      {
        heading: "Diferențe între blocurile vechi și noi",
        body: "Blocurile construite înainte de 1990 (cele mai multe din Micro 3, Broșteni, Centru) au structura tipică din panouri prefabricate, cu un layout decomandat sau semidecomandat. Avantajul principal: prețul mai mic. Dezavantaje: instalațiile pot necesita modernizare (electrică, sanitară, termică), iar izolația originală este insuficientă — caută blocuri cu reabilitare termică finalizată. Blocurile noi (post-2010, în special pe Bulevardul București sau în zonele de extindere) oferă confort modern, izolație de fabrică, parcare proprie și uneori facilități suplimentare (lift, interfon video). Diferența de preț poate fi de 30-50% între un apartament vechi și unul nou la aceeași suprafață. Decizia ține de buget și de timpul/banii pe care ești dispus să-i investești în renovare.",
      },
      {
        heading: "Sfaturi pentru cumpărarea unui apartament 2 camere",
        body: "Înainte să faci o ofertă, verifică câteva detalii care fac diferența pe termen lung: orientarea apartamentului (sud și est sunt cele mai bune pentru lumină naturală și încălzire iarna), etajul (1-3 sunt cele mai practice, parter este mai ieftin dar are dezavantaje, etajele superioare au priveliște dar pot avea probleme cu acoperișul), starea baii și bucătăriei (cele mai costisitoare de renovat), instalația electrică (dacă încă mai are tablou vechi cu siguranțe fuzibile, vei avea de reinvestit). Cere certificatul energetic — o clasă A sau B înseamnă facturi mici la iarnă; o clasă D sau E înseamnă investiții suplimentare în izolație. Negociază, dar realistă: în Buzău, marja de negociere este de obicei între 3% și 8% din prețul cerut.",
      },
      {
        heading: "Tranzacția pas cu pas cu CAMIMOB",
        body: "Te ajutăm să găsești apartamentul potrivit și să eviți capcanele frecvente. Procesul standard CAMIMOB: 1) Discuție inițială pentru a înțelege bugetul, preferințele și termenii (credit/cash); 2) Selectarea ofertelor relevante din portofoliul nostru, fără să-ți pierdem timpul cu opțiuni nepotrivite; 3) Vizionări organizate eficient (4-5 apartamente într-o singură vizită); 4) Verificarea actelor și a stării apartamentului; 5) Negociere și antecontract; 6) Evaluare pentru bancă (dacă e credit); 7) Notariat și predarea cheilor. Toți pașii sunt asistați de un consultant CAMIMOB dedicat. Contactează-ne pentru o consultație gratuită — îți răspundem în câteva ore.",
      },
    ],
    faq: [
      {
        q: "Care este suprafața tipică a unui apartament cu 2 camere în Buzău?",
        a: "Între 40 și 60 mp utili. Apartamentele decomandate confort 1 sunt în general 50-55 mp, semidecomandate confort 2 sunt 40-48 mp, iar cele din blocuri noi pot ajunge la 55-65 mp.",
      },
      {
        q: "Pot închiria după achiziție? Cât pot lua chirie?",
        a: "Da, apartamentele cu 2 camere se închiriază excelent. Chiria medie la momentul actual: 250-450 EUR/lună, în funcție de zonă, mobilier și starea apartamentului. Yield brut anual: 6-10%.",
      },
      {
        q: "Ce înseamnă confort 1, 2, 3?",
        a: "Confort 1 = apartamente cu camere mai mari (>10 mp dormitor), băi spațioase și bucătărie separată. Confort 2 = camere mai mici, baie mai mică. Confort 3 = cel mai compact și mai vechi tipologic. Confort 1 este cel mai căutat și se vinde cu cel mai mare preț pe metru pătrat.",
      },
    ],
    filter: { propertyType: "APARTAMENT", operationType: "VANZARE", rooms: 2 },
  },
  {
    slug: "apartamente-3-camere-buzau",
    title: "Apartamente 3 camere de vânzare în Buzău | CAMIMOB",
    description:
      "Apartamente cu 3 camere de vânzare în Buzău: ideal pentru familii. Confort 1 decomandate, în Centru, Micro 3 sau Broșteni. Vezi oferta CAMIMOB.",
    h1: "Apartamente 3 camere de vânzare în Buzău",
    breadcrumbLabel: "Apartamente 3 camere",
    intro:
      "Apartamentul cu 3 camere este alegerea naturală pentru familiile cu unul sau mai mulți copii și pentru cei care au nevoie de un birou separat acasă. Pe această pagină găsești ofertele active CAMIMOB pentru apartamente cu 3 camere în Buzău, de la unități compacte semidecomandate de 60 mp până la apartamente confort 1 decomandate de 85 mp, în toate cartierele orașului.",
    sections: [
      {
        heading: "Apartamentele cu 3 camere — alegerea familiilor",
        body: "În Buzău, apartamentele cu 3 camere reprezintă a doua cea mai vândută categorie după 2 camere, dar prima ca volum în segmentul familial. Tipologia clasică din blocurile de panouri prefabricate este 3 camere decomandate confort 1, cu suprafețe între 65 și 78 mp utili. Avantajul major față de 2 camere este flexibilitatea: ai un dormitor matrimonial, o cameră pentru copii sau două (în funcție de configurație) și un living separat. Pentru cei care lucrează de acasă, una dintre camere se poate transforma în birou. Pe piața locală, prețul mediu pe metru pătrat la 3 camere este de obicei ușor mai mic decât la 2 camere — pentru că pe metru pătrat plătești mai puțin pentru spațiul comun (baie, bucătărie, hol).",
      },
      {
        heading: "Variații de plan și ce să cauți",
        body: "Cele mai bune apartamente cu 3 camere sunt cele decomandate cu băile și bucătăria pe culoar separat de zona de zi, pentru intimitate. Atenție însă: nu toate blocurile au același plan. Întreabă explicit: bucătăria este separată sau open-space cu livingul? Câte băi există? Există balcon și pe câte camere se deschide? Care este orientarea camerelor (sud-est este idealul pentru un apartament cu 3 camere — soare dimineață în dormitor și după-amiază în living)? Pentru familiile cu copii mici, etajele 2-4 sunt cele mai practice — suficient de sus pentru liniște și siguranță, suficient de jos pentru acces facil cu căruciorul. Verifică obligatoriu și prezența parcării asociate apartamentului sau a parcării de reședință din zonă.",
      },
      {
        heading: "Buget și finanțare",
        body: "La momentul actual în Buzău, un apartament cu 3 camere pornește de la cca. 55.000 EUR (semidecomandat, confort inferior, etaj sau bloc nereabilitat) și ajunge până la 100.000+ EUR pentru apartamente noi sau extensiv renovate în zone centrale. Mediana pieței este în jur de 70.000-85.000 EUR pentru un decomandat confort 1 în Micro 3 sau Broșteni. Pentru credit ipotecar, băncile cer un avans minim de 15% (sau 5% în programul Noua Casă, cu garanție de stat). Rata lunară pentru un credit de 60.000 EUR pe 25 de ani este aproximativ 300-400 EUR la dobânzile actuale, ceea ce face apartamentul cu 3 camere accesibil pentru un cuplu cu două salarii medii din Buzău.",
      },
      {
        heading: "De ce să lucrezi cu CAMIMOB",
        body: "Suntem o agenție imobiliară locală, nu o platformă online — cunoaștem proprietarii, cunoaștem blocurile, cunoaștem istoria fiecărei zone. Pentru un apartament cu 3 camere, unde tranzacția este mai mare ca valoare, miza este să eviți greșelile costisitoare: să cumperi într-un bloc cu probleme de structură, să plătești în plus pentru un defect ascuns, să te trezești cu acte incomplete care întârzie creditul. Consultanții CAMIMOB verifică toate aceste aspecte înainte să-ți recomandăm o ofertă. În plus, dacă vinzi un apartament mai mic pentru a cumpăra unul de 3 camere, te ajutăm să coordonăm cele două tranzacții (vânzare + cumpărare) astfel încât să nu rămâi temporar fără locuință. Solicită o consultație gratuită.",
      },
    ],
    faq: [
      {
        q: "Care e diferența între confort 1 și confort 2 la 3 camere?",
        a: "Confort 1: camere mai mari (dormitor >12 mp, living >18 mp), baie cu cadă, bucătărie separată cu loc pentru masă. Confort 2: camere mai compacte, baie mai mică, bucătărie redusă. Confort 1 se vinde cu cca. 10-15% mai scump pe metru pătrat.",
      },
      {
        q: "Pot transforma un apartament cu 3 camere în 2 camere mari?",
        a: "Da, prin desființarea unui perete (dacă nu este perete structural — obligatoriu verifică). Această modificare necesită aviz de la asociația de proprietari și uneori autorizație. Crește valoarea apartamentului dacă transformarea este făcută cu gust.",
      },
      {
        q: "Care e cea mai bună zonă din Buzău pentru un apartament cu 3 camere și familie?",
        a: "Depinde de prioritate: pentru școli și grădinițe — Micro 3; pentru centralitate și locuri de muncă — Centru și Unirii; pentru raport calitate-preț — Broșteni și Dorobanți; pentru blocuri noi cu parcare — zonele de extindere către Bulevardul București.",
      },
    ],
    filter: { propertyType: "APARTAMENT", operationType: "VANZARE", rooms: 3 },
  },
  {
    slug: "garsoniere-buzau",
    title: "Garsoniere de vânzare în Buzău | CAMIMOB",
    description:
      "Garsoniere de vânzare în Buzău: prima locuință accesibilă, investiție pentru închiriere, sau opțiune pentru studenți. Vezi ofertele CAMIMOB cu acte verificate.",
    h1: "Garsoniere de vânzare în Buzău",
    breadcrumbLabel: "Garsoniere",
    intro:
      "Garsoniera este, pentru mulți buzoieni, prima cumpărare imobiliară: o intrare accesibilă pe piața proprietății, un pas firesc după chirie, sau o investiție inteligentă pentru închiriere lunară. Pe această pagină găsești garsonierele active din portofoliul CAMIMOB — apartamente cu o singură cameră, de regulă între 25 și 35 mp utili, în toate zonele orașului. Filtrate, verificate, cu prețuri reale.",
    sections: [
      {
        heading: "Cine cumpără garsoniere în Buzău",
        body: "Există patru profiluri principale de cumpărători pentru garsoniere în Buzău. Primul: tinerii la prima locuință — angajați cu salarii medii, care încep cu o garsonieră ca să iasă de la părinți sau din chirie. Al doilea: investitorii — care cumpără și închiriază (yieldul anual din chirie este de obicei 7-10%, peste alternativele bancare). Al treilea: părinții care cumpără pentru copii (în special pentru studenții care învață în Buzău sau în orașele învecinate). Al patrulea: cumpărători în vârstă care fac downsize dintr-un apartament mai mare. Pentru fiecare profil, criteriile contează diferit — un investitor caută zone cu cerere mare de chirii, un tânăr caută poziție centrală și liniștită, iar pentru părinți contează apropierea de școli sau facultăți.",
      },
      {
        heading: "Tipologii de garsoniere",
        body: "Garsonierele din Buzău se împart în trei tipologii. Garsoniera clasică confort 1 (28-35 mp) — o cameră generoasă care funcționează ca living și dormitor, baie completă cu cadă, bucătărie separată mică. Garsoniera dublă (40-45 mp) — o variantă mai rară, cu un decomandat parțial, o nișă pentru pat separată de zona de zi. Studio nou (25-32 mp în blocuri post-2010) — open space modern cu bucătărie integrată, baie cu duș. Cele clasice sunt cele mai multe în Micro 3 și Broșteni. Studio-urile noi se găsesc preponderent pe Bulevardul București și zonele de extindere. Decizia depinde de preferința între ieftin/clasic vs. modern/preț mai mare.",
      },
      {
        heading: "Preț, randament, finanțare",
        body: "La momentul actual în Buzău, garsonierele pornesc de la cca. 25.000-30.000 EUR (semicentrale, etajul 1 sau 4 fără lift, fără renovare recentă) și ajung la 45.000-55.000 EUR (centrale, recent renovate, mobilate complet sau în blocuri noi). Pentru investitori, randamentul brut anual este: chirie 200-280 EUR/lună × 12 = 2.400-3.360 EUR / preț de achiziție = 7-10%. Yield net (după întreținere, mici reparații, perioade neocupate) este 5-8%, semnificativ peste dobânzile la depozite bancare. Pentru credit ipotecar, garsoniera este cea mai ușor de finanțat — avansul de 15% înseamnă doar 4.000-7.000 EUR, accesibil pentru un tânăr cu economii minime sau cu ajutor familial.",
      },
      {
        heading: "La ce să fii atent la cumpărarea unei garsoniere",
        body: "Garsoniera, fiind mică, scoate la iveală orice problemă de spațiu sau funcționalitate. Verifică: bucătăria — există ventilație corectă? hota poate fi instalată? există racord pentru gaz sau e doar curent electric? Baia — are aerisire? țevile sunt schimbate? cada/dușul are spațiu rezonabil? Depozitarea — există dulapuri sau cămară? balconul (dacă există) — este închis cu termopan sau deschis? La revânzare, garsonierele cu balcon închis și cu mobilier de bucătărie complet se vând cu 10-15% mai bine decât cele fără. Atenție și la regimul de înălțime al blocului și la lift — un bloc P+10 fără lift este mai dificil de vândut decât un P+4 cu lift.",
      },
    ],
    faq: [
      {
        q: "Pot lua credit Noua Casă pentru o garsonieră?",
        a: "Da, dacă prețul nu depășește 70.000 EUR (limita programului) și apartamentul are minimum 14 mp utili de cameră, conform criteriilor programului. Majoritatea garsonierelor din Buzău se încadrează.",
      },
      {
        q: "Cât pot închiria o garsonieră în Buzău?",
        a: "Între 200 și 320 EUR/lună, în funcție de zonă, mobilier, dotări și starea apartamentului. Garsonierele centrale mobilate complet pleacă de la 280 EUR.",
      },
      {
        q: "Garsonierele se vând rapid dacă vreau să revând?",
        a: "Da. Sunt cea mai lichidă categorie de pe piață, datorită bugetului mic de intrare. O garsonieră în condiții bune se vinde de obicei în 1-3 luni la preț corect de piață.",
      },
    ],
    filter: { propertyType: "APARTAMENT", operationType: "VANZARE", rooms: 1 },
  },
  {
    slug: "garsoniere-de-inchiriat-buzau",
    title: "Garsoniere de închiriat în Buzău | CAMIMOB",
    description:
      "Garsoniere de închiriat în Buzău: 26–36 mp, mobilate sau nemobilate, în Broșteni, Orizont și zonele semicentrale. Contracte corecte, proprietari verificați. CAMIMOB.",
    h1: "Garsoniere de închiriat în Buzău",
    breadcrumbLabel: "Garsoniere de închiriat",
    intro:
      "Garsoniera este cea mai căutată formă de închiriere din Buzău: costul lunar cel mai mic, utilități reduse și suficient spațiu pentru o persoană sau un cuplu. Pe această pagină găsești garsonierele disponibile acum în portofoliul CAMIMOB — suprafețe între 26 și 36 mp, în zone precum Broșteni și Orizont. Fiecare ofertă este verificată: proprietar real, dispus să semneze contract, cu chirie stabilită corect față de piața locală.",
    sections: [
      {
        heading: "Cine închiriază garsoniere în Buzău",
        body: "Cererea pentru garsoniere de închiriat vine din patru direcții destul de clare. Tineri angajați la primul loc de muncă, pentru care o garsonieră este pasul firesc după ce pleacă de la părinți — costul lunar total (chirie plus întreținere) rămâne gestionabil cu un salariu de început. Elevi și studenți care învață în Buzău sau fac naveta către centrele universitare apropiate. Navetiști care lucrează în Buzău câteva zile pe săptămână și preferă o garsonieră ieftină în loc de drum zilnic. Și persoane singure, inclusiv după o separare sau la pensionare, care fac downsize dintr-un apartament mai mare. Pentru fiecare profil contează altceva: pentru tineri și studenți, apropierea de centru și de transportul în comun; pentru navetiști, accesul rapid la ieșirile din oraș; pentru persoanele în vârstă, liniștea și magazinele de proximitate.",
      },
      {
        heading: "Ce suprafață și ce dotări să aștepți",
        body: "Garsonierele din Buzău se încadrează în general între 26 și 36 mp utili. Sub 30 mp sunt garsonierele clasice din blocurile anilor '70-'80: o cameră care funcționează ca living și dormitor, bucătărie separată mică, baie cu cadă sau duș. Peste 32 mp apar variantele mai confortabile, uneori cu o nișă separată pentru pat sau cu balcon închis în termopan. Gradul de mobilare face cea mai mare diferență de preț: o garsonieră mobilată complet, cu mașină de spălat, frigider și plită funcționale, se închiriază cu 20-30% mai scump decât una nemobilată, dar te scutește de o investiție inițială de câteva mii de lei. Întreabă explicit ce rămâne în apartament și cere să fie trecut în procesul-verbal — „mobilat” înseamnă lucruri foarte diferite pentru proprietari diferiți.",
      },
      {
        heading: "Costul real lunar, nu doar chiria",
        body: "În portofoliul nostru actual, garsonierele de închiriat se situează între 1.400 și 2.300 lei pe lună. Capătul de jos corespunde garsonierelor nemobilate sau parțial mobilate din cartiere semicentrale; capătul de sus, celor recent renovate și complet utilate, în zone mai căutate. Dar chiria este doar o parte din cost. La ea se adaugă întreținerea (care într-un bloc nereabilitat termic poate urca semnificativ în lunile de iarnă), curentul electric, internetul și, la unele blocuri, un fond de reparații. Înainte să te decizi, cere proprietarului facturile din ianuarie sau februarie ale anului precedent — o garsonieră cu chirie mică într-un bloc neizolat poate ieși mai scumpă pe total decât una cu chirie mai mare într-un bloc reabilitat. Mai pune în calcul garanția, de regulă echivalentul unei chirii, plătită la semnare.",
      },
      {
        heading: "Cum te ajută CAMIMOB",
        body: "Garsonierele se închiriază repede, uneori în câteva zile, iar anunțurile false sau cu preț momeală sunt frecvente exact în acest segment. Lucrăm în Buzău de ani de zile și verificăm fiecare ofertă înainte să o publicăm: proprietarul este cine spune că este, apartamentul există la prețul anunțat, iar actele permit încheierea unui contract valabil. Îți organizăm vizionările grupat, ca să vezi mai multe garsoniere într-o singură deplasare, redactăm contractul și procesul-verbal de predare-primire cu inventar, și notăm indexul contoarelor în ziua mutării — cele trei lucruri care previn aproape toate disputele de la final. Dacă ești proprietar și vrei să îți închiriezi garsoniera, selectăm chiriași cu capacitate de plată verificată și rămânem punct de contact pe durata contractului. Contactează-ne pentru o listă personalizată.",
      },
    ],
    faq: [
      {
        q: "Cât costă o garsonieră de închiriat în Buzău?",
        a: "În portofoliul nostru actual, între 1.400 și 2.300 lei pe lună, în funcție de suprafață, zonă și gradul de mobilare. Întreținerea, curentul și internetul se plătesc separat, iar la semnare se adaugă de regulă o garanție egală cu o chirie.",
      },
      {
        q: "Se poate închiria o garsonieră nemobilată?",
        a: "Da, există ambele variante. Nemobilat este mai ieftin lunar, dar presupune o investiție inițială în mobilier și electrocasnice. Dacă stai mai puțin de un an, mobilat iese aproape sigur mai avantajos pe total.",
      },
      {
        q: "Ce documente îmi trebuie ca chiriaș?",
        a: "În mod normal doar actul de identitate și o dovadă a venitului (adeverință de salariu sau extras de cont). Unii proprietari cer și un garant. Contractul se încheie în scris, iar proprietarul are obligația să își declare venitul din chirie.",
      },
    ],
    filter: { propertyType: "APARTAMENT", operationType: "INCHIRIERE", rooms: 1 },
  },
  {
    slug: "case-de-vanzare-buzau",
    title: "Case de vânzare în Buzău | CAMIMOB",
    description:
      "Case de vânzare în Buzău: vile, case individuale, case cu curte și grădină. În oraș și în zonele rezidențiale de margine. Oferta CAMIMOB cu acte verificate.",
    h1: "Case de vânzare în Buzău",
    breadcrumbLabel: "Case de vânzare",
    intro:
      "Visul de a locui în casa ta, cu curtea ta, cu grădina și liniștea aferentă, este astăzi mai accesibil decât crezi în Buzău. Pe această pagină găsești casele active din portofoliul CAMIMOB — de la case compacte intra-vilan, la vile generoase în zone rezidențiale, până la case mai vechi cu potențial de renovare. Toate cu acte verificate și prețuri stabilite corect față de piața locală.",
    sections: [
      {
        heading: "Piața caselor din Buzău",
        body: "Spre deosebire de apartamente, piața caselor din Buzău este mai eterogenă și mai puțin lichidă — fiecare casă are particularitățile ei (suprafața terenului, regimul de înălțime, anul construcției, materialele folosite, starea infrastructurii din zonă). Buzăul oferă opțiuni pe trei niveluri de preț: case intra-vilan vechi (50.000-100.000 EUR, în zone semicentrale, necesită investiții în renovare), case medii (100.000-180.000 EUR, în zone rezidențiale consolidate, în condiții bune, gata de locuit) și vile noi sau extensiv renovate (180.000-350.000+ EUR, în zonele de extindere către Vernești, Mărăcineni sau pe străzi rezidențiale liniștite din oraș). Pentru bugete corespunzătoare, raportul calitate/preț față de Brașov sau Constanța rămâne foarte avantajos.",
      },
      {
        heading: "Avantajele unei case versus apartament",
        body: "Casa oferă spațiu, intimitate, libertate de modificare și — pentru familii — un mediu sănătos pentru copii (curte, grădină, posibilitate de animale de companie). Pe termen lung, casa proprie este și o investiție rezonabilă: terenul nu se devalorizează, iar valoarea construcției poate crește prin îmbunătățiri progresive. Atenție însă la costurile reale ale unei case: încălzirea unei case de 150 mp este de 2-3 ori mai scumpă decât a unui apartament; reparațiile sunt în întregime responsabilitatea proprietarului (acoperiș, fațadă, instalații, sistem de încălzire); iarna înseamnă deszăpezit propriu; iar dacă pleci în vacanță, casa rămâne nesupravegheată. Aceste detalii sunt importante de luat în calcul înainte de decizie.",
      },
      {
        heading: "La ce să te uiți obligatoriu la o casă",
        body: "Lista de verificări pentru o casă este mai lungă decât pentru un apartament: 1) Acte cadastrale și de carte funciară complete — verifică ca terenul și construcția să fie corect intabulate și să nu existe diferențe între suprafața reală și cea din acte; 2) Fundație și structură — caută urme de igrasie, fisuri în pereți, dale lăsate; 3) Acoperiș — întreabă când a fost ultima reabilitare; un acoperiș vechi costă 10.000-20.000 EUR să-l refaci; 4) Instalație electrică — în casele vechi este obligatorie evaluarea de specialist; 5) Sistem de încălzire — centrală pe gaz sau peleți, în funcție de preferință și costurile lunare; 6) Utilități — racord la rețeaua de apă, canalizare, gaz, curent electric trifazic dacă e cazul; 7) Drumul de acces și starea străzii — asfaltată? cu trotuar? bine luminată noaptea? 8) Riscul de inundații — Buzăul are zone joase apropiate de râu unde apa freatică este mare.",
      },
      {
        heading: "De ce să cumperi casa cu CAMIMOB",
        body: "Achiziția unei case este o decizie cu impact major financiar și familial. Greșelile costă mult mai mult decât la un apartament. Consultanții CAMIMOB îți pun la dispoziție cunoașterea pieței locale, accesul la o rețea de specialiști (avocați, evaluatori autorizați, ingineri constructori care pot face o evaluare tehnică rapidă a casei) și experiența în negocieri pentru proprietăți de valoare mare. Te ajutăm cu vizionări multiple, cu inspecție tehnică înainte de antecontract, cu negociere realistă a prețului și cu toată documentația notarială până la predarea cheilor. Dacă vinzi un apartament pentru a cumpăra o casă, organizăm și coordonarea celor două tranzacții. Solicită o consultație gratuită cu un consultant specializat în case.",
      },
    ],
    faq: [
      {
        q: "Pot lua credit ipotecar pentru o casă în Buzău?",
        a: "Da. Băncile finanțează casele cu acte complete și carte funciară. Avansul este similar cu apartamentele (15% sau 5% în Noua Casă, dacă casa se încadrează în limita programului). Evaluarea durează puțin mai mult decât la apartament — 5-7 zile lucrătoare.",
      },
      {
        q: "Care e diferența dintre intravilan și extravilan?",
        a: "Intravilan = teren situat în interiorul limitelor administrative ale orașului, pe care poți construi locuință conform PUZ-ului în vigoare. Extravilan = teren în afara orașului, agricol, pe care construcția necesită schimbarea categoriei de folosință. Casele și terenurile pentru locuire trebuie să fie obligatoriu pe teren intravilan.",
      },
      {
        q: "Cât costă întreținerea anuală a unei case medii în Buzău?",
        a: "Aproximativ 3.000-5.000 EUR/an pentru o casă de 120-150 mp: încălzire (1.200-2.000 EUR iarna), curent + apă (600-900 EUR), reparații/întreținere curentă (500-1.500 EUR), impozit + asigurare (300-500 EUR). Variațiile țin de izolație, sursa de încălzire și vechimea casei.",
      },
    ],
    filter: { propertyType: "CASA", operationType: "VANZARE" },
  },
  {
    slug: "apartamente-brosteni-buzau",
    title: "Apartamente în cartierul Broșteni, Buzău | CAMIMOB",
    description:
      "Apartamente de vânzare în cartierul Broșteni, Buzău. Zonă rezidențială echilibrată, prețuri accesibile, acces facil spre Centru. Vezi ofertele CAMIMOB.",
    h1: "Apartamente în cartierul Broșteni, Buzău",
    breadcrumbLabel: "Apartamente Broșteni",
    intro:
      "Cartierul Broșteni este una dintre cele mai stabile zone rezidențiale din Buzău: prețuri accesibile, raport calitate/preț favorabil, infrastructură matură și conexiuni bune cu restul orașului. Pe această pagină găsești ofertele active CAMIMOB pentru apartamente în Broșteni — garsoniere, 2 camere, 3 camere — în blocuri reabilitate sau cu potențial de renovare.",
    sections: [
      {
        heading: "Despre cartierul Broșteni",
        body: "Broșteni este un cartier rezidențial al Buzăului care îmbină blocurile clasice din anii '70-'80 cu zone de case individuale și curți. Este apreciat de cumpărători pentru raportul echilibrat dintre preț și calitatea vieții: este suficient de aproape de Centru pentru ca naveta zilnică să fie scurtă, dar suficient de departe încât traficul și agitația să nu se simtă în interiorul cartierului. Densitatea populației este moderată, infrastructura (magazine, farmacii, școli, grădinițe) este completă și consolidată în timp, iar transportul în comun acoperă zona cu legături directe spre toate punctele importante ale orașului.",
      },
      {
        heading: "Tipurile de apartamente disponibile în Broșteni",
        body: "Oferta de apartamente din Broșteni este variată. Predomină apartamentele decomandate și semidecomandate din blocurile construite în anii '70-'80, cu suprafețe între 28 mp (garsoniere) și 80 mp (3 camere). În ultimii ani, multe blocuri au beneficiat de programe de reabilitare termică, ceea ce a îmbunătățit semnificativ confortul interior și a redus facturile de încălzire iarna. Există și câteva blocuri mai noi, construite după 2010, cu finisaje moderne, parcare proprie și un design contemporan. Apartamentele din Broșteni se vând în general la 5-15% sub prețul mediu al pieței în Buzău pentru caracteristici similare, ceea ce face zona atractivă pentru tineri la prima cumpărare și pentru investitorii care vor randament din chirii.",
      },
      {
        heading: "Avantajele zonei Broșteni",
        body: "Cel mai important avantaj al Broștenilor este combinația dintre preț accesibil și acces bun la oraș. Pentru o familie cu copii, zona oferă mai multe școli generale și grădinițe la distanță de mers pe jos, plus parcuri și spații verzi care nu lipsesc din apropierea blocurilor. Pentru cei care lucrează în Centru, drumul cu mașina durează 5-10 minute în afara orelor de vârf, iar cu autobuzul aproximativ 15 minute. Pentru investitorii care vor să închirieze, Broșteni atrage chiriași stabili — angajați cu venituri medii, familii tinere, profesori, asistente medicale, oameni care preferă o zonă liniștită fără primă a centralității. Yield-ul brut anual din chirii în Broșteni este competitiv: 8-10% pentru o garsonieră, 7-9% pentru un apartament cu 2 camere.",
      },
      {
        heading: "Sfaturi pentru cumpărarea unui apartament în Broșteni",
        body: "Înainte să cumperi în Broșteni, verifică obligatoriu starea de reabilitare termică a blocului — caută blocuri cu fațadă recent reabilitată, cu izolație exterioară completă; vei plăti cu 5-10% mai mult la achiziție, dar vei recupera prin facturile mult mai mici la iarnă. Verifică și starea acoperișului blocului și a instalațiilor comune (lift, instalație electrică pe scara blocului). Întreabă vecinii și consultă procesele verbale ale asociației de proprietari — vei afla rapid dacă există probleme structurale sau datorii. Pentru apartamentele de la parter, atenție la igrasie sau infiltrații; pentru cele de la ultimul etaj, atenție la acoperiș. Consultanții CAMIMOB cunosc fiecare bloc din Broșteni și te pot orienta spre opțiunile cu cel mai bun raport preț-calitate fără surprize ulterioare.",
      },
    ],
    faq: [
      {
        q: "Sunt mai ieftine apartamentele din Broșteni decât în Centru?",
        a: "Da, cu aproximativ 10-20% sub prețul mediu al Centrului Buzău pentru un apartament cu caracteristici similare (suprafață, an, confort).",
      },
      {
        q: "Există școli și grădinițe în Broșteni?",
        a: "Da, cartierul are mai multe școli generale și grădinițe accesibile pe jos din majoritatea blocurilor. Liceele sunt accesibile cu transportul în comun.",
      },
      {
        q: "Cât durează din Broșteni până în Centrul Buzăului?",
        a: "Cu mașina, în afara orelor de vârf, 5-10 minute. Cu autobuzul, aproximativ 15 minute. Cu bicicleta, 15-20 minute.",
      },
    ],
    filter: {
      propertyType: "APARTAMENT",
      operationType: "VANZARE",
      zoneNormalized: "brosteni",
    },
    keepIndexableWhenEmpty: true,
  },
  {
    slug: "apartamente-micro-14-buzau",
    title: "Apartamente în Micro 14, Buzău | CAMIMOB",
    description:
      "Apartamente de vânzare în cartierul Micro 14, Buzău. Zonă rezidențială cu blocuri reabilitate, școli, magazine în apropiere. Oferte CAMIMOB.",
    h1: "Apartamente în cartierul Micro 14, Buzău",
    breadcrumbLabel: "Apartamente Micro 14",
    intro:
      "Cartierul Micro 14 este una dintre zonele rezidențiale ale Buzăului, cu blocuri de locuințe construite în deceniile trecute, parțial reabilitate termic în programele recente. Pe această pagină găsești ofertele active CAMIMOB pentru apartamente în Micro 14 — garsoniere, 2 camere, 3 camere — la prețuri competitive față de zonele centrale.",
    sections: [
      {
        heading: "Caracteristicile cartierului Micro 14",
        body: "Cartierele „Micro” din Buzău sunt zone rezidențiale dezvoltate sistematic în perioada comunistă, cu blocuri de panouri prefabricate organizate în ansambluri compacte, cu spații verzi între blocuri, locuri de joacă pentru copii, școli, grădinițe și mici centre comerciale incluse în plan. Micro 14, ca toate cartierele similare, oferă o densitate moderată, o infrastructură matură și o comunitate de locatari relativ stabilă. Pentru cumpărători este o zonă predictibilă: știi ce primești în ce privește tipologia apartamentelor, ce facilități ai în jur, ce profil au vecinii și ce dezvoltare se așteaptă în următorii ani.",
      },
      {
        heading: "Oferta de apartamente",
        body: "Apartamentele din Micro 14 sunt predominant clasice: decomandate sau semidecomandate, confort 1 sau 2, cu suprafețe între 28 mp (garsoniere) și 78 mp (apartamente cu 3 camere). Multe dintre blocuri au beneficiat de reabilitare termică în ultimii ani, ceea ce a îmbunătățit semnificativ confortul iarna și a redus pierderea de căldură. Apartamentele dintr-un bloc reabilitat se vând cu o primă de 3-5% față de cele din bloc nereabilitat, dar economia la întreținere se recuperează în 2-3 ierni. Prețurile în Micro 14 sunt în general accesibile — sub mediana orașului — ceea ce face zona ideală pentru bugete medii, tineri la prima cumpărare și investitori cu yield bun din chirii.",
      },
      {
        heading: "Cui i se potrivește Micro 14",
        body: "Micro 14 este o opțiune potrivită pentru: 1) Tineri la prima locuință, care vor un apartament accesibil într-un cartier liniștit, cu acces normal la oraș; 2) Familii cu copii mici, atrase de școlile și grădinițele apropiate, de spațiile verzi și de comunitatea consolidată; 3) Cumpărători în vârstă, care fac downsize și își doresc un cartier cu vecini stabili și magazine de proximitate; 4) Investitori care vor randament — chiriile din Micro 14 sunt sub media orașului ca valoare absolută, dar la prețul de achiziție mai mic, yieldul procentual rămâne competitiv (7-9% brut anual). Nu este zonă pentru cumpărătorii care vor să fie în „buricul orașului” — dar este perfectă pentru cei care prioritizează raportul preț-confort.",
      },
      {
        heading: "Cum te ajută CAMIMOB în Micro 14",
        body: "Consultanții CAMIMOB cunosc fiecare bloc din Micro 14 și au informații actualizate despre starea de reabilitare termică, despre asociațiile de proprietari, despre lucrările planificate și despre apartamentele care se vând curent în zonă. Pentru cumpărători, asta înseamnă o filtrare rapidă a ofertelor reale: îți recomandăm doar apartamentele care se potrivesc bugetului și criteriilor tale, fără să-ți pierdem timpul cu opțiuni nepotrivite. Te ajutăm cu vizionări programate eficient, verificarea actelor, evaluare pentru bancă (dacă cumperi cu credit), negocierea prețului final și asistență notarială. Contactează-ne pentru o consultație gratuită și îți pregătim o listă personalizată cu apartamentele Micro 14 din portofoliul nostru.",
      },
    ],
    faq: [
      {
        q: "Sunt blocurile din Micro 14 reabilitate termic?",
        a: "Multe da, în special cele care au intrat în programele municipale de reabilitare. Procentul exact variază de la o parte a cartierului la alta — întreabă-ne explicit despre blocul care te interesează.",
      },
      {
        q: "Cât este chiria medie în Micro 14?",
        a: "Garsoniere: 200-260 EUR/lună. 2 camere: 220-320 EUR/lună. 3 camere: 280-380 EUR/lună. Variațiile depind de mobilier, etaj și starea apartamentului.",
      },
      {
        q: "Există parcare în Micro 14?",
        a: "Parcare de reședință organizată de primărie, cu locuri alocate proprietarilor de apartamente. Nu este garaj propriu, ci loc de parcare în spațiul comun. Pentru un loc de parcare propriu, va trebui să verifici dacă blocul are garaje individuale sau locuri închiriabile.",
      },
    ],
    filter: {
      propertyType: "APARTAMENT",
      operationType: "VANZARE",
      zoneNormalized: "micro 14",
    },
    keepIndexableWhenEmpty: true,
  },
  {
    slug: "apartamente-unirii-buzau",
    title: "Apartamente în zona Unirii, Buzău | CAMIMOB",
    description:
      "Apartamente de vânzare în zona Unirii, Buzău. Zonă semicentrală, acces rapid la Centru, prețuri echilibrate. Vezi ofertele CAMIMOB.",
    h1: "Apartamente în zona Unirii, Buzău",
    breadcrumbLabel: "Apartamente Unirii",
    intro:
      "Zona Unirii este una dintre cele mai apreciate zone semicentrale din Buzău, datorită combinației rare dintre apropierea de Centru, accesibilitate ca preț și o infrastructură urbană matură. Pe această pagină găsești ofertele active CAMIMOB pentru apartamente în zona Unirii — garsoniere, 2 camere, 3 camere — în blocuri de locuințe situate strategic între nodul central și cartierele rezidențiale.",
    sections: [
      {
        heading: "Despre zona Unirii din Buzău",
        body: "Zona Unirii este denumită după Bulevardul Unirii, una dintre arterele principale ale Buzăului, care conectează nodurile importante ale orașului. Este o zonă semicentrală cu o densitate ridicată de blocuri de locuințe, magazine, instituții publice, restaurante și servicii. Pentru cumpărători, atractivitatea zonei vine din mai multe direcții: este suficient de aproape de Centrul administrativ și comercial al orașului încât toate facilitățile importante (instituții publice, bănci, supermarketuri, școli, spitale) sunt accesibile pe jos sau cu transport în comun în maxim 10-15 minute; este suficient de departe de zona pietonală centrală încât prețurile rămân semnificativ mai accesibile decât în Centru; și are o ofertă diversificată de apartamente, de la blocuri din anii '70 până la unele construcții mai noi.",
      },
      {
        heading: "Tipologia apartamentelor din zona Unirii",
        body: "Apartamentele disponibile în zona Unirii sunt predominant în blocuri de tip P+4 sau P+10, construite în anii '70-'80, cu plan decomandat sau semidecomandat. Predomină apartamentele cu 2 și 3 camere (un raport care reflectă profilul familial al cumpărătorilor zonei), însă există și o ofertă constantă de garsoniere — multe dintre acestea folosite ca prima locuință de tineri sau ca investiții pentru închiriere. Suprafețele utile variază între 28 mp (garsoniere) și 80 mp (3 camere confort 1). Multe blocuri au fost incluse în programe de reabilitare termică, ceea ce a îmbunătățit eficiența energetică. Există și câteva blocuri mai noi, post-2010, cu finisaje moderne, dar acestea reprezintă un procent mic din oferta totală.",
      },
      {
        heading: "Cui i se potrivește zona Unirii",
        body: "Zona Unirii este atractivă pentru o gamă largă de cumpărători. Pentru tinerii profesioniști care lucrează în Centru sau în zonele administrative, este alegerea practică — acces rapid la birou, posibilitatea de a merge pe jos sau cu bicicleta. Pentru familii cu copii, zona oferă acces la mai multe școli și grădinițe, plus apropierea de zonele de servicii medicale și administrative. Pentru investitori, este o zonă cu cerere constantă pentru chirii, datorită combinației de centralitate moderată cu prețuri rezonabile — chiriile sunt mai mari decât în cartierele Micro, dar și prețurile de achiziție sunt mai mari. Yield-ul brut anual din chirii este de 6-8% — sub Micro 3 sau Broșteni ca procentaj, dar cu avantajul aprecierii constante a valorii în timp.",
      },
      {
        heading: "Sfaturi și recomandări CAMIMOB",
        body: "Zona Unirii are particularitatea că prețul pe metru pătrat variază destul de mult de la un bloc la altul, în funcție de poziție (mai aproape sau mai departe de bulevardul propriu-zis), de starea blocului și de calitatea ferestrelor și ușilor de la stradă. Apartamentele cu vedere spre o stradă liniștită sunt cu 5-10% mai scumpe decât cele cu vedere spre bulevard sau spre intersecții. Pentru cumpărători sensibili la zgomot, recomandăm vizionări la ore diferite ale zilei — un apartament care pare liniștit duminica dimineața poate fi expus traficului luni la ora 8. Cere documentația completă a asociației de proprietari și verifică actele cu un avocat sau cu un consultant CAMIMOB înainte de antecontract. Suntem la dispoziția ta pentru o consultație gratuită și pentru o listă personalizată de oferte din zona Unirii.",
      },
    ],
    faq: [
      {
        q: "Cât este prețul mediu pe metru pătrat în zona Unirii?",
        a: "În jur de 950-1.250 EUR/mp utili, în funcție de bloc, etaj, an de construcție și starea apartamentului. Cu 8-12% mai puțin decât Centru, dar peste media cartierelor Micro.",
      },
      {
        q: "Există școli și magazine în zona Unirii?",
        a: "Da, infrastructura este matură: mai multe școli generale, grădinițe, supermarketuri, farmacii, bănci, restaurante. Practic, tot ce ai nevoie zilnic este la 5-10 minute pe jos.",
      },
      {
        q: "Cât durează cu mașina din zona Unirii până în Centru?",
        a: "În afara orelor de vârf, 5 minute. În orele de vârf (8-9 dimineața, 17-18 seara), poate ajunge la 10-15 minute datorită traficului de pe bulevard.",
      },
    ],
    filter: {
      propertyType: "APARTAMENT",
      operationType: "VANZARE",
      zoneNormalized: "unirii",
    },
    keepIndexableWhenEmpty: true,
  },
  {
    // No operationType: the Crâng stock is currently all rentals, but the
    // page should pick up sales too as soon as any appear.
    slug: "apartamente-crang-buzau",
    title: "Apartamente în zona Crâng, Buzău | CAMIMOB",
    description:
      "Apartamente de vânzare și de închiriat în zona Crâng, Buzău — lângă Parcul Crâng, cu lac, pădure de stejar și alei de promenadă. Școala Gimnazială Nr. 2 în zonă, 8 linii de autobuz. Ofertele active CAMIMOB.",
    h1: "Apartamente în zona Crâng, Buzău",
    breadcrumbLabel: "Apartamente zona Crâng",
    intro:
      "Zona Crâng este, pentru mulți buzoieni, cel mai plăcut loc de locuit din oraș — și motivul este la câțiva pași: Parcul Crâng, cea mai mare și mai importantă zonă verde a Buzăului. Pe această pagină găsești apartamentele active din portofoliul CAMIMOB în zona Crâng, de vânzare și de închiriat. Dacă pui preț pe liniște, aer curat și pe posibilitatea de a ajunge în parc pe jos în câteva minute, aceasta este zona pe care merită să o urmărești.",
    sections: [
      {
        heading: "Parcul Crâng și zona de agrement",
        body: "Majoritatea cartierelor Buzăului se definesc prin tipul de blocuri sau prin distanța față de centru. Crângul se definește prin parc. Parcul Crâng este cel mai mare și mai important parc al orașului: o pădure de esență tare, cu stejari maturi, lac, alei de promenadă, zone de agrement și locuri de joacă pentru copii. Nu este un petic de iarbă între blocuri, ci o pădure-parc în care poți merge o oră fără să te întorci pe aceeași alee. Imediat adiacent se află Complexul de Agrement și Stadionul Municipal, ceea ce adaugă zonei o componentă sportivă pe care nu o găsești în alte cartiere. Pentru cine locuiește aici, asta schimbă viața de zi cu zi: alergare dimineața fără să urci în mașină, plimbat copilul la locul de joacă în câteva minute, aer sensibil mai bun decât pe arterele aglomerate. Vara, diferența de temperatură față de zonele dens construite se simte pe pielea ta.",
      },
      {
        heading: "Școli și unități de învățământ în apropiere",
        body: "Pentru familiile cu copii, zona acoperă toate ciclurile de învățământ fără navetă lungă. Școala Gimnazială Nr. 2 este chiar în zona Crâng, pe strada Crâng — cel mai apropiat gimnaziu, accesibil pe jos din majoritatea blocurilor din perimetru. Școala Gimnazială Nr. 15 se află relativ aproape, înspre zona ACR și Bariera Ploiești. La nivel liceal, Liceul cu Program Sportiv (LPS) Micro 14 este în apropierea capătului de traseu din zonă — o combinație firească pentru copiii care fac sport, dat fiind Complexul de Agrement și Stadionul Municipal la câțiva pași. Mai există Liceul Tehnologic „Constantin Nenițescu” și alte unități școlare pe arterele învecinate. Practic, un copil poate parcurge gimnaziul și liceul fără să schimbe cartierul — un argument care cântărește greu la decizia de cumpărare și pe care puține zone din Buzău îl pot susține.",
      },
      {
        heading: "Transport în comun: liniile care deservesc zona",
        body: "În stația Parcul Crâng și pe arterele care delimitează sau traversează zona opresc opt linii Trans Bus Buzău, ceea ce face Crângul mult mai bine conectat decât sugerează poziția lui liniștită. Liniile 4 (Gara Tohăneni – Stadion – Somet) și 4B (Gara Tohăneni – CIT Buzău – Somet) leagă zona de gară și de platforma industrială. Liniile 5 și 5B (Horticolei – Carrefour / CIT Buzău – Micro 14) și linia 10 (Bazalt – Liceul C. Nenițescu – Romcarbon – Rond – Crâng – Kaufland Sud) acoperă cumpărăturile mari. Linia 14 (Micro 14 – Filatură – Spitalul Județean – Crâng – LIDL – ACR – Piața Dorobanți – Liceul 1) este poate cea mai utilă dintre toate, pentru că dă legătură directă cu Spitalul Județean și cu Piața Dorobanți. Se adaugă liniile 7B (Micro 14 – Bld. Spiru Haret – Gara Tohăneni), 8 (Gara CFR – Bazar – Micro 14) și 12 / 12B (LPS Micro 14 – Gara CFR – Bentu). Concluzia practică: din Crâng ajungi fără mașină la gară, la spital, la piață și la hipermarketuri.",
      },
      {
        heading: "Cui i se potrivește zona Crâng",
        body: "Zona atrage în primul rând familii cu copii, pentru combinația rară de spațiu verde sigur, locuri de joacă și școli la distanță de mers pe jos. Apoi persoanele active — alergători, cicliști, cei care folosesc Complexul de Agrement și stadionul. Și cumpărători sau chiriași mai în vârstă, care caută liniște, aer bun și acces direct cu autobuzul la Spitalul Județean, fără să iasă din oraș. Nu este zona pentru cine vrea să fie în mijlocul agitației comerciale sau are nevoie să ajungă pe jos la instituțiile din centru în două minute; pentru centralitate absolută, uită-te mai bine la Centru sau la zona Unirii. Dar dacă prioritatea este calitatea vieții de zi cu zi, Crângul este greu de egalat în Buzău.",
      },
      {
        heading: "Ce ofertă există în zonă",
        body: "Crângul are stoc limitat: numărul de apartamente este mic în comparație cu cartierele Micro sau cu Broșteni, pur și simplu pentru că suprafața construită din apropierea parcului este restrânsă. Consecința practică este că ofertele apar rar și se ocupă repede, mai ales cele de închiriere. Apartamentele disponibile sunt predominant cu una sau două camere, cu suprafețe moderate, în blocuri de locuințe clasice. Dacă zona te interesează serios, cel mai eficient nu este să reîncarci paginile de anunțuri, ci să ne lași criteriile tale — te contactăm în momentul în care intră o ofertă în Crâng, de multe ori înainte să apară public. Numărul de oferte afișat mai sus este în timp real: dacă vezi zero, înseamnă că stocul este momentan epuizat, nu că zona nu este acoperită de noi.",
      },
      {
        heading: "Cum te ajută CAMIMOB în zona Crâng",
        body: "Într-o zonă cu puține apartamente și cerere constantă, avantajul real este informația timpurie. Consultanții CAMIMOB cunosc blocurile din apropierea parcului, proprietarii care închiriază recurent și prețurile la care s-au încheiat efectiv tranzacțiile — nu doar cele cerute în anunțuri. Te ajutăm cu verificarea actelor și a stării apartamentului, cu negocierea, cu redactarea contractului (la închiriere, inclusiv procesul-verbal de predare cu inventar) și cu asistența la notar în cazul unei achiziții. Dacă ești proprietar de apartament în Crâng și vrei să vinzi sau să închiriezi, spune-ne: avem deja o listă de clienți care așteaptă exact această zonă. Contactează-ne pentru o consultație gratuită.",
      },
    ],
    faq: [
      {
        q: "Ce școli sunt în zona Crâng?",
        a: "Școala Gimnazială Nr. 2 este chiar în zonă, pe strada Crâng. Școala Gimnazială Nr. 15 se află relativ aproape, înspre ACR și Bariera Ploiești. La liceu: Liceul cu Program Sportiv (LPS) Micro 14, în apropierea capătului de traseu din zonă, și Liceul Tehnologic „Constantin Nenițescu”, plus alte unități pe arterele învecinate.",
      },
      {
        q: "Ce linii de autobuz opresc în zona Crâng?",
        a: "În stația Parcul Crâng și pe arterele învecinate opresc liniile Trans Bus Buzău 4, 4B, 5, 5B, 7B, 8, 10, 12, 12B și 14. Cea mai utilă pentru viața de zi cu zi este linia 14, care face legătura directă cu Spitalul Județean și cu Piața Dorobanți. Linia 10 duce la Kaufland Sud, iar liniile 5 și 5B la Carrefour.",
      },
      {
        q: "Ce facilități are Parcul Crâng?",
        a: "Este cel mai mare parc al Buzăului: pădure de esență tare cu stejari maturi, lac, alei de promenadă, zone de agrement și locuri de joacă pentru copii. Imediat adiacent se află Complexul de Agrement și Stadionul Municipal.",
      },
      {
        q: "De ce sunt atât de puține oferte în zona Crâng?",
        a: "Pentru că suprafața construită din apropierea parcului este limitată, deci numărul total de apartamente este mic și rotația lentă. Nu este o problemă de acoperire din partea noastră. Lasă-ne criteriile tale prin formularul de contact și te sunăm când intră o proprietate potrivită, de multe ori înainte de publicarea anunțului.",
      },
    ],
    filter: {
      propertyType: "APARTAMENT",
      zoneNormalized: "crang",
    },
    keepIndexableWhenEmpty: true,
  },
];

export function getSeoPageBySlug(slug: string): SeoPageConfig | undefined {
  return SEO_PAGES.find((p) => p.slug === slug);
}

/**
 * Counts the active offers a landing page would list.
 *
 * Returns `null` when the database is unreachable, so callers can treat the
 * count as unknown instead of wrongly concluding the page is empty.
 */
export async function countSeoProperties(
  filter: SeoFilter
): Promise<number | null> {
  try {
    const rows = await fetchSeoProperties(filter);
    return rows.length;
  } catch (error) {
    console.error("Error counting properties for SEO page:", error);
    return null;
  }
}

/**
 * Shared metadata for the SEO landing pages.
 *
 * A category landing page with zero matching offers is nothing but templated
 * copy — Google reports exactly those as "crawled, currently not indexed".
 * We mark them `noindex, follow` so they stay out of the index (and out of
 * the sitemap, see app/sitemap.ts) until the category has real stock, at
 * which point they become indexable again on their own.
 *
 * Pages flagged `keepIndexableWhenEmpty` opt out of that — see the field's
 * documentation on SeoPageConfig.
 */
export async function buildSeoPageMetadata(slug: string): Promise<Metadata> {
  const config = getSeoPageBySlug(slug)!;
  const count = await countSeoProperties(config.filter);
  const isEmpty = count === 0 && !config.keepIndexableWhenEmpty;

  return {
    title: config.title,
    description: config.description,
    alternates: { canonical: `/${config.slug}` },
    robots: isEmpty
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      title: config.title,
      description: config.description,
      url: `${BASE_URL}/${config.slug}`,
      type: "website",
    },
  };
}



