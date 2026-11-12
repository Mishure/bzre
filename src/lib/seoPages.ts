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
  /** Substring match against the normalized `zone`. For city quarters. */
  zoneNormalized?: string;
  /**
   * Match if ANY of these terms appears in the normalized `zone` OR the
   * normalized `locality`.
   *
   * Needed for the commune pages, where the page name and the stored value
   * differ: the Mărăcineni listings carry "Potoceni" and the Merei ones
   * carry "Lipia" — the village, not the commune. Checking both columns also
   * covers listings where only one of the two was filled in.
   */
  placeNormalizedAny?: string[];
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
  /**
   * Absent on service pages — they advertise a service, not a stock of
   * listings, so there is nothing to query and no offers section to render.
   */
  filter?: SeoFilter;
  /**
   * Marks the page as a service rather than a property listing. Drives the
   * Service JSON-LD and points the breadcrumb at /services instead of
   * /properties.
   */
  service?: { name: string };
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

  if (filter.placeNormalizedAny?.length) {
    const terms = filter.placeNormalizedAny;
    return mapped.filter((p) => {
      const haystack = `${normalizeText(p.zone)} ${normalizeText(p.locality)}`;
      return terms.some((t) => haystack.includes(t));
    });
  }

  return mapped;
}

export const SEO_PAGES: SeoPageConfig[] = [
  {
    slug: "cadastru-si-intabulare-buzau",
    title: "Cadastru și intabulare în Buzău — carte funciară | CAMIMOB",
    description:
      "Cadastru și intabulare în Buzău și județ: măsurători, documentație cadastrală și înscriere în cartea funciară. Deschidere carte funciară, dezmembrări, alipiri. CAMIMOB.",
    h1: "Cadastru și intabulare în Buzău",
    breadcrumbLabel: "Cadastru și intabulare",
    service: { name: "Cadastru și intabulare" },
    intro:
      "Executăm lucrări de cadastru și intabulare în Buzău și în județ: măsurători la teren, întocmirea documentației cadastrale și înscrierea proprietății în cartea funciară, până la obținerea extrasului de carte funciară. Fie că deschizi prima carte funciară pentru un imobil moștenit, fie că ai nevoie de intabulare ca să poți vinde sau să iei un credit, ne ocupăm de tot procesul — de la ridicarea topografică până la depunerea și urmărirea dosarului la OCPI.",
    sections: [
      {
        heading: "Ce înseamnă cadastru și ce înseamnă intabulare",
        body: "Sunt doi pași diferiți ai aceluiași proces, iar confuzia dintre ei este cea mai frecventă neînțelegere în discuțiile cu clienții. Cadastrul este partea tehnică: un specialist autorizat vine la fața locului, măsoară imobilul, identifică limitele reale ale terenului și întocmește documentația cadastrală — plan de amplasament, plan de încadrare în zonă, memoriu tehnic. Rezultatul este un număr cadastral atribuit imobilului. Intabularea este partea juridică: înscrierea dreptului tău de proprietate în cartea funciară, pe baza documentației cadastrale și a actului de proprietate. Rezultatul este cartea funciară deschisă și extrasul de carte funciară, documentul care dovedește oficial că imobilul este al tău. Un imobil poate avea număr cadastral fără să fie intabulat, dar nu poate fi intabulat fără cadastru. Pentru orice tranzacție ai nevoie de ambele.",
      },
      {
        heading: "Când ai nevoie obligatoriu de cadastru și intabulare",
        body: "În practică, situațiile sunt destul de puține și destul de clare. La vânzare: notarul nu poate autentifica un contract fără extras de carte funciară, deci dacă imobilul nu este intabulat, tranzacția se blochează înainte să înceapă. La credit ipotecar: banca cere obligatoriu intabularea, pentru că ipoteca se înscrie în cartea funciară. La succesiune și moștenire: foarte multe imobile din mediul rural și o parte din cele urbane nu au niciodată deschisă carte funciară, iar moștenitorii descoperă asta exact când vor să vândă. La dezmembrare sau alipire: dacă vrei să împarți un teren în două loturi sau să unești două parcele, ai nevoie de documentație cadastrală nouă. La construcții: pentru autorizația de construire și pentru recepția la terminarea lucrărilor, construcția trebuie înscrisă în cartea funciară. Și la orice situație în care suprafața reală diferă de cea din acte — o problemă care apare mai des decât te-ai aștepta la terenurile moștenite.",
      },
      {
        heading: "Ce documente îți trebuie",
        body: "Lista exactă depinde de situația imobilului, dar punctul de plecare este aproape întotdeauna același: actul de proprietate (contract de vânzare-cumpărare, certificat de moștenitor, titlu de proprietate, act de donație sau sentință judecătorească), actul de identitate al proprietarilor, certificatul fiscal eliberat de primărie și, pentru apartamente, documentele care atestă situația blocului. Pentru construcții se adaugă autorizația de construire și procesul-verbal de recepție. Pentru terenuri din mediul rural pot fi necesare documente suplimentare de la primărie sau extrase din registrul agricol. Dacă proprietatea vine din moștenire și succesiunea nu este finalizată, aceasta trebuie rezolvată întâi — nu se poate intabula pe numele unui moștenitor până când succesiunea nu este dezbătută. Spune-ne situația concretă și îți dăm lista exactă, completă, de la început; nimic nu lungește un dosar mai mult decât descoperirea unui act lipsă la jumătatea drumului.",
      },
      {
        heading: "Cum se desfășoară lucrarea, pas cu pas",
        body: "Procesul standard are cinci etape. Prima: discuția inițială și verificarea actelor, în care stabilim dacă dosarul este complet și dacă există situații care cer rezolvate înainte — succesiuni nefinalizate, construcții fără autorizație, diferențe de suprafață. A doua: măsurătorile la teren, făcute de un specialist autorizat, cu identificarea limitelor și, dacă este nevoie, cu prezența vecinilor pentru confirmarea hotarelor. A treia: întocmirea documentației cadastrale — plan de amplasament și delimitare, plan de încadrare, memoriu tehnic. A patra: depunerea dosarului la Oficiul de Cadastru și Publicitate Imobiliară și urmărirea lui până la soluționare, inclusiv răspunsul la eventualele completări cerute. A cincea: predarea documentelor finale — numărul cadastral, cartea funciară deschisă și extrasul de carte funciară. Te ținem la curent la fiecare etapă; nu trebuie să suni tu ca să afli unde a ajuns dosarul.",
      },
      {
        heading: "Situații speciale care cer atenție",
        body: "Unele dosare nu sunt de rutină, iar experiența contează. Diferențe între suprafața măsurată și cea din acte: foarte frecvent la terenurile moștenite, se rezolvă prin procedura de actualizare a suprafeței, uneori cu acordul vecinilor. Construcții ridicate fără autorizație: nu pot fi intabulate direct și trebuie intrate în legalitate, o procedură care implică primăria. Imobile cu mai mulți coproprietari, în care este nevoie de acordul tuturor. Litigii de hotar cu vecinii, care blochează înscrierea până la rezolvare. Terenuri agricole pe care vrei să construiești, ce cer schimbarea categoriei de folosință. Apartamente în blocuri la care documentația originală lipsește. Pe fiecare dintre aceste situații am lucrat și îți spunem deschis, de la prima discuție, dacă se poate rezolva, cât durează realist și ce costă — nu îți promitem termene care nu se pot respecta.",
      },
      {
        heading: "De ce să lucrezi cu CAMIMOB",
        body: "Suntem agenție imobiliară în Buzău, deci vedem cadastrul și intabularea din perspectiva pentru care ai nevoie de ele: tranzacția. Asta schimbă modul în care lucrăm. Dacă intabulezi ca să vinzi, știm exact ce va cere notarul și pregătim dosarul în consecință, nu cu surprize la final. Dacă intabulezi pentru un credit, știm ce verifică banca. Dacă ești în mijlocul unei vânzări și descoperi că imobilul nu are carte funciară, putem coordona cele două procese în paralel, ca să nu pierzi cumpărătorul. Lucrăm cu specialiști autorizați ANCPI și, pentru cazurile cu probleme juridice, cu avocați. Primești de la început lista completă de acte, un termen realist și costul total — nu un preț de pornire la care se adaugă lucruri pe drum. Contactează-ne și spune-ne ce imobil ai; îți răspundem cu o estimare concretă.",
      },
    ],
    faq: [
      {
        q: "Care este diferența dintre cadastru și intabulare?",
        a: "Cadastrul este partea tehnică — măsurătorile și documentația care atribuie imobilului un număr cadastral. Intabularea este partea juridică — înscrierea dreptului de proprietate în cartea funciară, care produce extrasul de carte funciară. Un imobil nu poate fi intabulat fără cadastru, iar pentru orice tranzacție ai nevoie de ambele.",
      },
      {
        q: "Pot vinde un apartament sau o casă fără intabulare?",
        a: "Nu. Notarul nu poate autentifica un contract de vânzare-cumpărare fără extras de carte funciară, deci tranzacția se blochează înainte să înceapă. Dacă ești deja în discuții cu un cumpărător, putem derula intabularea în paralel cu pregătirea vânzării.",
      },
      {
        q: "Ce fac dacă suprafața reală diferă de cea din acte?",
        a: "Este o situație frecventă, mai ales la terenurile moștenite, și se rezolvă prin procedura de actualizare a suprafeței în cartea funciară, pe baza măsurătorilor noi. În unele cazuri este nevoie și de acordul vecinilor pentru confirmarea hotarelor. Nu este un obstacol, dar trebuie rezolvată înainte de vânzare.",
      },
      {
        q: "Cât durează obținerea cărții funciare?",
        a: "Durata depinde de complexitatea dosarului și de termenele de soluționare la OCPI. Un dosar complet și fără probleme juridice se rezolvă semnificativ mai repede decât unul cu succesiune nefinalizată, construcție neautorizată sau diferențe de suprafață. După ce vedem actele, îți dăm un termen realist pentru situația ta concretă, nu o medie generală.",
      },
      {
        q: "Am nevoie de cadastru pentru o construcție nouă?",
        a: "Da. Construcția trebuie înscrisă în cartea funciară, iar acest lucru este necesar atât pentru recepția la terminarea lucrărilor, cât și pentru orice tranzacție ulterioară sau credit ipotecar. Documentația cadastrală se întocmește după finalizarea construcției, pe baza autorizației și a procesului-verbal de recepție.",
      },
      {
        q: "Lucrați și în comunele din județul Buzău?",
        a: "Da, executăm lucrări de cadastru și intabulare în tot județul. Imobilele din mediul rural sunt, de fapt, cele care au cel mai frecvent nevoie: multe nu au niciodată deschisă carte funciară, iar proprietarii descoperă asta când vor să vândă sau la succesiune.",
      },
    ],
  },
  {
    slug: "certificat-energetic-buzau",
    title: "Certificat energetic (CPE) în Buzău | CAMIMOB",
    description:
      "Certificat de performanță energetică (CPE) în Buzău, emis de auditor atestat. Necesar la vânzare, închiriere, recepția construcțiilor noi și pentru PNRR sau Casa Verde. CAMIMOB.",
    h1: "Certificat de performanță energetică (CPE) în Buzău",
    breadcrumbLabel: "Certificat energetic",
    service: { name: "Certificat de performanță energetică" },
    intro:
      "Întocmim certificate de performanță energetică (CPE) și proiectele tehnice aferente, pentru imobile din Buzău și județ. Certificatul energetic este documentul care încadrează clădirea într-o clasă de la A la G și estimează consumul ei anual de energie. Îți trebuie la vânzare, la închiriere, la recepția unei construcții noi și la accesarea programelor de finanțare pentru renovare. Îl emitem prin auditor energetic atestat, cu deplasare la imobil și termen comunicat de la început.",
    sections: [
      {
        heading: "Când îți trebuie certificat energetic",
        body: "Sunt patru situații în care documentul este necesar, iar trei dintre ele îi iau pe proprietari pe nepregătite. La vânzarea unui imobil — apartament, casă sau spațiu comercial — vânzătorul are obligația să pună certificatul la dispoziția cumpărătorului, iar notarul îl cere la autentificare. La închiriere, proprietarul trebuie să îl prezinte chiriașului; este obligația cel mai frecvent ignorată din toate. La recepția la terminarea lucrărilor pentru clădiri noi, certificatul face parte din documentația obligatorie, fără el recepția nu se poate finaliza. Și la renovarea majoră a unei clădiri sau la accesarea programelor de finanțare — PNRR, Casa Verde, Fondul pentru Modernizare — unde certificatul este cerut în dosar, de regulă atât înainte, pentru a stabili situația de pornire, cât și după lucrări, pentru a demonstra îmbunătățirea. Dacă vinzi printr-o agenție, cere certificatul din start: lipsa lui amână semnarea exact în momentul în care toate părțile sunt gata.",
      },
      {
        heading: "Ce conține și ce îți spune efectiv",
        body: "Certificatul încadrează clădirea într-o clasă energetică de la A, cea mai performantă, la G, cea mai slabă, pe baza consumului anual estimat de energie pentru încălzire, apă caldă, ventilație, climatizare și iluminat, raportat la suprafață. Dar partea cu adevărat utilă nu este litera — este secțiunea de recomandări, care arată concret unde pierzi energie și ce intervenții ar aduce cea mai mare îmbunătățire: izolarea termică a pereților, înlocuirea tâmplăriei, izolarea terasei sau a podului, modernizarea instalației de încălzire. Pentru un cumpărător, clasa energetică este un indicator direct al facturilor pe care le va plăti iarna — un apartament de clasă D sau E într-un bloc nereabilitat costă substanțial mai mult la întreținere decât unul de clasă B. Pentru un proprietar care vinde, un certificat bun este un argument de negociere real, nu doar o formalitate bifată.",
      },
      {
        heading: "Cum se emite și de ce ai nevoie",
        body: "Certificatul se emite exclusiv de un auditor energetic atestat, pe baza unei evaluări care include deplasarea la imobil. Nu se poate face corect doar pe hârtie. Auditorul verifică și consemnează: suprafețele și geometria clădirii, tipul și grosimea elementelor de construcție — pereți, terasă, planșee, tâmplărie — tipul de izolație existentă, sistemul de încălzire și de preparare a apei calde, instalația de ventilație și climatizare, orientarea clădirii și poziția apartamentului în bloc. Pentru pregătirea vizitei ajută să ai la îndemână actul de proprietate, documentația tehnică sau planurile dacă există, autorizația de construire pentru clădirile noi și informații despre eventualele lucrări de reabilitare deja efectuate, inclusiv anul în care s-au făcut. Dacă nu ai planurile, nu este un obstacol — auditorul face relevee la fața locului, dar evaluarea durează mai mult.",
      },
      {
        heading: "Valabilitate și greșeli frecvente",
        body: "Certificatul de performanță energetică este valabil 10 ani de la data emiterii, cu o excepție importantă: dacă în acest interval execuți lucrări care schimbă performanța energetică a clădirii — izolație termică, înlocuirea tâmplăriei, schimbarea sistemului de încălzire — certificatul vechi nu mai reflectă realitatea și trebuie refăcut. Este și în interesul tău: după reabilitare, clasa energetică se îmbunătățește, iar un certificat actualizat devine un argument la vânzare. Greșelile frecvente pe care le vedem: proprietari care lasă certificatul pe ultima zi înainte de notariat și descoperă că nu se emite instant; proprietari care închiriază fără certificat, ignorând obligația legală; și documente obținute de la emitenți care nu se deplasează la imobil, ceea ce produce un certificat formal dar nereprezentativ, fără partea de recomandări care îi dă valoare reală.",
      },
      {
        heading: "Proiecte tehnice pentru renovare și finanțare",
        body: "Pe lângă certificat, întocmim și proiectele tehnice aferente, necesare atunci când treci de la diagnostic la lucrări. Dacă accesezi un program de finanțare pentru eficiență energetică, dosarul cere de regulă mai mult decât certificatul: o documentație tehnică a intervențiilor propuse, soluțiile constructive, cuantificarea îmbunătățirii energetice estimate și, în multe cazuri, un audit energetic mai detaliat decât certificatul standard. Aici contează ca documentele să fie coerente între ele și corelate cu cerințele specifice ale programului — un dosar respins pentru inconsistență între certificat și proiect te costă o rundă întreagă de finanțare. Spune-ne pentru ce program depui și ce intenționezi să execuți, iar noi pregătim documentația în forma cerută.",
      },
      {
        heading: "De ce să lucrezi cu CAMIMOB",
        body: "Fiind agenție imobiliară, vedem certificatul energetic din perspectiva momentului în care îți trebuie: semnarea la notar, publicarea unui anunț de închiriere, depunerea unui dosar de finanțare. Asta înseamnă că te întrebăm de la început pentru ce ai nevoie de el și îți spunem exact ce termen putem respecta, ca să nu amâni o tranzacție. Lucrăm cu auditori energetici atestați, cu deplasare la imobil, nu cu certificate emise pe hârtie. Dacă vinzi sau închiriezi printr-o agenție, putem integra certificatul în pachetul de documente al tranzacției. Și dacă pregătești o reabilitare cu finanțare, coordonăm certificatul cu proiectul tehnic, astfel încât documentele să fie consistente între ele. Contactează-ne și spune-ne ce imobil ai și pentru ce ai nevoie de document; îți comunicăm lista de acte, termenul și costul total de la prima discuție.",
      },
    ],
    faq: [
      {
        q: "Cât este valabil certificatul energetic?",
        a: "10 ani de la data emiterii. Excepția: dacă în acest interval execuți lucrări care schimbă performanța energetică a clădirii — izolație, tâmplărie nouă, alt sistem de încălzire — certificatul nu mai reflectă realitatea și trebuie refăcut. După reabilitare este oricum în interesul tău să îl refaci, pentru că clasa se îmbunătățește.",
      },
      {
        q: "Este obligatoriu certificatul energetic la închiriere?",
        a: "Da. Proprietarul are obligația să îl pună la dispoziția chiriașului. Este obligația cel mai frecvent ignorată dintre toate situațiile în care documentul este cerut.",
      },
      {
        q: "Am nevoie de certificat energetic pentru PNRR sau Casa Verde?",
        a: "Da, certificatul face parte din dosar, de regulă atât înainte de lucrări, pentru a stabili situația de pornire, cât și după, pentru a demonstra îmbunătățirea obținută. În plus, aceste programe cer de obicei și o documentație tehnică a intervențiilor propuse, pe care o întocmim tot noi, corelată cu certificatul.",
      },
      {
        q: "Se poate emite certificatul fără deplasare la imobil?",
        a: "Nu se poate emite corect. Auditorul trebuie să verifice la fața locului geometria clădirii, elementele de construcție, izolația, sistemul de încălzire și instalațiile. Un certificat emis doar pe baza unor date transmise este formal, dar nereprezentativ, și îți lipsește exact partea utilă — recomandările de îmbunătățire.",
      },
      {
        q: "Ce documente trebuie să pregătesc?",
        a: "Actul de proprietate, documentația tehnică sau planurile dacă există, autorizația de construire pentru clădirile noi, și informații despre lucrările de reabilitare efectuate anterior, inclusiv anul. Dacă nu ai planurile nu este un obstacol — auditorul face relevee la fața locului, dar evaluarea durează mai mult.",
      },
      {
        q: "Cât contează clasa energetică la vânzare?",
        a: "Direct, pentru că este un indicator al facturilor pe care le va plăti cumpărătorul. Un apartament de clasă D sau E într-un bloc nereabilitat costă substanțial mai mult la întreținere iarna decât unul de clasă B. Un certificat bun este un argument de negociere real.",
      },
    ],
  },
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
    slug: "terenuri-de-vanzare-buzau",
    title: "Terenuri de vânzare în Buzău și județ | CAMIMOB",
    description:
      "Terenuri de vânzare în Buzău și în județ: intravilan pentru construcție, loturi în oraș și în comunele din jur. Acte verificate, intabulare confirmată. CAMIMOB.",
    h1: "Terenuri de vânzare în Buzău și județ",
    breadcrumbLabel: "Terenuri de vânzare",
    intro:
      "Cauți un teren de vânzare în Buzău sau în județ? Pe această pagină găsești loturile active din portofoliul CAMIMOB — atât terenuri în interiorul orașului, cât și în comunele din jur. La teren, diferența dintre o achiziție bună și o problemă de ani de zile stă aproape exclusiv în acte și în regimul urbanistic, nu în preț. De aceea verificăm fiecare lot înainte să îl publicăm: intabulare, suprafață reală față de cea din acte, categorie de folosință și posibilitatea efectivă de a construi.",
    sections: [
      {
        heading: "Intravilan sau extravilan: diferența care decide totul",
        body: "Este prima întrebare pe care trebuie să o pui, înainte de preț. Terenul intravilan este situat în interiorul limitelor administrative construibile ale localității și poți ridica pe el o locuință, conform PUZ-ului și PUG-ului în vigoare. Terenul extravilan este în afara acestor limite, are de regulă categoria de folosință agricolă, iar construcția necesită mai întâi scoaterea din circuitul agricol și schimbarea categoriei de folosință — o procedură care durează, costă și nu este garantată. Diferența de preț pe metru pătrat între cele două poate fi de câteva ori, și exact de aceea apar anunțurile care prezintă un extravilan ieftin ca pe o oportunitate de construcție. Dacă intenția ta este să construiești o casă, cere din start extrasul de carte funciară și certificatul de urbanism: ele îți spun fără echivoc ce ai voie să faci pe lotul respectiv.",
      },
      {
        heading: "Ce verifici obligatoriu la un teren",
        body: "Lista este scurtă, dar fiecare punct de pe ea a cauzat deja probleme cuiva. Intabularea: terenul trebuie să fie înscris în cartea funciară, cu suprafața măsurată, nu doar cu cea declarată — diferențele între suprafața reală și cea din acte sunt frecvente la terenurile moștenite. Regimul juridic: verifică să nu existe ipoteci, litigii, servituți de trecere sau drepturi ale unor terți. Certificatul de urbanism: îți spune procentul de ocupare a terenului, coeficientul de utilizare, regimul maxim de înălțime și retragerile obligatorii — adică exact cât și cum poți construi. Utilitățile: existența și distanța până la racordurile de apă, canalizare, gaz și electricitate; un lot ieftin la 300 de metri de cel mai apropiat branșament poate deveni cel mai scump din zonă. Accesul: drum de acces în proprietate sau servitute legal constituită, nu o înțelegere verbală cu vecinul. Și, pentru Buzău în special, întreabă despre nivelul apei freatice și despre riscul de inundații în zonele joase din apropierea râului.",
      },
      {
        heading: "Terenuri în oraș versus în comunele din jur",
        body: "În interiorul municipiului, loturile disponibile sunt de regulă mici și scumpe pe metru pătrat, dar vin cu utilități la poartă, drum asfaltat și toate avantajele locuirii urbane. Sunt potrivite pentru o casă pe un lot compact sau pentru o investiție. În comunele limitrofe — Mărăcineni, Merei, Vernești, Săpoca, Pietroasele și celelalte — raportul se inversează: obții suprafețe de câteva ori mai mari la un preț total comparabil, cu aer mai curat și liniște, dar trebuie să calculezi realist naveta, starea drumului, iluminatul public, distanța până la școală și, cel mai important, costul racordării la utilități. Pentru multe familii compromisul merită; pentru altele, nu. Spune-ne cum arată ziua ta obișnuită și îți spunem deschis dacă un lot din afara orașului îți folosește sau îți va complica viața.",
      },
      {
        heading: "Cum te ajută CAMIMOB la achiziția unui teren",
        body: "Tranzacțiile cu teren sunt cele în care greșelile se descoperă cel mai târziu și se repară cel mai greu — de obicei abia când mergi să scoți autorizația de construire. Verificăm, înainte să îți recomandăm un lot: extrasul de carte funciară actualizat, concordanța între suprafața măsurată și cea din acte, certificatul de urbanism și ce permite el efectiv, categoria de folosință, existența litigiilor sau a servituților, accesul la drum și situația utilităților. Lucrăm cu o rețea de avocați, evaluatori autorizați și topografi pentru cazurile care cer verificare tehnică. Dacă vinzi un teren, te ajutăm să pregătești documentația corect de la început, ceea ce scurtează semnificativ timpul până la notar. Contactează-ne pentru o consultație gratuită.",
      },
    ],
    faq: [
      {
        q: "Care este diferența dintre teren intravilan și extravilan?",
        a: "Intravilanul este situat în interiorul limitelor construibile ale localității și permite ridicarea unei locuințe conform PUZ-ului în vigoare. Extravilanul este în afara acestor limite, de regulă cu categorie de folosință agricolă, iar construcția necesită scoaterea din circuitul agricol și schimbarea categoriei de folosință. Pentru o casă, terenul trebuie să fie obligatoriu intravilan.",
      },
      {
        q: "Ce documente trebuie să cer înainte să cumpăr un teren?",
        a: "Extras de carte funciară actualizat, documentația cadastrală cu suprafața măsurată, certificat de urbanism, certificat fiscal și dovada că nu există ipoteci, litigii sau servituți. Certificatul de urbanism este cel care îți spune concret ce și cât poți construi.",
      },
      {
        q: "Pot lua credit pentru cumpărarea unui teren?",
        a: "Băncile finanțează mai greu achiziția de teren decât pe cea de locuință, iar avansul cerut este în general mai mare. Există credite pentru construcție care includ și terenul, cu condiția ca lotul să fie intravilan, intabulat și cu certificat de urbanism favorabil. Discută cu noi situația ta concretă înainte să faci o ofertă.",
      },
      {
        q: "Cât costă racordarea la utilități pentru un teren fără branșamente?",
        a: "Depinde decisiv de distanța până la rețelele existente și de tipul utilității. Este cheltuiala cel mai frecvent subestimată la achiziția unui teren ieftin din afara orașului și poate depăși diferența de preț față de un lot cu utilități la poartă. Cere informații de la operatorii locali înainte de a semna, nu după.",
      },
    ],
    filter: { propertyType: "TEREN", operationType: "VANZARE" },
  },
  {
    slug: "apartamente-brosteni-buzau",
    title: "Apartamente în cartierul Broșteni, Buzău | CAMIMOB",
    description:
      "Apartamente de vânzare și de închiriat în cartierul Broșteni, Buzău. Lângă Parcul Tineretului și Parcul Marghiloman, Școala Gimnazială Nr. 7 în zonă, nod major de transport. Ofertele CAMIMOB.",
    h1: "Apartamente în cartierul Broșteni, Buzău",
    breadcrumbLabel: "Apartamente Broșteni",
    intro:
      "Broșteni este o zonă rezidențială bine conectată din partea de nord-est a Buzăului, învecinată direct cu cartierul Dorobanți și cu acces rapid către cele mai mari parcuri ale orașului. Pe această pagină găsești apartamentele active din portofoliul CAMIMOB în Broșteni, de vânzare și de închiriat — garsoniere, 2 și 3 camere, în blocuri reabilitate sau cu potențial de renovare. Dacă vrei preț accesibil fără să renunți la școli bune și la transport în comun, Broșteni este una dintre cele mai echilibrate opțiuni din oraș.",
    sections: [
      {
        heading: "Despre cartierul Broșteni",
        body: "Broșteni se află în partea de nord-est a Buzăului și îmbină blocurile clasice din anii '70-'80 cu zone de case individuale și curți. Vecinătatea directă cu Dorobanți îi dă acces la infrastructura ambelor cartiere, iar poziția față de centru este aproape ideală: suficient de aproape ca naveta zilnică să fie scurtă, suficient de departe ca traficul și agitația să nu se simtă în interiorul cartierului. Densitatea populației este moderată, infrastructura de proximitate (magazine, farmacii, școli, grădinițe) este completă și consolidată în timp. Apartamentele din Broșteni se tranzacționează în general sub prețul mediu al orașului pentru caracteristici similare, ceea ce face zona atractivă atât pentru tineri la prima cumpărare, cât și pentru investitorii care urmăresc randament din chirii.",
      },
      {
        heading: "Școli și grădinițe în zonă",
        body: "Pentru familiile cu copii, Broșteni acoperă toate ciclurile fără navetă lungă. Școala Gimnazială Nr. 7 este principala unitate de învățământ gimnazial din zonă, situată chiar la granița dintre Broșteni și Dorobanți, pe strada Privighetorilor. Grădinița cu Program Prelungit Nr. 4 se află în proximitate și deservește copiii din cartier. La doar câteva minute spre zona centrală și Bulevardul Bălcescu se ajunge la Colegiul Național „Mihai Eminescu” și la Școala Gimnazială „Căpitan Aviator Mircea T. Bădulescu” (Nr. 1) — două dintre unitățile cele mai căutate din Buzău. Combinația este rară: gimnaziu de cartier la câțiva pași, plus acces rapid la un colegiu național de top fără să schimbi orașul sau să depinzi de mașină.",
      },
      {
        heading: "Parcuri și spații verzi",
        body: "În interiorul cartierului găsești în principal părculețe de joacă între blocuri și alei verzi. Avantajul real al Broștenilor este însă proximitatea directă cu două dintre cele mai mari și moderne parcuri ale Buzăului. Parcul Tineretului este extrem de aproape: o zonă imensă de relaxare cu lac amenajat, terenuri de sport (tenis, baschet), piste de biciclete și o zonă modernă de skateboarding — practic tot ce îți trebuie pentru o viață activă, la câteva minute de casă. Puțin mai la sud-est se află Parcul Marghiloman, împreună cu Complexul Cultural Marghiloman: un parc istoric superb, cu lac cu nuferi și locuri de joacă amenajate, ideal pentru plimbări lungi de weekend. Pentru o familie cu copii, a avea ambele parcuri la îndemână este un argument pe care puține cartiere din Buzău îl pot egala.",
      },
      {
        heading: "Transport în comun: un nod major al orașului",
        body: "Broșteni este o adevărată placă turnantă pentru transportul local — stația Broșteni este tranzitată de un număr foarte mare de linii Trans Bus Buzău. Linia 8 face traseul Gară – Dorobanți – Broșteni – Spiru Haret – Spitalul Județean – Micro 14, deci îți dă legătură directă atât cu gara, cât și cu spitalul. Liniile 11 și 11B (Gara CFR – Broșteni – Vadu Pașii / Curtici), 13 și 13B (Gara CFR – Broșteni – Stăncești) și 22 (Gara CFR – Broșteni – Fulga) leagă cartierul de gară și de localitățile din jur. Se adaugă linia 2 (Sărata Monteoru / Gura Sărății – Autogara Marghiloman) și linia 3 (Dedeman – Centrul de Recoltare). În plus, liniile metropolitane 23, 24, 25, 26, 27 și 28 pornesc din zona Gării CFR, tranzitează Broșteni și continuă spre comunele din nord-estul județului — Mărăcineni, Săpoca, Cernătești, Beceni, Scorțoasa. Pentru cine face naveta dinspre aceste comune, Broșteni este cel mai logic cartier în care să se mute.",
      },
      {
        heading: "Sfaturi pentru cumpărarea unui apartament în Broșteni",
        body: "Înainte să cumperi, verifică obligatoriu starea de reabilitare termică a blocului — caută fațade recent reabilitate, cu izolație exterioară completă. Vei plăti puțin mai mult la achiziție, dar recuperezi prin facturile mult mai mici la iarnă. Verifică și starea acoperișului și a instalațiilor comune (lift, instalație electrică pe scară). Consultă procesele verbale ale asociației de proprietari: afli rapid dacă există datorii sau lucrări planificate. Pentru apartamentele de la parter, atenție la igrasie și infiltrații; pentru cele de la ultimul etaj, atenție la acoperiș. Dacă ai copii, verifică circumscripția școlară exactă a blocului care te interesează înainte de a semna — granița dintre Broșteni și Dorobanți trece prin zonă și poate schimba școala de care aparțineți. Consultanții CAMIMOB cunosc fiecare bloc din Broșteni și te pot orienta spre opțiunile cu cel mai bun raport preț-calitate.",
      },
    ],
    faq: [
      {
        q: "Ce școli sunt în cartierul Broșteni?",
        a: "Școala Gimnazială Nr. 7 este principala unitate gimnazială, pe strada Privighetorilor, la granița cu Dorobanți. Grădinița cu Program Prelungit Nr. 4 este în proximitate. La câteva minute spre centru și Bulevardul Bălcescu se află Colegiul Național „Mihai Eminescu” și Școala Gimnazială „Căpitan Aviator Mircea T. Bădulescu” (Nr. 1).",
      },
      {
        q: "Ce parcuri sunt aproape de Broșteni?",
        a: "Parcul Tineretului este extrem de aproape, cu lac amenajat, terenuri de tenis și baschet, piste de biciclete și zonă de skateboarding. Puțin mai la sud-est se află Parcul Marghiloman și Complexul Cultural Marghiloman, un parc istoric cu lac cu nuferi și locuri de joacă.",
      },
      {
        q: "Ce linii de autobuz trec prin Broșteni?",
        a: "Stația Broșteni este tranzitată de liniile Trans Bus 2, 3, 8, 11, 11B, 13, 13B și 22, plus liniile metropolitane 23–28 care continuă spre Mărăcineni, Săpoca, Cernătești, Beceni și Scorțoasa. Linia 8 dă legătură directă cu gara și cu Spitalul Județean.",
      },
      {
        q: "Sunt mai ieftine apartamentele din Broșteni decât în Centru?",
        a: "Da, apartamentele din Broșteni se tranzacționează în general sub prețul Centrului pentru caracteristici similare (suprafață, an de construcție, confort). Exact această diferență, combinată cu accesul bun la școli și transport, face zona atractivă pentru prima cumpărare și pentru investiție.",
      },
    ],
    filter: {
      propertyType: "APARTAMENT",
      zoneNormalized: "brosteni",
    },
    keepIndexableWhenEmpty: true,
  },
  {
    slug: "apartamente-micro-14-buzau",
    title: "Apartamente în Micro 14, Buzău | CAMIMOB",
    description:
      "Apartamente de vânzare și de închiriat în Micro 14, Buzău. Școala „Sfântul Apostol Andrei” și LPS „Iolanda Balaș Soter” în cartier, Parcul Crâng la câteva minute, capăt de linie pentru 7 trasee Trans Bus. Oferte CAMIMOB.",
    h1: "Apartamente în cartierul Micro 14, Buzău",
    breadcrumbLabel: "Apartamente Micro 14",
    intro:
      "Micro 14 este unul dintre cele mai populate cartiere ale Buzăului, situat în partea de vest a orașului, în prelungirea Bulevardului Stadionului și în vecinătatea platformei industriale. Este foarte bine deservit atât de rețeaua școlară, cât și de transportul în comun — este capăt de linie major, cu legături directe spre aproape orice punct strategic din oraș. Pe această pagină găsești apartamentele active din portofoliul CAMIMOB în Micro 14, de vânzare și de închiriat, la prețuri competitive față de zonele centrale.",
    sections: [
      {
        heading: "Caracteristicile cartierului Micro 14",
        body: "Micro 14 se află în partea de vest a Buzăului, în prelungirea Bulevardului Stadionului, în vecinătatea platformei industriale și a Șoselei Spătarului. Ca toate cartierele „Micro”, a fost dezvoltat sistematic, cu blocuri organizate în ansambluri compacte, spații verzi între blocuri, locuri de joacă, școli, grădinițe și mici centre comerciale incluse în plan de la început. Pentru cumpărători este o zonă predictibilă: știi ce primești în privința tipologiei apartamentelor și ce facilități ai în jur. Apartamentele sunt predominant clasice — decomandate sau semidecomandate, confort 1 sau 2, cu suprafețe între 28 mp (garsoniere) și 78 mp (3 camere). Multe blocuri au beneficiat de reabilitare termică, ceea ce a îmbunătățit confortul iarna; un apartament în bloc reabilitat se vinde cu o primă mică, dar economia la întreținere se recuperează în câteva ierni. Fiind unul dintre cele mai populate cartiere, lichiditatea la revânzare este bună.",
      },
      {
        heading: "Școli și grădinițe în cartier",
        body: "Rețeaua școlară este unul dintre cele mai puternice argumente ale cartierului. Școala Gimnazială „Sfântul Apostol Andrei” (fosta Școală Nr. 12) este o instituție de referință, localizată chiar în inima cartierului, cunoscută pentru rezultatele bune și pentru clasele de tip Step by Step. Liceul cu Program Sportiv „Iolanda Balaș Soter” (LPS), pe Aleea Școlilor, este o unitate complexă ce cuprinde învățământ primar, gimnazial și liceal cu profil sportiv — un copil poate parcurge, practic, tot traseul școlar în același campus. Grădinița cu Program Prelungit „Cei Șapte Pitici”, pe Aleea Bujorului, este una dintre cele mai solicitate din oraș, recunoscută pentru curtea generoasă și programele educative. În imediata proximitate, înspre zona industrială și Bazalt, se află unități de învățământ liceal tehnologic, precum Liceul Tehnologic „Meserii și Servicii”. Pentru o familie cu copii, Micro 14 oferă o acoperire completă, de la grădiniță la liceu, fără navetă.",
      },
      {
        heading: "Parcuri și spații verzi",
        body: "În interiorul cartierului, ca în toate zonele de tip „Micro”, spațiul verde vine sub forma părculețelor și mini-zonelor de joacă amenajate între blocuri — de exemplu părculețul de lângă blocul 40 sau spațiile modernizate din zonele pietonale interioare. Marele avantaj este însă Parcul Crâng: deși aparține tehnic zonei vecine, se află la doar câteva minute de mers pe jos sau o stație de autobuz prin Bulevardul Stadionului, și este principala zonă de promenadă folosită efectiv de locuitorii din Micro 14. Practic, ai cel mai mare parc al orașului la dispoziție fără să plătești prima de preț a locuirii chiar lângă el — un compromis foarte bun pentru bugete medii.",
      },
      {
        heading: "Transport în comun: capăt de linie major",
        body: "Micro 14 este capăt de linie pentru o parte importantă a rețelei Trans Bus Buzău, ceea ce înseamnă autobuze care pleacă de la început de traseu — cu loc pe scaun și cu frecvență bună. Liniile 5 și 5B leagă cartierul de Horticolei și de Podul Marghiloman. Liniile 7 și 7B merg spre Gara Tohăneni. Linia 8 face traseul Micro 14 – Spitalul Județean – Spiru Haret – Broșteni – Dorobanți – Gară, deci acoperă într-un singur autobuz spitalul, cartierele din nord-est și gara. Liniile 12 și 12B (Micro 14 – Gara CFR – Bentu) și 13 și 13B (Micro 14 – Gara CFR – Stăncești) dau legătură cu gara și cu localitățile învecinate. Linia 28 continuă spre Mărăcineni, Cernătești, Beceni și Scorțoasa, iar linia 122 deservește Șoseaua Spătarului. Pentru cine lucrează pe platforma industrială sau face naveta din comunele din nord-est, Micro 14 este cartierul cu cel mai bun raport între preț și timp de deplasare.",
      },
      {
        heading: "Cui i se potrivește Micro 14",
        body: "Micro 14 se potrivește tinerilor la prima locuință, care vor un apartament accesibil într-un cartier cu toate facilitățile la îndemână. Familiilor cu copii, pentru rețeaua școlară densă — „Sfântul Apostol Andrei”, LPS „Iolanda Balaș Soter” și „Cei Șapte Pitici” sunt toate în cartier. Celor care lucrează pe platforma industrială din vest, pentru distanța scurtă. Cumpărătorilor în vârstă care fac downsize și vor vecini stabili, magazine de proximitate și acces direct cu autobuzul la Spitalul Județean. Și investitorilor: prețul de achiziție este sub mediana orașului, iar cererea de chirii este constantă tocmai datorită școlilor și a apropierii de zona industrială. Nu este cartierul pentru cine vrea să fie în buricul orașului — dar este cel mai bun raport preț-confort-facilități din Buzău.",
      },
      {
        heading: "Cum te ajută CAMIMOB în Micro 14",
        body: "Consultanții CAMIMOB cunosc blocurile din Micro 14 și au informații actualizate despre starea de reabilitare termică, despre asociațiile de proprietari, despre lucrările planificate și despre prețurile la care s-au încheiat efectiv tranzacțiile în zonă. Pentru cumpărători, asta înseamnă o filtrare rapidă: îți recomandăm doar apartamentele care se potrivesc bugetului și criteriilor tale. Dacă ai copii, te ajutăm să verifici circumscripția școlară a blocului înainte să semnezi — într-un cartier cu mai multe unități școlare bune, strada contează. Te asistăm la vizionări, la verificarea actelor, la evaluarea pentru bancă, la negociere și la notar. Contactează-ne pentru o consultație gratuită și o listă personalizată cu apartamentele din Micro 14 aflate acum în portofoliul nostru.",
      },
    ],
    faq: [
      {
        q: "Ce școli sunt în Micro 14?",
        a: "Școala Gimnazială „Sfântul Apostol Andrei” (fosta Nr. 12) este în inima cartierului, cu clase de tip Step by Step. Liceul cu Program Sportiv „Iolanda Balaș Soter”, pe Aleea Școlilor, acoperă primar, gimnazial și liceal sportiv. Grădinița „Cei Șapte Pitici” este pe Aleea Bujorului. În proximitate, spre Bazalt, se află Liceul Tehnologic „Meserii și Servicii”.",
      },
      {
        q: "Ce linii de autobuz pleacă din Micro 14?",
        a: "Micro 14 este capăt de linie pentru liniile Trans Bus 5, 5B, 7, 7B, 8, 12, 12B, 13, 13B, 28 și 122. Linia 8 acoperă Spitalul Județean, Broșteni, Dorobanți și gara într-un singur traseu; liniile 12, 12B, 13 și 13B merg la Gara CFR.",
      },
      {
        q: "Cât de aproape este Parcul Crâng de Micro 14?",
        a: "La câteva minute de mers pe jos sau o stație de autobuz prin Bulevardul Stadionului. Deși aparține tehnic zonei vecine, Parcul Crâng este principala zonă de promenadă folosită de locuitorii din Micro 14.",
      },
      {
        q: "Există parcare în Micro 14?",
        a: "Parcare de reședință organizată de primărie, cu locuri alocate proprietarilor de apartamente — nu garaj propriu, ci loc în spațiul comun. Pentru un loc propriu, verifică dacă blocul care te interesează are garaje individuale sau locuri închiriabile.",
      },
    ],
    filter: {
      propertyType: "APARTAMENT",
      zoneNormalized: "micro 14",
    },
    keepIndexableWhenEmpty: true,
  },
  {
    slug: "apartamente-unirii-nord-buzau",
    title: "Apartamente în zona Unirii Nord, Buzău | CAMIMOB",
    description:
      "Apartamente de vânzare și de închiriat în zona Unirii Nord, Buzău. Școala „George Emil Palade” și Școala Nr. 11 în zonă, bulevard recent reamenajat, Parcul Tineretului aproape. Oferte CAMIMOB.",
    h1: "Apartamente în zona Unirii Nord, Buzău",
    breadcrumbLabel: "Apartamente Unirii Nord",
    intro:
      "Unirii Nord este axată de-a lungul principalei artere rutiere modernizate a Buzăului — bulevardul care merge spre ieșirea către Râmnicu Sărat și Focșani — și cuprinde atât ansambluri rezidențiale de blocuri, cât și zone comerciale majore. Pe această pagină găsești apartamentele active din portofoliul CAMIMOB în Unirii Nord, de vânzare și de închiriat. Este zona care combină cel mai bine accesul rapid la ieșirea din oraș, școli puternice și un bulevard recent reamenajat complet.",
    sections: [
      {
        heading: "Despre zona Unirii Nord",
        body: "Unirii Nord se desfășoară de-a lungul Bulevardului Unirii, în porțiunea care urcă spre ieșirea din oraș către Râmnicu Sărat și Focșani. Este principala axă rutieră modernizată a Buzăului, ceea ce îi dă un caracter dublu: ansambluri rezidențiale de blocuri pe de o parte, zone comerciale majore pe de alta. Pentru cumpărători, asta înseamnă că tot ce ai nevoie zilnic — supermarketuri, farmacii, bănci, servicii — este la câteva minute, fără să plătești prima de preț a Centrului. Apartamentele sunt predominant în blocuri P+4 și P+10 din anii '70-'80, cu plan decomandat sau semidecomandat, cu suprafețe între 28 mp (garsoniere) și 80 mp (3 camere confort 1); multe blocuri au intrat în programe de reabilitare termică. Spre nord, la ieșirea din oraș, s-a dezvoltat și ansamblul rezidențial Orizont, cu construcții mai noi.",
      },
      {
        heading: "Școli și grădinițe în zonă",
        body: "Unirii Nord este una dintre zonele cele mai bine acoperite școlar din Buzău. Școala Gimnazială „George Emil Palade” (fosta Școală Nr. 15) este principala unitate din zonă, localizată la granița dintre cartierul Unirii și zona Crâng, și deservește o mare parte din copiii de pe Unirii Nord. Puțin mai la sud-est, pe strada Teilor, se află Școala Gimnazială Nr. 11 — cea mai mare școală gimnazială ca număr de elevi din județ, a cărei circumscripție acoperă o parte importantă a blocurilor de pe Unirii Nord, inclusiv blocurile 27, 28 și 29. Grădinița cu Program Prelungit Nr. 8, pe Bulevardul Unirii nr. 10, este modernizată și foarte căutată de părinții din zonă datorită programului extins. Grădinița cu Program Prelungit Nr. 1 se află în ansamblul rezidențial Orizont, la ieșirea din oraș spre nord. Important de reținut: circumscripția școlară diferă de la un bloc la altul pe aceeași porțiune de bulevard — verifică-o înainte să cumperi.",
      },
      {
        heading: "Parcuri și spații verzi",
        body: "Unirii Nord nu are un parc istoric de mari dimensiuni în interiorul ei, dar excelează la alte capitole. Spațiile verzi de aliniament de pe Bulevardul Unirii au fost recent reamenajate complet: rulouri de gazon, sisteme de irigații automatizate, flori și arbuști decorativi pe toată lungimea bulevardului — ceea ce schimbă sensibil aspectul și confortul zonei, mai ales vara. Parcul Tineretului este situat relativ aproape, în zona adiacentă dinspre Broșteni și est, și reprezintă principala zonă pentru alergat, plimbări cu bicicleta, skateboarding și relaxare lângă lac. Printre blocurile din cartier există mai multe părculețe dotate cu echipamente noi pentru copii. Pe scurt: nu ai pădure la fereastră ca în Crâng, dar ai bulevard verde îngrijit și un parc mare de agrement la distanță mică.",
      },
      {
        heading: "Transport în comun",
        body: "Fiind principala axă nord-sud a orașului, Unirii Nord beneficiază de un flux excelent de autobuze Trans Bus Buzău. Linia 1 tranzitează zona către partea comercială din nord și Patinoar. Linia 2 face legătura Sărata Monteoru / Gura Sărății – Autogara Marghiloman, iar linia 3 traseul Dedeman – Centrul de Recoltare. Linia 22 pleacă din Gara CFR, trece prin Unirii Nord și continuă spre Fulga. În plus, toate liniile metropolitane din nord — 23, 24, 25, 26, 27 și 28 — pornesc din zona Gării sau a Centrului și urcă pe Bulevardul Unirii Nord către Mărăcineni, Săpoca și Valea Slănicului. Stațiile cheie din această porțiune sunt Unirii Nord, Prutului, XXL / Penny și Orizont. Pentru cine face naveta dinspre comunele din nordul județului, Unirii Nord este practic prima oprire urbană — cel mai scurt drum posibil.",
      },
      {
        heading: "Sfaturi și recomandări CAMIMOB",
        body: "Pe Unirii Nord, prețul pe metru pătrat variază destul de mult de la un bloc la altul, în funcție de poziția față de bulevardul propriu-zis, de starea blocului și de calitatea tâmplăriei spre stradă. Apartamentele cu vedere spre o stradă liniștită sunt mai scumpe decât cele cu vedere spre bulevard sau spre intersecții — și diferența este justificată: pe o arteră cu acest trafic, zgomotul este factorul care îți strică cel mai repede confortul. Pentru cumpărători sensibili la zgomot, recomandăm insistent vizionări la ore diferite: un apartament care pare liniștit duminică dimineață poate fi expus traficului luni la ora 8. Verifică geamurile și, dacă e cazul, calculează costul înlocuirii cu tâmplărie fonoizolantă. Cere documentația completă a asociației de proprietari și verifică circumscripția școlară a blocului. Suntem la dispoziția ta pentru o consultație gratuită și o listă personalizată de oferte din Unirii Nord.",
      },
    ],
    faq: [
      {
        q: "Ce școli sunt în zona Unirii Nord?",
        a: "Școala Gimnazială „George Emil Palade” (fosta Nr. 15) este principala unitate din zonă, la granița cu Crâng. Școala Gimnazială Nr. 11, pe strada Teilor, este cea mai mare din județ ca număr de elevi și acoperă prin circumscripție o parte importantă a blocurilor de pe Unirii Nord, inclusiv blocurile 27, 28 și 29. Grădinițe: GPP Nr. 8 pe Bd. Unirii nr. 10 și GPP Nr. 1 în ansamblul Orizont.",
      },
      {
        q: "Ce linii de autobuz trec prin Unirii Nord?",
        a: "Liniile Trans Bus 1, 2, 3 și 22, plus toate liniile metropolitane din nord (23–28), care urcă pe bulevard spre Mărăcineni, Săpoca și Valea Slănicului. Stațiile cheie sunt Unirii Nord, Prutului, XXL / Penny și Orizont.",
      },
      {
        q: "Există spații verzi pe Unirii Nord?",
        a: "Da. Aliniamentul verde de pe Bulevardul Unirii a fost reamenajat complet, cu gazon, irigații automatizate, flori și arbuști decorativi pe toată lungimea. Parcul Tineretului, cu lac, piste de biciclete și zonă de skateboarding, este relativ aproape, dinspre Broșteni și est. Printre blocuri există mai multe locuri de joacă modernizate.",
      },
      {
        q: "Cât de zgomotos este Bulevardul Unirii Nord?",
        a: "Fiind principala axă nord-sud a orașului, traficul este consistent în orele de vârf. Apartamentele cu vedere spre străzile laterale sunt semnificativ mai liniștite decât cele spre bulevard. Recomandăm vizionări la ore diferite ale zilei înainte de decizie.",
      },
    ],
    filter: {
      propertyType: "APARTAMENT",
      zoneNormalized: "unirii nord",
    },
    keepIndexableWhenEmpty: true,
  },
  {
    slug: "apartamente-unirii-sud-buzau",
    title: "Apartamente în zona Unirii Sud, Buzău | CAMIMOB",
    description:
      "Apartamente de vânzare și de închiriat în zona Unirii Sud, Buzău. Școala „Nicu Constantinescu” în zonă, lângă BIG, Kaufland Sud și Lidl, acces rapid spre Ploiești. Oferte CAMIMOB.",
    h1: "Apartamente în zona Unirii Sud, Buzău",
    breadcrumbLabel: "Apartamente Unirii Sud",
    intro:
      "Unirii Sud se întinde din zona centrală — intersecția cu strada Frăsinet și Episcopiei — trece pe lângă BIG și ajunge până la ieșirea spre Ploiești, la Bariera Ploiești și Calea Eroilor. Este o zonă comercială foarte activă și un nod important de legătură între sudul județului și restul orașului. Pe această pagină găsești apartamentele active din portofoliul CAMIMOB în Unirii Sud, de vânzare și de închiriat.",
    sections: [
      {
        heading: "Despre zona Unirii Sud",
        body: "Unirii Sud are un profil clar: comerț și conectivitate. Porțiunea de bulevard dintre zona centrală și Bariera Ploiești concentrează o densitate mare de magazine, servicii și centre comerciale, de la BIG în partea dinspre centru până la Kaufland Sud și Lidl spre Calea Eroilor. Pentru viața de zi cu zi, asta înseamnă că nu ai nevoie de mașină pentru nimic din ce cumperi săptămânal. Zona este și principalul nod de legătură cu sudul județului și cu platforma industrială din sud, ceea ce o face foarte practică pentru cine lucrează acolo sau face naveta dinspre comunele din sud. Apartamentele sunt predominant în blocuri clasice de-a lungul bulevardului și pe străzile adiacente, cu tipologii de la garsoniere la 3 camere. Prețurile rămân sub nivelul Centrului, iar lichiditatea la revânzare este bună datorită cererii constante.",
      },
      {
        heading: "Școli și grădinițe în zonă",
        body: "Școala Gimnazială „Nicu Constantinescu” (fosta Școală Nr. 5), situată foarte aproape de bulevard, pe strada Școlii, este unitatea de referință care deservește copiii din blocurile de pe Unirii Sud. Grădinița cu Program Normal Nr. 6 funcționează chiar sub structura administrativă a Școlii „Nicu Constantinescu” și se află în aceeași zonă, ceea ce simplifică tranziția de la grădiniță la clasa pregătitoare. Spre extremitatea sudică, pe Calea Eroilor, se află Liceul Tehnologic „Dimitrie Filipescu”, cu profil tehnic. Pe străzile adiacente care fac legătura cu zona centrală sau cu cartierul vecin Dorobanți se ajunge extrem de rapid la Colegiul Național „Mihai Eminescu” și la Școala Gimnazială Nr. 11 — deci ai la dispoziție atât varianta de cartier, cât și unitățile de top ale orașului, fără navetă lungă.",
      },
      {
        heading: "Parcuri și spații verzi",
        body: "La fel ca zona de Nord, Unirii Sud nu are un parc istoric masiv în interiorul densității de blocuri, dar mizează pe alternative de promenadă. Aliniamentul verde de pe Bulevardul Unirii Sud a fost modernizat cu gazon, copaci tineri și rețele de irigații, oferind un traseu liniștit pentru plimbări scurte chiar pe marginea bulevardului. În spatele marilor linii de blocuri există părculețe rezidențiale cu locuri de joacă pentru copii și mici scuaruri cu bănci reabilitate. Pentru o ieșire mai consistentă, Parcul Marghiloman — deși aparține tehnic zonei de est, spre Săgeata — este relativ aproape pentru locuitorii din partea estică a bulevardului, ușor accesibil pentru plimbări în natură sau pentru vizitarea Vilei Albatros.",
      },
      {
        heading: "Transport în comun și acces comercial",
        body: "Unirii Sud are o conectivitate excelentă cu platforma industrială din sud, cu marile centre comerciale și cu ieșirea spre București și Ploiești. Linia 1 este o rută circulară majoră: C.I.T. Buzău – BIG – ACR – RAM – Piața Centrală – Gară – Dorobanți – Kaufland Sud; practic acoperă într-un singur traseu comerțul, piața, gara și cartierele din nord-est. Linia 2 tranzitează Unirii spre Autogara Marghiloman, venind dinspre Sărata Monteoru și Gura Sărății. Linia 10 face traseul Bazalt – Crâng – Kaufland Sud – Lidl – ACR – Piața Centrală – Gară. Linia 22 pleacă din Gara CFR și urcă pe toată axa Unirii Sud – Unirii Nord spre Fulga. Se adaugă liniile care coboară spre Calea Eroilor, zona industrială și localitățile din sud, cum ar fi cele către Lipia, Merei sau Costești. Stațiile principale din zonă: BIG, Kaufland Sud, Lidl / Calea Eroilor și ACR, la intersecția cu Bulevardul Stadionului.",
      },
      {
        heading: "Sfaturi și recomandări CAMIMOB",
        body: "Unirii Sud are avantajul comerțului la câțiva pași, dar exact asta e și compromisul: traficul pe bulevard, inclusiv cel greu care tranzitează spre sud, este consistent. Diferența de confort între un apartament cu vedere spre bulevard și unul spre o stradă laterală sau spre curtea interioară a blocurilor este mare — și se reflectă în preț. Pentru cumpărători sensibili la zgomot, recomandăm vizionări la ore diferite și verificarea atentă a tâmplăriei. Verifică și etajul în raport cu spațiile comerciale: un apartament deasupra unui magazin sau a unei unități de alimentație publică poate avea probleme cu ventilația, mirosurile sau orarul de aprovizionare. Cere documentația asociației de proprietari și, dacă ai copii, confirmă circumscripția școlară. Consultanții CAMIMOB cunosc blocurile din zonă și îți spun deschis care sunt pozițiile bune și care nu. Contactează-ne pentru o consultație gratuită.",
      },
    ],
    faq: [
      {
        q: "Ce școli sunt în zona Unirii Sud?",
        a: "Școala Gimnazială „Nicu Constantinescu” (fosta Nr. 5), pe strada Școlii, foarte aproape de bulevard, este unitatea de referință. Grădinița cu Program Normal Nr. 6 funcționează sub aceeași structură administrativă. Spre Calea Eroilor se află Liceul Tehnologic „Dimitrie Filipescu”. Pe străzile adiacente se ajunge rapid la Colegiul Național „Mihai Eminescu” și la Școala Gimnazială Nr. 11.",
      },
      {
        q: "Ce magazine și centre comerciale sunt pe Unirii Sud?",
        a: "Zona este una dintre cele mai active comercial din Buzău: BIG în partea dinspre centru, Kaufland Sud și Lidl spre Calea Eroilor, plus numeroase magazine și servicii de-a lungul bulevardului. Stațiile de autobuz din zonă poartă chiar numele acestor repere: BIG, Kaufland Sud, Lidl / Calea Eroilor, ACR.",
      },
      {
        q: "Ce linii de autobuz trec prin Unirii Sud?",
        a: "Linia 1 (rută circulară: C.I.T. Buzău – BIG – ACR – RAM – Piața Centrală – Gară – Dorobanți – Kaufland Sud), linia 2 spre Autogara Marghiloman, linia 10 (Bazalt – Crâng – Kaufland Sud – Lidl – ACR – Piața Centrală – Gară) și linia 22 spre Fulga, plus liniile care coboară spre Calea Eroilor, zona industrială și localitățile din sud (Lipia, Merei, Costești).",
      },
      {
        q: "Care este diferența între Unirii Nord și Unirii Sud?",
        a: "Unirii Nord urcă spre ieșirea către Râmnicu Sărat și Focșani, are bulevardul recent reamenajat cu aliniament verde și este deservită de liniile metropolitane din nord. Unirii Sud coboară spre Bariera Ploiești și Calea Eroilor, este mult mai densă comercial (BIG, Kaufland Sud, Lidl) și dă acces direct la platforma industrială din sud și la localitățile din sudul județului.",
      },
    ],
    filter: {
      propertyType: "APARTAMENT",
      zoneNormalized: "unirii sud",
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
  {
    slug: "apartamente-micro-3-buzau",
    title: "Apartamente în Micro 3, Buzău | CAMIMOB",
    description:
      "Apartamente de vânzare și de închiriat în Micro 3, Buzău. Creșă, trei grădinițe și Școala „Episcop Dionisie Romano” în cartier, acces rapid la gară. Oferte CAMIMOB.",
    h1: "Apartamente în cartierul Micro 3, Buzău",
    breadcrumbLabel: "Apartamente Micro 3",
    intro:
      "Micro 3 este o zonă rezidențială bine închegată din partea central-nordică a Buzăului, delimitată parțial de Bulevardul Gării, strada Pietroasele și strada Bucegi, în apropierea Secției 1 de Poliție. Are acces facil atât spre gară, cât și spre centru. Pe această pagină găsești apartamentele active din portofoliul CAMIMOB în Micro 3, de vânzare și de închiriat. Dacă ai copii mici, Micro 3 merită o privire atentă: densitatea de creșe și grădinițe din cartier este printre cele mai bune din oraș.",
    sections: [
      {
        heading: "Despre cartierul Micro 3",
        body: "Micro 3 ocupă o poziție privilegiată în partea central-nordică a orașului: delimitat parțial de Bulevardul Gării, strada Pietroasele și strada Bucegi, la câteva minute de gară și foarte aproape de centru. Este un cartier compact și bine închegat, dezvoltat sistematic, cu blocuri organizate în ansambluri și spații verzi între ele. Proximitatea Secției 1 de Poliție este un detaliu pe care mulți cumpărători îl apreciază, mai ales familiile. Apartamentele sunt predominant clasice, decomandate sau semidecomandate, cu tipologii de la garsoniere la 3 camere. Avantajul principal față de cartierele „Micro” din vestul orașului este distanța mult mai mică până în centru și până la gară — fără să plătești prima de preț a locuirii în zona centrală propriu-zisă.",
      },
      {
        heading: "Școli, grădinițe și creșă în zonă",
        body: "Aici Micro 3 se detașează clar. Școala Gimnazială „Episcop Dionisie Romano”, pe strada Bistriței nr. 31, este principala școală gimnazială care deservește direct cartierul. Liceul Agricol „Dr. Constantin Angelescu”, pe strada Crizantemelor nr. 17, este un liceu tehnologic cu tradiție în Buzău, aflat la marginea cartierului. Pentru copiii mici, oferta este neobișnuit de bogată: Creșa Nr. 1 pe strada Pietroasele nr. 9 — o unitate de educație timpurie esențială pentru familiile tinere — plus trei grădinițe cu program prelungit, toate în cartier: GPP „Boboceii” pe strada Pietroasele nr. 12, GPP „Căsuța Fermecată” pe strada Bucegi nr. 9 și GPP Nr. 3 pe strada Bistriței nr. 12. Practic, de la creșă până la liceu, totul este la distanță de mers pe jos. Pentru un părinte care lucrează, a avea trei grădinițe cu program prelungit de ales în propriul cartier este un avantaj concret, nu o formulă de marketing — reduce drastic riscul de a nu prinde loc.",
      },
      {
        heading: "Parcuri și spații verzi",
        body: "În interiorul cartierului se află părculețul de pe strada Pietroasele, cunoscut și ca Parc 1: o mică zonă verde amenajată modern între blocuri, dotată cu echipamente de joacă sigure pentru copii și cu bănci. Este genul de spațiu pe care îl folosești zilnic, nu doar în weekend. Pentru ieșirile mai consistente, Parcul Tineretului — deși aparține tehnic zonei vecine Broșteni — are intrarea la o distanță foarte scurtă și este destinația principală de weekend a locuitorilor din Micro 3: parc masiv, cu lac, terenuri de sport și alei mari. Combinația este foarte practică: loc de joacă sub fereastră pentru zilele de lucru, parc mare la câteva minute pentru weekend.",
      },
      {
        heading: "Transport în comun",
        body: "Datorită așezării între Bulevardul Gării, strada Pietroasele și arterele mari care duc spre Unirii sau Broșteni, Micro 3 este excelent conectat de rețeaua Trans Bus Buzău. Liniile 5 și 5B (Micro 14 – Bulevardul Gării – Horticolei / Pod Marghiloman) dau conexiune rapidă cu vestul și estul orașului. Liniile 6 și 6B fac traseul Gara CFR – Micro 3 – Gară și continuă spre comunele adiacente. Linia 8 (Gară – Dorobanți – Broșteni – Spiru Haret – Micro 14) colectează călătorii din zonele învecinate. Linia 10 face traseul Bazalt – Crâng – Kaufland Sud – Micro 3 / Poliție – Gară, deci acoperă atât parcul, cât și hipermarketul. Se adaugă traseele metropolitane — liniile 11, 13 și 22 — care trec pe Bulevardul Gării și strada Pietroasele și fac legătura cu localitățile limitrofe, printre care Vadu Pașii și Fulga. Stațiile de referință în sau lângă cartier sunt Micro 3 (Poliție), Pietroasele, Bucegi și Gara CFR.",
      },
      {
        heading: "Cui i se potrivește Micro 3",
        body: "Familiilor cu copii mici, în primul rând — creșa și cele trei grădinițe cu program prelungit din cartier sunt un argument pe care puține zone din Buzău îl pot egala. Celor care fac naveta cu trenul sau călătoresc frecvent, pentru distanța mică până la gară. Tinerilor care lucrează în centru și vor să ajungă pe jos sau cu o singură stație de autobuz, fără să plătească prețul unui apartament central. Și investitorilor: cererea de chirii este susținută exact de aceste două categorii, iar prețul de achiziție rămâne sub nivelul zonei centrale. Dacă prioritatea ta este liniștea absolută și verdele din jurul blocului, Crângul sau Broșteni te vor satisface mai mult; dacă prioritatea este poziția și infrastructura pentru copii, Micro 3 este alegerea logică.",
      },
      {
        heading: "Cum te ajută CAMIMOB în Micro 3",
        body: "Consultanții CAMIMOB cunosc blocurile din Micro 3, starea lor de reabilitare termică și prețurile la care s-au încheiat efectiv tranzacțiile în zonă. Dacă ai copii, te ajutăm să verifici circumscripția școlară a blocului care te interesează înainte să semnezi — în Micro 3, unde sunt mai multe unități școlare bune, strada contează. Verificăm actele, starea apartamentului și documentația asociației de proprietari, organizăm vizionările eficient și te asistăm la negociere, la evaluarea pentru bancă și la notar. Contactează-ne pentru o consultație gratuită și îți pregătim o listă personalizată cu ofertele din Micro 3 aflate acum în portofoliul nostru.",
      },
    ],
    faq: [
      {
        q: "Ce școli și grădinițe sunt în Micro 3?",
        a: "Școala Gimnazială „Episcop Dionisie Romano” (str. Bistriței nr. 31) este principala școală a cartierului, iar Liceul Agricol „Dr. Constantin Angelescu” (str. Crizantemelor nr. 17) se află la marginea zonei. Pentru copiii mici: Creșa Nr. 1 (str. Pietroasele nr. 9) și trei grădinițe cu program prelungit — „Boboceii” (str. Pietroasele nr. 12), „Căsuța Fermecată” (str. Bucegi nr. 9) și GPP Nr. 3 (str. Bistriței nr. 12).",
      },
      {
        q: "Ce linii de autobuz deservesc Micro 3?",
        a: "Liniile Trans Bus 5, 5B, 6, 6B, 8 și 10, plus traseele metropolitane 11, 13 și 22 care trec pe Bulevardul Gării și strada Pietroasele spre Vadu Pașii și Fulga. Stațiile de referință sunt Micro 3 (Poliție), Pietroasele, Bucegi și Gara CFR.",
      },
      {
        q: "Ce spații verzi are Micro 3?",
        a: "În cartier se află părculețul de pe strada Pietroasele (Parc 1), amenajat modern, cu echipamente de joacă sigure și bănci. Parcul Tineretului, cu lac, terenuri de sport și alei mari, are intrarea la distanță foarte scurtă, deși aparține tehnic zonei vecine Broșteni.",
      },
      {
        q: "Cât de aproape este Micro 3 de gară și de centru?",
        a: "Cartierul este delimitat parțial de Bulevardul Gării, deci gara este la câteva minute. Centrul este de asemenea foarte aproape, accesibil pe jos sau cu o singură stație de autobuz — unul dintre principalele avantaje ale zonei față de cartierele „Micro” din vestul orașului.",
      },
    ],
    filter: {
      propertyType: "APARTAMENT",
      zoneNormalized: "micro 3",
    },
    keepIndexableWhenEmpty: true,
  },
  {
    slug: "apartamente-centru-buzau",
    title: "Apartamente în Centrul Buzăului | CAMIMOB",
    description:
      "Apartamente de vânzare și de închiriat în Centrul Buzăului, în jurul Pieței Daciei și Bulevardului Bălcescu. Colegiile „B.P. Hasdeu” și „Mihai Eminescu” la câțiva pași. Oferte CAMIMOB.",
    h1: "Apartamente în Centrul Buzăului",
    breadcrumbLabel: "Apartamente Centru",
    intro:
      "Zona centrală a Buzăului, axată în jurul Pieței Daciei, străzii Cuza Vodă și Bulevardului Nicolae Bălcescu, este inima administrativă, culturală și istorică a orașului. Este și cea mai densă în instituții de învățământ de prestigiu și în monumente istorice. Pe această pagină găsești apartamentele active din portofoliul CAMIMOB în Centru, de vânzare și de închiriat. Dacă pui preț pe școli de top la distanță de mers pe jos și pe o viață urbană fără mașină, aici este zona ta.",
    sections: [
      {
        heading: "Despre zona centrală a Buzăului",
        body: "Centrul Buzăului se organizează în jurul Pieței Daciei, al străzii Cuza Vodă și al Bulevardului Nicolae Bălcescu, cu străzile adiacente care îi dau densitatea. Aici sunt concentrate instituțiile administrative, viața culturală și patrimoniul istoric al orașului. Pentru cine locuiește în Centru, consecința practică este că aproape totul se face pe jos: instituții, bănci, piață, restaurante, școli, spectacole. Apartamentele acoperă un spectru larg, de la cele din blocuri interbelice și clădiri cu istorie, până la blocurile din anii '70-'80 ridicate pe arterele principale. Prețul pe metru pătrat este cel mai ridicat din oraș — dar și cel mai stabil: Centrul este zona care își păstrează valoarea cel mai bine în orice condiții de piață, pur și simplu pentru că oferta nu se poate extinde.",
      },
      {
        heading: "Școli, licee și grădinițe de prestigiu",
        body: "Acesta este argumentul decisiv al Centrului și motivul principal pentru care prețurile se mențin. Zona concentrează unele dintre cele mai renumite unități de învățământ din întreg județul. Colegiul Național „B.P. Hasdeu”, pe Bulevardul Gării, chiar la granița cu zona centrală, este liceul de elită al orașului. Colegiul Național „Mihai Eminescu”, pe strada Independenței, este o altă instituție de top, cu rezultate remarcabile. Școala Gimnazială „Căpitan Aviator Mircea T. Bădulescu” (Școala Nr. 1), pe Bulevardul Nicolae Bălcescu, este una dintre cele mai căutate școli gimnaziale din Buzău. Școala Gimnazială „Dionisie Romano”, pe strada Episcopiei, se află în imediata apropiere a centrului istoric. Pentru preșcolari: Grădinița cu Program Prelungit „Crai Nou”, pe strada Unirii, și Grădinița cu Program Prelungit Nr. 1 — ambele foarte apreciate de părinții care lucrează în zona centrală. Un copil poate parcurge, pe jos, tot traseul de la grădiniță la un colegiu național. Puține orașe din România oferă asta într-un perimetru atât de mic.",
      },
      {
        heading: "Parcuri, promenadă și spații publice",
        body: "Centrul nu are un parc masiv în interiorul său, dar compensează cu spații publice de calitate. Piața Daciei, Centrul Civic, a fost recent modernizată complet ca zonă pietonală urbană, cu fântâni arteziene decorative, bănci, texturi de granit și spații deschise pentru evenimente — este acum locul în care orașul se adună. Bulevardul Nicolae Bălcescu este o adevărată axă verde: un bulevard istoric cu trotuare largi, umbrit de o splendidă perdea de tei bătrâni, ideal pentru promenadă. Părculețul de la Catedrala Episcopală (Sfântul Sava) este o oază liniștită de verdeață în jurul complexului bisericesc istoric. Iar pentru o ieșire adevărată în natură: intrarea pe Bulevardul Bălcescu pornește direct din Centru și duce în linie dreaptă, după o plimbare de 15-20 de minute la umbra teilor, direct în Parcul Crâng. Practic, cel mai mare parc al orașului este la o plimbare, nu la un drum cu mașina.",
      },
      {
        heading: "Transport în comun: nodul principal al orașului",
        body: "Centrul este nodul principal de tranzit al municipiului — aproape toate liniile urbane converg sau trec prin stațiile centrale majore, cum sunt RAM, Piața Centrală, Hasdeu sau Catedrală. Linia 1 face ruta C.I.T. – BIG – ACR – RAM – Piața Centrală – Gară – Dorobanți – Kaufland Sud. Linia 2 vine din Sărata Monteoru, tranzitează Centrul și RAM, și continuă spre Autogara Marghiloman. Linia 3 merge Dedeman – Piața Centrală – Centrul de Recoltare. Liniile 4 și 4B fac Rond Stadion – RAM – Gară. Liniile 5 și 5B pornesc din Micro 14 și tranzitează zona adiacentă a bulevardelor centrale spre Horticolei. Linia 8 face Gară – Dorobanți – Broșteni – Catedrală – Spiru Haret – Micro 14. Linia 10 merge Bazalt – Crâng – Piața Centrală – Gară. În plus, toate traseele metropolitane, liniile 23 până la 28, au stații în punctele cheie din Centru — în special RAM și Episcopie — pentru a prelua fluxul de călători spre Mărăcineni, Săpoca și Valea Slănicului. Din Centru ajungi oriunde în oraș fără schimbare de autobuz.",
      },
      {
        heading: "Cui i se potrivește Centrul",
        body: "Familiilor care își aleg locuința în funcție de școală — aici ai „B.P. Hasdeu”, „Mihai Eminescu” și Școala Nr. 1 la distanță de mers pe jos, iar asta schimbă complet logistica unei zile de lucru. Tinerilor profesioniști care lucrează în zona administrativă și nu vor să depindă de mașină. Celor care prețuiesc viața urbană: cafenele, restaurante, evenimente în Piața Daciei, promenadă pe Bălcescu. Și investitorilor cu orizont lung: Centrul are cea mai mică volatilitate de preț din oraș și cea mai constantă cerere de chirii, inclusiv din partea profesioniștilor relocați. Compromisurile sunt reale și trebuie spuse: prețul pe metru pătrat este cel mai mare din Buzău, parcarea este cea mai dificilă, iar unele clădiri vechi au nevoie de investiții în instalații. Dacă vrei maximum de metri pătrați pe buget, Micro 3, Broșteni sau Micro 14 îți dau mult mai mult.",
      },
      {
        heading: "Cum te ajută CAMIMOB în Centru",
        body: "În zona centrală, diferențele dintre două apartamente aparent similare pot fi uriașe: anul și tipul construcției, starea instalațiilor, regimul juridic al clădirii, existența unui loc de parcare, nivelul de zgomot de la stradă, dar și circumscripția școlară exactă. Consultanții CAMIMOB cunosc clădirile din Centru și îți spun deschis care poziții merită prețul cerut și care nu. Verificăm cu atenție specială actele — în centrul istoric pot apărea situații juridice mai complicate decât într-un bloc standard — și te asistăm cu un specialist juridic dacă este nevoie. Dacă ai copii, confirmăm circumscripția înainte de antecontract. Te ajutăm la negociere, la evaluarea pentru bancă și la notar. Dacă ești proprietar de apartament în Centru și vrei să vinzi sau să închiriezi, spune-ne: este zona cu cea mai constantă cerere din portofoliul nostru.",
      },
    ],
    faq: [
      {
        q: "Ce școli și licee sunt în Centrul Buzăului?",
        a: "Colegiul Național „B.P. Hasdeu” (Bd. Gării, la granița cu centrul) este liceul de elită al orașului, iar Colegiul Național „Mihai Eminescu” (str. Independenței) este o altă instituție de top. Gimnazial: Școala „Căpitan Aviator Mircea T. Bădulescu” (Nr. 1) pe Bd. Nicolae Bălcescu și Școala „Dionisie Romano” pe str. Episcopiei. Grădinițe: GPP „Crai Nou” pe str. Unirii și GPP Nr. 1.",
      },
      {
        q: "Cât durează din Centru până în Parcul Crâng?",
        a: "15-20 de minute de plimbare. Intrarea pe Bulevardul Bălcescu pornește direct din Centru și duce în linie dreaptă până în parc, la umbra teilor bătrâni de pe bulevard.",
      },
      {
        q: "Ce linii de autobuz trec prin Centru?",
        a: "Practic toate. Centrul este nodul principal de tranzit: liniile 1, 2, 3, 4, 4B, 5, 5B, 8 și 10, plus toate traseele metropolitane (23–28), care au stații în punctele cheie — în special RAM și Episcopie. Stațiile centrale majore sunt RAM, Piața Centrală, Hasdeu și Catedrală.",
      },
      {
        q: "De ce sunt apartamentele din Centru mai scumpe?",
        a: "Pentru trei motive care se cumulează: concentrarea de școli și licee de prestigiu, accesul pe jos la tot ce ai nevoie zilnic, și faptul că oferta nu se poate extinde — nu se mai construiește în perimetrul central. Exact de aceea Centrul este și zona care își păstrează cel mai bine valoarea în timp.",
      },
    ],
    filter: {
      propertyType: "APARTAMENT",
      zoneNormalized: "centru",
    },
    keepIndexableWhenEmpty: true,
  },
  {
    slug: "apartamente-dorobanti-1-buzau",
    title: "Apartamente în Dorobanți 1, Buzău | CAMIMOB",
    description:
      "Apartamente de vânzare și de închiriat în Dorobanți 1, Buzău. Școala Nr. 11 — cea mai mare din județ — în apropiere, Parcul Marghiloman la câteva minute, gara pe jos. Oferte CAMIMOB.",
    h1: "Apartamente în cartierul Dorobanți 1, Buzău",
    breadcrumbLabel: "Apartamente Dorobanți 1",
    intro:
      "Dorobanți 1 este prima secțiune a marii zone rezidențiale din estul Buzăului, situată mai aproape de Bulevardul Unirii și de zona centrală decât „fratele” său, Dorobanți 2. Este o zonă compactă, cu densitate mare de blocuri și o infrastructură comercială de proximitate excelentă. Pe această pagină găsești apartamentele active din portofoliul CAMIMOB în Dorobanți 1, de vânzare și de închiriat.",
    sections: [
      {
        heading: "Despre cartierul Dorobanți 1",
        body: "Dorobanți 1 este partea cartierului Dorobanți aflată cel mai aproape de centru și de Bulevardul Unirii, delimitată parțial de strada Dorobanți față de Dorobanți 2. Este compact și dens construit, ceea ce are un efect direct asupra vieții de zi cu zi: infrastructura comercială de proximitate este foarte bine dezvoltată, cu magazine, farmacii și servicii la câțiva pași de orice bloc. Poziția este principalul atu — ești suficient de aproape de centru și de Gara CFR ca să te deplasezi pe jos, dar într-un cartier rezidențial cu prețuri sub nivelul zonei centrale. Apartamentele sunt predominant în blocuri clasice, cu tipologii de la garsoniere la 3 camere.",
      },
      {
        heading: "Școli și grădinițe în zonă",
        body: "Școala Gimnazială Nr. 11 Buzău, pe strada Teilor, este școala de referință la care sunt arondați majoritatea copiilor din Dorobanți 1. Deși se află tehnic la granița dintre Unirii și Dorobanți, este unitatea de care aparține cartierul — și este cea mai mare școală din județ ca număr de elevi, ceea ce aduce cu sine o ofertă largă de clase, profesori și activități extrașcolare. Liceul Tehnologic „Henri Coandă”, pe strada Horticolei, se află în imediata vecinătate a cartierului și acoperă profilurile tehnice. Pentru preșcolari, Grădinița cu Program Prelungit Nr. 4 deservește cu succes și această zonă. Recomandarea noastră rămâne aceeași ca în tot cartierul Dorobanți: verifică circumscripția exactă a blocului care te interesează, pentru că granița dintre Unirii, Dorobanți 1 și Dorobanți 2 trece prin zonă.",
      },
      {
        heading: "Parcuri și spații verzi",
        body: "Dorobanți 1 dispune de mai multe mini-parcuri interioare între blocuri, cu locuri de joacă modernizate recent — leagăne, tobogane și covor elastic de protecție — plus zone cu bănci pentru pensionari. Sunt spații pe care le folosești efectiv zilnic, nu doar în weekend. Pentru ieșiri mai consistente, Parcul Marghiloman rămâne principala destinație: parc istoric cu Vila Albatros și lacul cu nuferi, la doar câteva minute de mers pe jos spre sud-est. Parcul Tineretului este accesibil rapid mergând spre nord, prin Broșteni, și oferă facilități pentru sport și agrement. Practic, ai un parc istoric pentru plimbări și unul sportiv pentru activitate, ambele fără mașină.",
      },
      {
        heading: "Transport în comun",
        body: "Fiind situat mai aproape de arterele centrale și de Gara CFR, Dorobanți 1 are un acces extrem de rapid la transportul public Trans Bus Buzău. Linia 1 (C.I.T. – BIG – RAM – Gară – Dorobanți 1 – Kaufland Sud) oprește chiar în inima cartierului și oferă legătura directă cu ambele extremități comerciale ale orașului. Liniile 6 și 6B fac traseul Gara CFR – Dorobanți – localitățile limitrofe din est. Linia 8 (Gară – Dorobanți 1 – Broșteni – Spiru Haret – Micro 14) este traseul ideal pentru a traversa orașul direct către Spitalul Județean sau Micro 14. Liniile 11 și 11B leagă Gara CFR de Dorobanți și Broșteni, continuând spre Vadu Pașii. Stațiile de referință sunt Dorobanți 1, Liceul Henri Coandă, Teilor și Gara, aceasta din urmă aflată la distanță de mers pe jos.",
      },
      {
        heading: "Cum te ajută CAMIMOB în Dorobanți 1",
        body: "Dorobanți 1 este un cartier în care poziția exactă a blocului schimbă mult valoarea: distanța până la Gara CFR, apropierea de strada Dorobanți sau de Bulevardul Unirii, circumscripția școlară, expunerea la zgomot. Consultanții CAMIMOB cunosc blocurile din zonă și îți spun deschis ce justifică prețul cerut. Verificăm actele, starea apartamentului și documentația asociației de proprietari, organizăm vizionările eficient și te asistăm la negociere, la evaluarea pentru bancă și la notar. Dacă ești proprietar în Dorobanți 1 și vrei să vinzi sau să închiriezi, zona are cerere constantă — spune-ne și îți facem o evaluare realistă.",
      },
    ],
    faq: [
      {
        q: "Ce școli sunt în Dorobanți 1?",
        a: "Școala Gimnazială Nr. 11, pe strada Teilor, este școala de referință la care sunt arondați majoritatea copiilor din cartier și cea mai mare din județ ca număr de elevi. Liceul Tehnologic „Henri Coandă” este pe strada Horticolei, în imediata vecinătate. Grădinița cu Program Prelungit Nr. 4 deservește și această zonă.",
      },
      {
        q: "Care este diferența între Dorobanți 1 și Dorobanți 2?",
        a: "Dorobanți 1 este secțiunea mai apropiată de centru și de Bulevardul Unirii, mai compactă și mai densă, cu acces pe jos la Gara CFR. Dorobanți 2 continuă spre est, este mai liniștit, învecinat cu Broșteni și cu zona industrială de est. Cele două sunt delimitate parțial de strada Dorobanți.",
      },
      {
        q: "Ce linii de autobuz opresc în Dorobanți 1?",
        a: "Liniile Trans Bus 1, 6, 6B, 8, 11 și 11B. Linia 1 oprește chiar în inima cartierului și leagă zona de BIG și Kaufland Sud; linia 8 traversează orașul spre Spitalul Județean și Micro 14. Stațiile de referință: Dorobanți 1, Liceul Henri Coandă, Teilor și Gara.",
      },
    ],
    filter: {
      propertyType: "APARTAMENT",
      zoneNormalized: "dorobanti 1",
    },
    keepIndexableWhenEmpty: true,
  },
  {
    slug: "apartamente-dorobanti-2-buzau",
    title: "Apartamente în Dorobanți 2, Buzău | CAMIMOB",
    description:
      "Apartamente de vânzare și de închiriat în Dorobanți 2, Buzău. Zonă liniștită din estul orașului, lângă Parcul Marghiloman, Școala Nr. 7 în apropiere. Oferte CAMIMOB.",
    h1: "Apartamente în cartierul Dorobanți 2, Buzău",
    breadcrumbLabel: "Apartamente Dorobanți 2",
    intro:
      "Dorobanți 2 este o zonă rezidențială liniștită și bine conturată din partea de est a Buzăului, aflată în continuarea cartierului Dorobanți 1 — cele două sunt delimitate parțial de strada Dorobanți — și învecinată cu cartierul Broșteni și cu zona industrială de est. Pe această pagină găsești apartamentele active din portofoliul CAMIMOB în Dorobanți 2. Dacă te interesează o casă cu curte în aceeași zonă, avem o pagină separată pentru case în Dorobanți 2.",
    sections: [
      {
        heading: "Despre cartierul Dorobanți 2",
        body: "Dorobanți 2 continuă cartierul Dorobanți spre est, dincolo de strada Dorobanți, și se învecinează cu Broșteni și cu zona industrială de est. Caracterul lui este clar: liniștit și bine conturat, fără traficul de tranzit care afectează arterele mari. Pentru cumpărători, asta înseamnă un cartier în care se locuiește, nu prin care se trece. Fiind mai departe de centru decât Dorobanți 1, prețurile sunt în general mai accesibile, iar oferta este mai variată ca tipologie — aici găsești atât apartamente în blocuri, cât și case cu curte și terenuri construibile, o combinație rară în interiorul orașului. Vecinătatea cu zona industrială de est este un avantaj practic pentru cine lucrează acolo.",
      },
      {
        heading: "Școli și grădinițe în zonă",
        body: "Școala Gimnazială Nr. 7 este unitatea școlară principală de care aparțin majoritatea copiilor din Dorobanți 2. Deși administrativ este poziționată la granița dintre Broșteni și Dorobanți, pe strada Privighetorilor, este școala la care sunt arondați copiii din cartier. Grădinița cu Program Prelungit Nr. 4 se află în imediata vecinătate și este foarte accesibilă pentru părinții din zonă. Pentru nivelul liceal, Liceul Tehnologic „Henri Coandă”, situat puțin mai la sud-est, pe strada Horticolei, deservește zona de est cu profiluri tehnice și profesionale. Ca în tot cartierul Dorobanți, verifică circumscripția exactă a adresei care te interesează înainte să semnezi — granițele administrative trec prin zonă.",
      },
      {
        heading: "Parcuri și spații verzi",
        body: "Dorobanți 2 beneficiază de mai multe alveole verzi și locuri de joacă între blocuri, modernizate de municipalitate cu mobilier urban nou și cu zone de relaxare izolate de traficul principal — exact genul de spațiu care face diferența când ai copii mici. Cel mai important punct de atracție verde din vecinătate este Parcul Marghiloman, la doar câteva minute de mers pe jos spre sud: un spațiu istoric superb, cu alei largi, Lacul cu nuferi și Centrul Cultural din Vila Albatros. Parcul Tineretului, situat puțin mai la nord, în dreptul cartierului Broșteni, este ușor accesibil pentru cei care caută activități sportive, piste de biciclete sau role. Două parcuri mari, în două direcții, ambele pe jos.",
      },
      {
        heading: "Transport în comun",
        body: "Dorobanți 2 este excelent conectat atât cu Gara CFR, cât și cu zona comercială din sud și cu marile bulevarde centrale, prin stațiile de pe strada Dorobanți și strada Horticolei. Linia 1 (C.I.T. – BIG – RAM – Gară – Dorobanți – Kaufland Sud) este o linie circulară vitală, care leagă cartierul direct de marile zone comerciale și de centru. Liniile 5 și 5B pornesc din Micro 14 și tranzitează strada Horticolei spre Podul Marghiloman. Liniile 6 și 6B fac traseul Gara CFR – axa Dorobanți – localitățile limitrofe. Linia 8 (Gară – Dorobanți – Broșteni – Spiru Haret – Micro 14) asigură o diagonală completă prin oraș, de la est la vest. Stațiile de referință din apropiere sunt Dorobanți 2, Broșteni (intersecție), Horticolei și Complex Dorobanți.",
      },
      {
        heading: "Cum te ajută CAMIMOB în Dorobanți 2",
        body: "Dorobanți 2 este un cartier în care poziția exactă a blocului schimbă sensibil valoarea: distanța față de strada Dorobanți, apropierea de zona industrială de est, expunerea la zgomot și circumscripția școlară. Consultanții CAMIMOB cunosc blocurile din zonă, starea lor de reabilitare termică și prețurile la care s-au încheiat efectiv tranzacțiile. Verificăm actele, documentația asociației de proprietari și starea reală a apartamentului, organizăm vizionările eficient și te asistăm la negociere, la evaluarea pentru bancă și la notar. Dacă ești proprietar de apartament în Dorobanți 2 și vrei să vinzi sau să închiriezi, contactează-ne pentru o evaluare realistă.",
      },
    ],
    faq: [
      {
        q: "Ce școli sunt în Dorobanți 2?",
        a: "Școala Gimnazială Nr. 7, pe strada Privighetorilor, la granița cu Broșteni, este unitatea de care aparțin majoritatea copiilor din cartier. Grădinița cu Program Prelungit Nr. 4 este în imediata vecinătate. Liceul Tehnologic „Henri Coandă”, pe strada Horticolei, acoperă nivelul liceal tehnic.",
      },
      {
        q: "Cât de aproape este Parcul Marghiloman?",
        a: "La câteva minute de mers pe jos spre sud. Este cel mai important punct verde din vecinătate, cu alei largi, Lacul cu nuferi și Centrul Cultural din Vila Albatros. Parcul Tineretului este accesibil spre nord, în dreptul Broștenilor.",
      },
      {
        q: "Ce linii de autobuz trec prin Dorobanți 2?",
        a: "Liniile Trans Bus 1, 5, 5B, 6, 6B și 8, prin stațiile de pe strada Dorobanți și strada Horticolei. Linia 1 este circulară și leagă cartierul de BIG și Kaufland Sud; linia 8 traversează orașul de la est la vest. Stații: Dorobanți 2, Broșteni (intersecție), Horticolei, Complex Dorobanți.",
      },
      {
        q: "Găsesc și case sau terenuri în Dorobanți 2?",
        a: "Da. Dorobanți 2 este unul dintre puținele cartiere din interiorul orașului cu toate trei tipologiile. Casele au pagina lor dedicată, iar terenurile apar pe pagina de terenuri de vânzare.",
      },
    ],
    filter: {
      propertyType: "APARTAMENT",
      zoneNormalized: "dorobanti 2",
    },
    keepIndexableWhenEmpty: true,
  },
  {
    slug: "case-dorobanti-2-buzau",
    title: "Case de vânzare în Dorobanți 2, Buzău | CAMIMOB",
    description:
      "Case de vânzare în Dorobanți 2, Buzău. Zonă liniștită din estul orașului, lângă Parcul Marghiloman, Școala Nr. 7 în apropiere. Case cu curte în oraș. Oferte CAMIMOB.",
    h1: "Case de vânzare în Dorobanți 2, Buzău",
    breadcrumbLabel: "Case Dorobanți 2",
    intro:
      "Dorobanți 2 este unul dintre puținele cartiere din interiorul Buzăului unde găsești case cu curte alături de blocuri. Zona este liniștită și bine conturată, în partea de est a orașului, în continuarea cartierului Dorobanți 1, învecinată cu Broșteni și cu zona industrială de est. Pe această pagină găsești casele active din portofoliul CAMIMOB în Dorobanți 2 — locuințe la curte, cu utilități urbane și cu Parcul Marghiloman la câteva minute de mers pe jos.",
    sections: [
      {
        heading: "O casă cu curte, fără să ieși din oraș",
        body: "Majoritatea celor care vor o casă cu curte în zona Buzăului ajung să se uite în comunele limitrofe — Mărăcineni, Merei, Vernești — și acceptă naveta ca preț al spațiului. Dorobanți 2 este una dintre puținele zone care oferă compromisul invers: locuință la curte, dar în interiorul municipiului, cu utilități urbane la poartă, drum asfaltat, transport în comun la câteva minute și școala în cartier. Nu plătești racordări scumpe, nu depinzi de mașină pentru fiecare drum, iar copilul merge pe jos la școală. În schimb, curțile sunt în general mai mici decât la o casă de comună, iar prețul pe metru pătrat este mai mare. Pentru familiile care vor spațiu fără să renunțe la oraș, este exact echilibrul căutat — și motivul pentru care casele de aici se vând repede.",
      },
      {
        heading: "Școli și grădinițe în zonă",
        body: "Școala Gimnazială Nr. 7 este unitatea școlară principală de care aparțin majoritatea copiilor din Dorobanți 2. Deși administrativ este poziționată la granița dintre Broșteni și Dorobanți, pe strada Privighetorilor, este școala la care sunt arondați copiii din cartier. Grădinița cu Program Prelungit Nr. 4 se află în imediata vecinătate și este foarte accesibilă pentru părinții din zonă. Pentru nivelul liceal, Liceul Tehnologic „Henri Coandă”, situat puțin mai la sud-est, pe strada Horticolei, deservește zona de est cu profiluri tehnice și profesionale. La o casă, verifică explicit circumscripția adresei — granițele administrative trec prin zonă și pot diferi de la o stradă la alta.",
      },
      {
        heading: "Parcuri și spații verzi",
        body: "Dacă ai propria curte, nevoia de spațiu verde public scade — dar rămâne relevantă pentru plimbări și sport. Cel mai important punct de atracție verde din vecinătate este Parcul Marghiloman, la doar câteva minute de mers pe jos spre sud: un spațiu istoric superb, cu alei largi, Lacul cu nuferi și Centrul Cultural din Vila Albatros. Parcul Tineretului, situat puțin mai la nord, în dreptul cartierului Broșteni, este ușor accesibil pentru activități sportive, piste de biciclete sau role. Două parcuri mari, în două direcții, ambele pe jos — ceea ce o casă din comună nu îți oferă.",
      },
      {
        heading: "Transport și acces",
        body: "Dorobanți 2 este bine conectat atât cu Gara CFR, cât și cu zona comercială din sud și cu bulevardele centrale, prin stațiile de pe strada Dorobanți și strada Horticolei. Linia 1 (C.I.T. – BIG – RAM – Gară – Dorobanți – Kaufland Sud) leagă cartierul direct de marile zone comerciale și de centru. Liniile 5 și 5B tranzitează strada Horticolei spre Podul Marghiloman. Liniile 6 și 6B fac traseul Gara CFR – axa Dorobanți – localitățile limitrofe. Linia 8 asigură o diagonală completă prin oraș, de la est la vest. Stațiile de referință sunt Dorobanți 2, Broșteni (intersecție), Horticolei și Complex Dorobanți. Pentru o casă, verifică concret distanța pe jos de la adresă până la cea mai apropiată stație — la locuințele la curte aceasta variază mai mult decât la blocuri.",
      },
      {
        heading: "Ce verifici la o casă în Dorobanți 2",
        body: "La o casă, lista de verificări este mult mai lungă decât la un apartament. Cere actele cadastrale și extrasul de carte funciară și confirmă că atât terenul, cât și construcția sunt corect intabulate, fără diferențe între suprafața reală și cea din acte. Verifică fundația și structura — igrasie, fisuri în pereți, dale lăsate. Întreabă când a fost refăcut ultima dată acoperișul, pentru că o înlocuire completă costă semnificativ. Cere evaluarea unui specialist pentru instalația electrică, obligatoriu la casele mai vechi. Confirmă racordurile la apă, canalizare, gaz și electricitate, inclusiv dacă este nevoie de trifazic. Verifică sistemul de încălzire și costul lunar real iarna — o casă neizolată se încălzește de câteva ori mai scump decât un apartament de aceeași suprafață utilă. Uită-te la starea străzii, la iluminatul public și, pentru zonele joase, la nivelul apei freatice. Consultanții CAMIMOB îți pun la dispoziție o rețea de avocați, evaluatori autorizați și ingineri constructori pentru o verificare tehnică înainte de antecontract.",
      },
    ],
    faq: [
      {
        q: "Se găsesc case cu curte în interiorul Buzăului?",
        a: "Da, iar Dorobanți 2 este una dintre puținele zone care le oferă. Avantajul față de o casă din comună: utilități urbane la poartă, drum asfaltat, transport în comun la câteva minute și școala în cartier. Compromisul: curți în general mai mici și preț pe metru pătrat mai mare.",
      },
      {
        q: "Ce școli sunt aproape de casele din Dorobanți 2?",
        a: "Școala Gimnazială Nr. 7, pe strada Privighetorilor, la granița cu Broșteni. Grădinița cu Program Prelungit Nr. 4 este în imediata vecinătate, iar Liceul Tehnologic „Henri Coandă” se află pe strada Horticolei. Verifică circumscripția exactă a adresei, pentru că granițele trec prin zonă.",
      },
      {
        q: "Cât costă întreținerea unei case în zonă?",
        a: "Depinde decisiv de izolație, de sursa de încălzire și de vechimea construcției. O casă neizolată se încălzește de câteva ori mai scump decât un apartament cu aceeași suprafață utilă. Cere vânzătorului facturile din lunile de iarnă înainte să faci o ofertă — este cea mai utilă informație pe care o poți obține.",
      },
      {
        q: "Găsesc și apartamente sau terenuri în Dorobanți 2?",
        a: "Da. Apartamentele au pagina lor dedicată pentru Dorobanți 2, iar terenurile apar pe pagina de terenuri de vânzare. Zona este una dintre puținele din oraș cu toate trei tipologiile.",
      },
    ],
    filter: {
      propertyType: "CASA",
      zoneNormalized: "dorobanti 2",
    },
    keepIndexableWhenEmpty: true,
  },
  {
    // Filtered on CASA, not APARTAMENT: the agency describes 23 August as a
    // district made up exclusively of courtyard homes, and "casă de vânzare"
    // is the query that matches it. The one apartment carrying this zone is
    // already covered by garsoniere-buzau.
    slug: "case-23-august-buzau",
    title: "Case de vânzare în zona 23 August, Buzău | CAMIMOB",
    description:
      "Case de vânzare în cartierul 23 August, Buzău. Cartier istoric de locuințe la curte în nord-vestul orașului, lângă Șoseaua Nordului și Transilvaniei. Oferte CAMIMOB.",
    h1: "Case de vânzare în zona 23 August, Buzău",
    breadcrumbLabel: "Case 23 August",
    intro:
      "23 August este un cartier istoric de case din partea de nord-vest a Buzăului, situat în spatele fabricii Romcarbon și delimitat parțial de Șoseaua Nordului, strada Transilvaniei și zona Bazalt / Fabrica de Bere. Este o zonă rezidențială liniștită, formată exclusiv din locuințe la curte, cu o dinamică total diferită de cea a nodului rutier ACR. Pe această pagină găsești casele active din portofoliul CAMIMOB în zona 23 August.",
    sections: [
      {
        heading: "Un cartier de case, nu de blocuri",
        body: "Ceea ce definește 23 August este că nu are blocuri. Este un țesut stradal de locuințe la curte, construit și consolidat în timp, în partea de nord-vest a orașului, în spatele fabricii Romcarbon. Delimitarea este dată parțial de Șoseaua Nordului, de strada Transilvaniei și de zona Bazalt / Fabrica de Bere. Dinamica este complet diferită de cea a nodului rutier ACR din apropiere: aici traficul este local, nu de tranzit, iar seara cartierul este liniștit. Pentru cumpărători, profilul este clar — cauți o casă cu curte, în oraș, la un preț mult mai mic decât în zonele rezidențiale de prestigiu, și accepți în schimb că nu ai comerț și servicii la fiecare colț. Este una dintre puținele zone din Buzău unde poți cumpăra o locuință la curte fără să ieși din oraș.",
      },
      {
        heading: "Școli și grădinițe în zonă",
        body: "Școala Gimnazială „Căpitan Aviator Mircea T. Bădulescu” — structura fostei Școli Nr. 16, respectiv unitățile din zona adiacentă a străzii Transilvaniei — este unitatea de învățământ gimnazial de stat cea mai apropiată, spre care gravitează copiii din acest cartier de case. Pentru preșcolari, Grădinița cu Program Normal Nr. 10, situată în zona adiacentă spre Bazalt și Fabrica de Bere, deservește direct familiile din nord-vestul orașului. Fiind un cartier de case, distanțele până la școală sunt mai mari decât într-un ansamblu de blocuri — merită să verifici concret traseul de la adresa care te interesează, mai ales dacă ai copii mici care ar urma să îl facă pe jos.",
      },
      {
        heading: "Spații verzi și promenadă",
        body: "Fiind un cartier exclusiv de case, zona nu are un parc public de mari dimensiuni în interiorul țesutului său stradal — localnicii beneficiază de curțile proprii și de zonele verzi din fața proprietăților, ceea ce este, de fapt, exact motivul pentru care cineva cumpără aici. Pentru promenadă, opțiunea majoră rămâne Parcul Crâng, accesibil în aproximativ 15-20 de minute de mers pe jos sau printr-o scurtă deplasare spre sud, fie peste calea ferată prin zona de trecere, fie ocolind prin Bulevardul Stadionului. Dacă îți place să alergi sau să mergi cu bicicleta, merită să testezi traseul înainte de a cumpăra, ca să vezi care variantă ți se potrivește.",
      },
      {
        heading: "Transport în comun",
        body: "Cartierul de case este deservit de stațiile perimetrice amplasate pe marile artere care îl înconjoară — în special stațiile Romcarbon și Bazalt de pe Șoseaua Nordului, sau cele de pe strada Transilvaniei. Linia 10 (Bazalt – Romcarbon – Crâng – Kaufland Sud – Gară) este linia principală pentru locuitorii din cartier: are stație chiar la Romcarbon / Șoseaua Nordului și leagă zona direct de centru și de gară. Linia 3 (Dedeman – Transilvaniei – Piața Centrală – Centrul de Recoltare) este utilă pentru cei care locuiesc mai aproape de ieșirea spre strada Transilvaniei. Liniile 5 și 5B fac traseul Micro 14 – Stadion – Romcarbon / Șoseaua Nordului – Horticolei. Traseul metropolitan 23 (Horticolei – Romcarbon / Bazalt – Vernești – Nișcov – Mierea – Grăjdana) tranzitează marginea cartierului în drumul spre comunele din nord-vest. Fiind stații perimetrice, distanța pe jos până la autobuz variază mult în funcție de stradă — verifică-o pentru adresa concretă.",
      },
      {
        heading: "Ce verifici la o casă în 23 August",
        body: "La o casă, lista de verificări este mult mai lungă decât la un apartament, iar într-un cartier istoric cu fond construit vechi devine esențială. Cere actele cadastrale și extrasul de carte funciară și confirmă că terenul și construcția sunt corect intabulate, fără diferențe între suprafața reală și cea din acte. Verifică fundația și structura — igrasie, fisuri, dale lăsate. Întreabă când a fost refăcut ultima dată acoperișul; o înlocuire completă costă mult. Cere evaluarea unui specialist pentru instalația electrică, obligatoriu la casele vechi. Confirmă racordurile la apă, canalizare, gaz și curent, inclusiv dacă e nevoie de trifazic. Uită-te la starea străzii și la iluminatul public. Și întreabă despre apa freatică și riscul de inundații, relevant în zonele joase. Consultanții CAMIMOB îți pun la dispoziție o rețea de specialiști — avocați, evaluatori autorizați, ingineri constructori — pentru o verificare tehnică înainte de antecontract.",
      },
    ],
    faq: [
      {
        q: "Zona 23 August are blocuri?",
        a: "Nu. Este un cartier istoric format exclusiv din locuințe la curte, în nord-vestul orașului, în spatele fabricii Romcarbon. Blocurile apar doar pe arterele perimetrice care îl delimitează.",
      },
      {
        q: "Ce școli sunt aproape de 23 August?",
        a: "Școala Gimnazială „Căpitan Aviator Mircea T. Bădulescu” — structura fostei Școli Nr. 16, respectiv unitățile din zona adiacentă a străzii Transilvaniei — este cea mai apropiată unitate gimnazială de stat. Pentru preșcolari, Grădinița cu Program Normal Nr. 10, spre Bazalt și Fabrica de Bere.",
      },
      {
        q: "Cât durează până în Parcul Crâng?",
        a: "Aproximativ 15-20 de minute de mers pe jos, fie peste calea ferată prin zona de trecere, fie ocolind prin Bulevardul Stadionului. Parcul Crâng este principala opțiune de promenadă pentru locuitorii cartierului.",
      },
      {
        q: "Ce linii de autobuz deservesc zona?",
        a: "Stații perimetrice pe arterele din jur: linia 10 (Bazalt – Romcarbon – Crâng – Kaufland Sud – Gară) este principala, cu stație la Romcarbon / Șoseaua Nordului. Se adaugă linia 3 prin Transilvaniei, liniile 5 și 5B, și traseul metropolitan 23 spre Vernești, Nișcov, Mierea și Grăjdana.",
      },
    ],
    filter: {
      propertyType: "CASA",
      zoneNormalized: "23 august",
    },
    keepIndexableWhenEmpty: true,
  },
  {
    slug: "apartamente-orizont-buzau",
    title: "Apartamente în Cartierul Orizont, Buzău | CAMIMOB",
    description:
      "Apartamente de vânzare și de închiriat în Cartierul Orizont, Buzău. Cel mai modern ansamblu rezidențial al orașului, grădiniță nouă în incintă, stația Orizont la intrare. Oferte CAMIMOB.",
    h1: "Apartamente în Cartierul Orizont, Buzău",
    breadcrumbLabel: "Apartamente Orizont",
    intro:
      "Cartierul Orizont este cel mai modern ansamblu rezidențial nou al Buzăului — vile și blocuri cu regim mic de înălțime — situat la ieșirea din oraș spre nord, în direcția Râmnicu Sărat și Focșani, în prelungirea zonei Unirii Nord. Fiind un cartier tânăr, dezvoltat de la zero, infrastructura este modernă, dar depinde parțial de facilitățile din zona imediat învecinată. Pe această pagină găsești apartamentele active din portofoliul CAMIMOB în Orizont, de vânzare și de închiriat.",
    sections: [
      {
        heading: "Un cartier construit de la zero",
        body: "Orizont este diferit de orice altă zonă din Buzău prin simplul fapt că a fost proiectat, nu acumulat în timp. Ansamblul este format din vile și blocuri cu regim mic de înălțime, cu trotuare largi, spații verzi proprii și o organizare care ține cont de pietoni — lucruri care într-un cartier construit în anii '70 lipsesc din start. Poziția este la ieșirea nordică a orașului, în direcția Râmnicu Sărat și Focșani, în prelungirea Unirii Nord. Pentru cumpărători, profilul este clar: finisaje și instalații noi, costuri de întreținere mici, vecini în general familii tinere, dar și dependență parțială de facilitățile din Unirii Nord pentru ce nu există încă în incintă. Este alegerea celor care preferă un apartament nou, bine izolat, într-un cartier curat, în loc de metri pătrați în plus într-un bloc vechi.",
      },
      {
        heading: "Școli și grădinițe",
        body: "Grădinița cu Program Prelungit Nr. 1 este o unitate de învățământ preșcolar de stat, modernă, construită recent chiar în incinta Cartierului Orizont, special pentru a deservi familiile tinere de aici. Este un avantaj rar pentru un ansamblu nou: de obicei grădinița vine mult după blocuri. Pentru nivelul gimnazial, Școala Gimnazială „George Emil Palade” — fosta Școală Nr. 15 — este unitatea la care sunt arondați copiii din cartier, situată la câteva minute distanță, spre Unirii Nord. Școala Gimnazială Nr. 11, puțin mai la sud-est, pe strada Teilor, este o altă opțiune majoră folosită de părinții din cartier și cea mai mare școală din județ. Pe scurt: grădinița este în incintă, școala la câteva minute.",
      },
      {
        heading: "Spații verzi și promenadă",
        body: "Cartierul a fost proiectat cu spații verzi proprii, trotuare largi și locuri de joacă moderne amenajate special pentru copiii rezidenților, ferite de traficul greu de pe drumul european — un detaliu important, având în vedere poziția la ieșirea din oraș. Pentru promenadă, de-a lungul bulevardului principal reabilitat există aliniamentul verde amenajat recent pe Șoseaua Nordului. Pentru o ieșire mai consistentă, Parcul Tineretului se află la o distanță relativ scurtă cu mașina sau bicicleta, coborând spre Broșteni, și oferă acces la lac, piste de role și terenuri de sport. Cartierul nu are un parc mare în interior, dar are ceea ce contează cel mai mult pentru familii cu copii mici: spațiu de joacă sigur, la câțiva metri de casă.",
      },
      {
        heading: "Transport în comun",
        body: "Orizont are avantajul de a fi situat chiar pe axa principală de transport nord-sud a orașului. Transportul este asigurat de stația principală Orizont, situată la intrarea în cartier, deservită de Trans Bus Buzău. Linia 1 (C.I.T. – BIG – RAM – Gara CFR – Dorobanți – Kaufland Sud) ajunge până în zona comercială din nord, chiar în proximitatea cartierului. Linia 2 (Sărata Monteoru / Gura Sărății – Autogara Marghiloman) tranzitează stația Orizont. Linia 22 (Gara CFR – Orizont – Fulga) asigură legătura directă între cartier și Gara CFR prin Bulevardul Unirii. Cel mai important: toate liniile metropolitane din nord — 23, 24, 25, 26, 27 și 28 — opresc obligatoriu în stația Orizont în drumul spre Mărăcineni, Săpoca sau Cernătești, ceea ce îți dă o frecvență excelentă a curselor către centrul orașului, în special spre stația RAM. Practic, chiar dacă ești la marginea orașului, ai mai multe autobuze pe oră decât în unele cartiere centrale.",
      },
      {
        heading: "Cum te ajută CAMIMOB în Orizont",
        body: "Într-un cartier nou, întrebările care contează sunt altele decât într-un bloc vechi: stadiul lucrărilor și al recepției, actele de proprietate și intabularea, ce intră exact în prețul anunțat, cum este organizată administrarea ansamblului și care sunt costurile lunare reale, dacă locul de parcare este inclus sau se cumpără separat, ce garanții oferă dezvoltatorul. Consultanții CAMIMOB verifică aceste aspecte înainte să-ți recomandăm o ofertă, și te asistăm la negociere, la evaluarea pentru bancă și la notar. Dacă ești proprietar în Orizont și vrei să vinzi sau să închiriezi, cartierul are cerere constantă din partea familiilor tinere — contactează-ne pentru o evaluare realistă.",
      },
    ],
    faq: [
      {
        q: "Ce fel de locuințe are Cartierul Orizont?",
        a: "Vile și blocuri cu regim mic de înălțime — este cel mai modern ansamblu rezidențial nou al Buzăului, dezvoltat de la zero, cu trotuare largi, spații verzi proprii și locuri de joacă proiectate pentru rezidenți.",
      },
      {
        q: "Există grădiniță în Cartierul Orizont?",
        a: "Da. Grădinița cu Program Prelungit Nr. 1 este o unitate de stat modernă, construită recent chiar în incinta cartierului. Pentru gimnaziu, copiii sunt arondați la Școala „George Emil Palade” (fosta Nr. 15), la câteva minute spre Unirii Nord; o altă opțiune folosită este Școala Nr. 11, pe strada Teilor.",
      },
      {
        q: "Cum ajung din Orizont în centru?",
        a: "Stația principală Orizont, la intrarea în cartier, este deservită de liniile 1, 2 și 22, plus toate liniile metropolitane din nord (23–28), care opresc obligatoriu aici. Frecvența este excelentă, iar linia 22 duce direct la Gara CFR prin Bulevardul Unirii.",
      },
      {
        q: "Cartierul Orizont are toate facilitățile?",
        a: "Infrastructura internă este modernă — grădiniță în incintă, spații verzi, locuri de joacă, trotuare largi — dar pentru comerț și servicii cartierul depinde parțial de zona imediat învecinată, Unirii Nord, aflată la câteva minute.",
      },
    ],
    filter: {
      propertyType: "APARTAMENT",
      zoneNormalized: "orizont",
    },
    keepIndexableWhenEmpty: true,
  },
  {
    slug: "apartamente-micro-5-buzau",
    title: "Apartamente în Micro 5, Buzău | CAMIMOB",
    description:
      "Apartamente de vânzare și de închiriat în Micro 5, Buzău. Capăt de linie Trans Bus, lângă centrele comerciale din sud și la câteva minute de Parcul Marghiloman. Oferte CAMIMOB.",
    h1: "Apartamente în cartierul Micro 5, Buzău",
    breadcrumbLabel: "Apartamente Micro 5",
    intro:
      "Micro 5 este o zonă rezidențială importantă din partea de sud-est a Buzăului, poziționată între cartierul Dorobanți, Bulevardul Unirii Sud și calea ferată, foarte aproape de marile centre comerciale din sudul orașului. Are chiar propriul capăt de linie în rețeaua Trans Bus. Pe această pagină găsești apartamentele active din portofoliul CAMIMOB în Micro 5, de vânzare și de închiriat.",
    sections: [
      {
        heading: "Despre cartierul Micro 5",
        body: "Micro 5 ocupă o poziție bine delimitată în sud-estul orașului: între cartierul Dorobanți, Bulevardul Unirii Sud și calea ferată. Proximitatea marilor centre comerciale din sudul Buzăului este avantajul cel mai evident — cumpărăturile săptămânale se fac fără drum lung și, de multe ori, fără mașină. Cartierul este dezvoltat sistematic, cu blocuri organizate în ansambluri și spații verzi interioare între ele. Apartamentele sunt predominant clasice, decomandate sau semidecomandate, cu tipologii de la garsoniere la 3 camere, la prețuri sub nivelul zonei centrale. Fiind delimitat de calea ferată, cartierul are o parte care nu este traversată de trafic de tranzit, ceea ce îl face mai liniștit decât sugerează apropierea de bulevard.",
      },
      {
        heading: "Școli și grădinițe în zonă",
        body: "Școala Gimnazială „Nicu Constantinescu” — fosta Școală Nr. 5 — este unitatea școlară principală la care sunt arondați copiii din Micro 5. Deși se află spre zona Unirii Sud, este școala de care aparține cartierul. Grădinița cu Program Normal Nr. 6 deservește preșcolarii din zonă, funcționând în proximitate și sub aceeași structură administrativă ca școala, ceea ce simplifică tranziția către clasa pregătitoare. Pentru nivelul liceal, Liceul Tehnologic „Henri Coandă”, situat la nord-est de cartier, pe strada Horticolei, este o opțiune accesibilă cu profiluri tehnologice. Ca întotdeauna, verifică circumscripția exactă a blocului care te interesează înainte de a semna.",
      },
      {
        heading: "Parcuri și spații verzi",
        body: "Cartierul dispune de zone verzi interioare și de spații de joacă destinate copiilor, reamenajate printre blocuri cu mobilier urban modern — părculețul din Micro 5 este punctul de referință pentru viața de zi cu zi a familiilor din zonă. Pentru ieșiri mai consistente, Parcul Marghiloman este cel mai mare parc din vecinătate, la câteva minute de mers spre est: un spațiu excelent pentru plimbări în jurul lacului cu nuferi și al Vilei Albatros, cu alei largi și un cadru istoric pe care puține parcuri din țară îl au. Combinația dintre loc de joacă sub fereastră și parc istoric la câteva minute este foarte practică pentru o familie cu copii.",
      },
      {
        heading: "Transport în comun: capăt de linie",
        body: "Micro 5 este un nod de tranzit esențial în rețeaua Trans Bus Buzău, având chiar o stație terminus importantă care îi poartă numele. Asta înseamnă autobuze care pleacă de la început de traseu — cu loc pe scaun și frecvență bună. Liniile 5 și 5B fac traseul Capăt Micro 5 – Spiru Haret – Micro 14, oferind o legătură directă și rapidă între sud-estul și vestul orașului. Linia 8 (Gară – Dorobanți – Broșteni – Spiru Haret – Stadion – Micro 14) tranzitează stațiile de la marginea cartierului și dă acces către Spitalul Județean. Linia 1 (C.I.T. – BIG – RAM – Gară – Dorobanți – Kaufland Sud) oprește în stațiile adiacente de pe strada Dorobanți, legând cartierul de marile zone comerciale. Liniile 6 și 6B fac traseul Gara CFR – Dorobanți – Micro 5 și continuă pe rute județene.",
      },
      {
        heading: "Cum te ajută CAMIMOB în Micro 5",
        body: "În Micro 5, doi factori schimbă sensibil valoarea unui apartament: distanța față de calea ferată și poziția față de Bulevardul Unirii Sud. Ambele influențează nivelul de zgomot, iar diferența se simte mai mult decât te-ai aștepta. Recomandăm vizionări la ore diferite ale zilei și o verificare atentă a tâmplăriei. Consultanții CAMIMOB cunosc blocurile din zonă, starea lor de reabilitare termică și prețurile la care s-au încheiat efectiv tranzacțiile. Verificăm actele, documentația asociației de proprietari și circumscripția școlară, și te asistăm la negociere, la evaluarea pentru bancă și la notar. Contactează-ne pentru o consultație gratuită și o listă personalizată cu ofertele din Micro 5.",
      },
    ],
    faq: [
      {
        q: "Ce școli sunt arondate cartierului Micro 5?",
        a: "Școala Gimnazială „Nicu Constantinescu” (fosta Nr. 5), spre zona Unirii Sud, este unitatea principală la care sunt arondați copiii din Micro 5. Grădinița cu Program Normal Nr. 6 funcționează în proximitate, sub aceeași structură administrativă. Liceul Tehnologic „Henri Coandă”, pe strada Horticolei, la nord-est, acoperă nivelul liceal tehnologic.",
      },
      {
        q: "Ce linii de autobuz pleacă din Micro 5?",
        a: "Micro 5 are propriul capăt de linie. Liniile 5 și 5B pornesc de aici spre Spiru Haret și Micro 14. Liniile 6 și 6B fac legătura Gara CFR – Dorobanți – Micro 5 și continuă pe rute județene. Linia 8 tranzitează stațiile de la marginea cartierului, cu acces la Spitalul Județean, iar linia 1 oprește în stațiile adiacente de pe strada Dorobanți.",
      },
      {
        q: "Cât de aproape sunt centrele comerciale?",
        a: "Foarte aproape — Micro 5 este poziționat lângă marile centre comerciale din sudul orașului, iar linia 1 leagă cartierul direct de BIG și Kaufland Sud. Este unul dintre principalele avantaje practice ale zonei.",
      },
      {
        q: "Este Micro 5 un cartier zgomotos?",
        a: "Depinde mult de poziția blocului. Cartierul este delimitat de Bulevardul Unirii Sud și de calea ferată, iar apartamentele apropiate de acestea sunt mai expuse. Partea interioară a cartierului, netraversată de trafic de tranzit, este liniștită. Recomandăm vizionări la ore diferite ale zilei.",
      },
    ],
    filter: {
      propertyType: "APARTAMENT",
      zoneNormalized: "micro 5",
    },
    keepIndexableWhenEmpty: true,
  },
  {
    slug: "case-orizont-buzau",
    title: "Case și vile în Cartierul Orizont, Buzău | CAMIMOB",
    description:
      "Case și vile de vânzare în Cartierul Orizont, Buzău. Cel mai modern ansamblu rezidențial al orașului, grădiniță în incintă, stația Orizont la intrare. Oferte CAMIMOB.",
    h1: "Case și vile în Cartierul Orizont, Buzău",
    breadcrumbLabel: "Case Orizont",
    intro:
      "Cartierul Orizont este cel mai modern ansamblu rezidențial nou al Buzăului, format din vile și blocuri cu regim mic de înălțime, situat la ieșirea din oraș spre nord, în direcția Râmnicu Sărat și Focșani, în prelungirea zonei Unirii Nord. Pe această pagină găsești casele și vilele active din portofoliul CAMIMOB în Orizont. Fiind un cartier tânăr, cu rotație lentă, ofertele apar rar — lasă-ne criteriile tale și te anunțăm când intră una.",
    sections: [
      {
        heading: "O vilă într-un cartier proiectat, nu acumulat",
        body: "Diferența dintre o vilă în Orizont și o casă într-un cartier vechi din Buzău nu stă doar în anul construcției. Orizont a fost proiectat ca ansamblu: trotuare largi, spații verzi proprii, locuri de joacă amenajate pentru copiii rezidenților, organizare care ține cont de pietoni și de parcare. Într-un cartier care s-a construit stradă cu stradă, de-a lungul deceniilor, aceste lucruri lipsesc din start. Pentru cumpărător, consecințele practice sunt concrete: finisaje și instalații noi, izolație făcută la standardele actuale, costuri de întreținere mici, vecini cu profil similar — în general familii tinere. Compromisul este poziția la marginea orașului și dependența parțială de facilitățile din Unirii Nord pentru comerț și servicii. În schimb, ai ceva ce în interiorul orașului nu mai găsești: o locuință nouă, cu curte, într-un cartier curat.",
      },
      {
        heading: "Școli și grădinițe",
        body: "Grădinița cu Program Prelungit Nr. 1 este o unitate de învățământ preșcolar de stat, modernă, construită recent chiar în incinta Cartierului Orizont, special pentru a deservi familiile tinere de aici. Este un avantaj rar pentru un ansamblu nou — de obicei grădinița vine mult după ce se vând locuințele. Pentru nivelul gimnazial, Școala Gimnazială „George Emil Palade” — fosta Școală Nr. 15 — este unitatea la care sunt arondați copiii din cartier, situată la câteva minute distanță, spre Unirii Nord. Școala Gimnazială Nr. 11, puțin mai la sud-est, pe strada Teilor, este o altă opțiune majoră folosită de părinții din cartier și cea mai mare școală din județ. Pe scurt: grădinița în incintă, școala la câteva minute, fără drum pe arterele aglomerate.",
      },
      {
        heading: "Spații verzi și promenadă",
        body: "La o vilă ai propria curte, dar spațiile comune contează în continuare — mai ales dacă ai copii. Cartierul a fost proiectat cu spații verzi proprii, trotuare largi și locuri de joacă moderne, ferite de traficul greu de pe drumul european, un detaliu important având în vedere poziția la ieșirea din oraș. Pentru promenadă, de-a lungul bulevardului principal reabilitat există aliniamentul verde amenajat recent pe Șoseaua Nordului. Pentru o ieșire mai consistentă, Parcul Tineretului se află la o distanță relativ scurtă cu mașina sau bicicleta, coborând spre Broșteni, și oferă acces la lac, piste de role și terenuri de sport.",
      },
      {
        heading: "Transport în comun",
        body: "Cartierul are avantajul de a fi situat chiar pe axa principală de transport nord-sud a orașului, iar stația principală Orizont se află la intrarea în cartier. Linia 1 (C.I.T. – BIG – RAM – Gara CFR – Dorobanți – Kaufland Sud) ajunge până în zona comercială din nord, în proximitatea cartierului. Linia 2 (Sărata Monteoru / Gura Sărății – Autogara Marghiloman) tranzitează stația Orizont. Linia 22 (Gara CFR – Orizont – Fulga) asigură legătura directă cu Gara CFR prin Bulevardul Unirii. Cel mai important: toate liniile metropolitane din nord — 23, 24, 25, 26, 27 și 28 — opresc obligatoriu în stația Orizont în drumul spre Mărăcineni, Săpoca sau Cernătești, ceea ce îți dă o frecvență excelentă a curselor către centru, în special spre stația RAM. Chiar dacă locuiești la marginea orașului, ai mai multe autobuze pe oră decât în unele cartiere centrale — un argument real dacă ai un adolescent care circulă singur.",
      },
      {
        heading: "Ce verifici la o casă în ansamblu nou",
        body: "Întrebările care contează la o vilă într-un cartier nou sunt complet diferite de cele pentru o casă veche. În loc de fundație, acoperiș și instalații la final de viață, întrebi despre: stadiul lucrărilor și recepția la terminarea lucrărilor; actele de proprietate și intabularea, inclusiv pentru teren; ce intră exact în prețul anunțat și ce se plătește separat — finisaje, bucătărie, amenajare curte, loc de parcare; cum este organizată administrarea ansamblului și care sunt costurile lunare reale; ce garanții oferă dezvoltatorul și pe ce durată; cum sunt rezolvate utilitățile și dacă racordurile sunt finalizate sau promise. Cere documentația tehnică și certificatul energetic. Consultanții CAMIMOB verifică aceste aspecte înainte să îți recomandăm o ofertă și te asistăm la negociere, la evaluarea pentru bancă și la notar.",
      },
    ],
    faq: [
      {
        q: "Ce fel de case are Cartierul Orizont?",
        a: "Vile și locuințe în ansamblu nou, alături de blocuri cu regim mic de înălțime. Cartierul a fost dezvoltat de la zero, cu trotuare largi, spații verzi proprii și locuri de joacă proiectate pentru rezidenți.",
      },
      {
        q: "Există grădiniță și școală pentru copiii din Orizont?",
        a: "Grădinița cu Program Prelungit Nr. 1 este construită recent chiar în incinta cartierului. Pentru gimnaziu, copiii sunt arondați la Școala „George Emil Palade” (fosta Nr. 15), la câteva minute spre Unirii Nord; o altă opțiune folosită este Școala Nr. 11, pe strada Teilor.",
      },
      {
        q: "De ce sunt puține oferte de case în Orizont?",
        a: "Este un cartier tânăr, cu număr limitat de locuințe și rotație lentă — proprietarii s-au mutat recent și vând rar. Lasă-ne criteriile tale prin formularul de contact și te anunțăm când intră o ofertă, de multe ori înainte de publicarea anunțului.",
      },
      {
        q: "Cum ajung din Orizont în centru fără mașină?",
        a: "Stația principală Orizont, la intrarea în cartier, este deservită de liniile 1, 2 și 22, plus toate liniile metropolitane din nord (23–28), care opresc obligatoriu aici. Frecvența este foarte bună, iar linia 22 duce direct la Gara CFR prin Bulevardul Unirii.",
      },
    ],
    filter: {
      propertyType: "CASA",
      zoneNormalized: "orizont",
    },
    keepIndexableWhenEmpty: true,
  },
  {
    // Commune pages: the stored value is the village, not the commune, so
    // these match on either (see SeoFilter.placeNormalizedAny).
    slug: "case-maracineni-buzau",
    title: "Case de vânzare în Mărăcineni, Buzău | CAMIMOB",
    description:
      "Case de vânzare în comuna Mărăcineni, județul Buzău, inclusiv satul Potoceni. Prima comună la nord de oraș, pe drumul spre Râmnicu Sărat. Oferte CAMIMOB.",
    h1: "Case de vânzare în Mărăcineni, Buzău",
    breadcrumbLabel: "Case Mărăcineni",
    intro:
      "Mărăcineni este prima comună la nord de Buzău, pe direcția Râmnicu Sărat, și cea mai căutată de buzoienii care vor o casă cu curte fără să renunțe la oraș. Pe această pagină găsești casele active din portofoliul CAMIMOB din comuna Mărăcineni, inclusiv din satul Potoceni. Distanța mică până în oraș și liniile metropolitane care leagă comuna de centru fac din Mărăcineni opțiunea cu cea mai scurtă navetă din tot județul.",
    sections: [
      {
        heading: "De ce Mărăcineni este prima opțiune pentru o casă la marginea Buzăului",
        body: "Argumentul este simplu și greu de combătut: este cea mai apropiată comună de oraș pe direcția nordică, iar naveta este de ordinul minutelor, nu al zecilor de minute. Pentru o familie care lucrează în Buzău dar vrea curte, grădină și liniște, Mărăcineni oferă compromisul cel mai echilibrat din județ. Obții suprafețe de teren de câteva ori mai mari decât ce ai primi în oraș la un buget comparabil, aer mai curat și un ritm de viață diferit, fără să-ți transformi fiecare zi de lucru într-o expediție. Satul Potoceni face parte din comună și are propriul caracter rezidențial, cu loturi generoase. Exact din cauza acestei cereri, prețurile din Mărăcineni sunt cele mai ridicate dintre comunele limitrofe — dar rămân mult sub nivelul unei case echivalente în interiorul municipiului.",
      },
      {
        heading: "Transport și legătura cu orașul",
        body: "Mărăcineni este deservită de liniile metropolitane Trans Bus care pornesc din Buzău — autobuzele care urcă pe Bulevardul Unirii Nord spre nord opresc în comună, iar frecvența este bună tocmai pentru că mai multe trasee o tranzitează în drumul lor spre Săpoca, Cernătești și celelalte localități din nord-estul județului. În oraș, aceste linii au stații în punctele cheie, inclusiv în zona centrală. Practic, chiar dacă nu ai mașină sau ai una singură în familie, legătura cu orașul este asigurată pentru școală, serviciu sau cumpărături. Pentru cine vine cu mașina, accesul se face pe artera principală spre Râmnicu Sărat, fără să traversezi orașul.",
      },
      {
        heading: "Ce verifici la o casă în comună",
        body: "La o casă de comună, verificările care contează cel mai mult sunt cele legate de acte și de utilități, nu de finisaje. Cere extrasul de carte funciară și documentația cadastrală și confirmă că atât terenul, cât și construcția sunt intabulate, cu suprafața măsurată — la proprietățile moștenite din mediul rural, diferențele față de acte sunt frecvente. Verifică obligatoriu categoria de folosință și dacă terenul este intravilan. Întreabă concret despre utilități: există racord la rețeaua de apă sau doar puț propriu? Canalizare la rețea sau fosă septică? Gaz la poartă sau încălzire pe lemne și peleți? Fiecare răspuns schimbă atât costul lunar, cât și valoarea de revânzare. Verifică drumul de acces — asfaltat, pietruit sau de pământ — și cum arată iarna. Și, foarte important pentru zona Buzăului, întreabă despre nivelul apei freatice și despre riscul de inundații. Consultanții CAMIMOB verifică toate acestea și lucrează cu avocați și topografi pentru cazurile care cer clarificări.",
      },
      {
        heading: "Cum te ajută CAMIMOB în Mărăcineni",
        body: "Tranzacțiile din mediul rural au particularități pe care o agenție urbană le ratează frecvent: moșteniri nefinalizate, succesiuni cu mai mulți proprietari, construcții fără autorizație care trebuie intrate în legalitate, diferențe între suprafața din acte și cea reală, drumuri de acces fără servitute constituită legal. Le cunoaștem și le verificăm înainte să îți recomandăm o proprietate. Te ajutăm cu vizionări organizate eficient — ceea ce contează mult când proprietățile sunt dispersate — cu negocierea, cu documentația notarială și, dacă este cazul, cu evaluarea pentru bancă. Dacă ai o casă de vânzare în Mărăcineni sau Potoceni, spune-ne: este cea mai căutată comună din jurul Buzăului, iar cererea depășește constant oferta.",
      },
    ],
    faq: [
      {
        q: "Cât de departe este Mărăcineni de Buzău?",
        a: "Este prima comună la nord de oraș, pe direcția Râmnicu Sărat — naveta se măsoară în minute. Exact această proximitate o face cea mai căutată comună din jurul Buzăului și explică de ce prețurile sunt mai ridicate decât în comunele mai îndepărtate.",
      },
      {
        q: "Satul Potoceni face parte din comuna Mărăcineni?",
        a: "Da, Potoceni aparține comunei Mărăcineni, iar ofertele din sat apar pe această pagină. Are caracter rezidențial, cu loturi generoase.",
      },
      {
        q: "Cum ajung din Mărăcineni în Buzău fără mașină?",
        a: "Comuna este deservită de liniile metropolitane Trans Bus care urcă pe Bulevardul Unirii Nord. Mai multe trasee o tranzitează în drumul spre Săpoca și Cernătești, deci frecvența este bună, iar în oraș aceste linii au stații în punctele cheie, inclusiv în zona centrală.",
      },
      {
        q: "Ce trebuie verificat în plus la o casă de comună?",
        a: "Intabularea terenului și a construcției, categoria de folosință și regimul intravilan, utilitățile (apă la rețea sau puț, canalizare sau fosă, gaz la poartă sau nu), drumul de acces și servitutea legală, plus nivelul apei freatice și riscul de inundații. Utilitățile sunt cheltuiala cel mai frecvent subestimată.",
      },
      {
        q: "Aveți și terenuri de vânzare în Mărăcineni?",
        a: "Da, terenurile din comuna Mărăcineni, inclusiv din Potoceni, au pagina lor dedicată. Dacă vrei să îți construiești casa în loc să cumperi una existentă, acolo găsești loturile active.",
      },
    ],
    filter: {
      propertyType: "CASA",
      placeNormalizedAny: ["maracineni", "potoceni"],
    },
    keepIndexableWhenEmpty: true,
  },
  {
    slug: "terenuri-maracineni-buzau",
    title: "Terenuri de vânzare în Mărăcineni, Buzău | CAMIMOB",
    description:
      "Terenuri de vânzare în comuna Mărăcineni, județul Buzău, inclusiv satul Potoceni. Prima comună la nord de oraș, cea mai scurtă navetă din județ. Oferte CAMIMOB.",
    h1: "Terenuri de vânzare în Mărăcineni, Buzău",
    breadcrumbLabel: "Terenuri Mărăcineni",
    intro:
      "Mărăcineni este prima comună la nord de Buzău, pe direcția Râmnicu Sărat, și cea mai căutată de buzoienii care vor să își construiască o casă fără să se îndepărteze de oraș. Pe această pagină găsești terenurile active din portofoliul CAMIMOB din comuna Mărăcineni, inclusiv din satul Potoceni. Dacă îți construiești prima casă, aici este zona cu cel mai bun raport între distanță, preț și posibilitatea reală de a construi.",
    sections: [
      {
        heading: "De ce Mărăcineni este cea mai căutată comună pentru construcție",
        body: "Motivul este unul singur și greu de combătut: este cea mai apropiată comună de Buzău pe direcția nordică, iar naveta se măsoară în minute. Pentru cine vrea să își construiască o casă dar lucrează în oraș, asta înseamnă că nu îți schimbi viața de zi cu zi — doar locuința. Obții un lot de câteva ori mai mare decât ce ai primi în interiorul municipiului la un buget comparabil, într-o comună cu infrastructură consolidată și cu transport în comun care funcționează. Satul Potoceni face parte din comună și are caracter rezidențial, cu loturi generoase. Exact din cauza acestei cereri, prețul pe metru pătrat în Mărăcineni este cel mai ridicat dintre comunele limitrofe Buzăului — dar rămâne o fracțiune din prețul unui teren echivalent în oraș, iar diferența o investești în construcție.",
      },
      {
        heading: "Intravilan sau extravilan: verifică înainte de orice",
        body: "Este prima întrebare, înaintea prețului și a suprafeței. Dacă intenția ta este să construiești o casă, terenul trebuie să fie obligatoriu intravilan. Terenul extravilan are de regulă categoria de folosință agricolă, iar construcția cere mai întâi scoaterea din circuitul agricol și schimbarea categoriei de folosință — o procedură care durează, costă și nu este garantată. Diferența de preț pe metru pătrat între cele două este de câteva ori, și tocmai de aici apar anunțurile care prezintă un extravilan ieftin ca pe o oportunitate de construcție. Cere din start extrasul de carte funciară și certificatul de urbanism: certificatul îți spune concret procentul de ocupare a terenului, coeficientul de utilizare, regimul maxim de înălțime și retragerile obligatorii — adică exact cât și cum poți construi pe lotul acela. Fără el, nu știi ce cumperi.",
      },
      {
        heading: "Utilități și acces: cheltuiala cel mai des subestimată",
        body: "Pentru un teren de construcție, costul racordării la utilități poate depăși diferența de preț față de un lot aparent mai scump cu branșamente la poartă. Întreabă concret, nu general: există racord la rețeaua de apă sau va trebui puț propriu? Canalizare la rețea sau fosă septică? La ce distanță este cea mai apropiată conductă de gaz? Branșamentul electric există, iar dacă da, ce putere suportă — ai nevoie de trifazic pentru ce intenționezi? Cere informații direct de la operatorii locali înainte să semnezi, nu după. La fel de important: drumul de acces. Trebuie să ai acces direct din drum public sau o servitute de trecere constituită legal și înscrisă în cartea funciară — nu o înțelegere verbală cu vecinul, care dispare odată cu vecinul. Verifică și starea drumului: asfaltat, pietruit sau de pământ, și cum arată iarna și după ploi.",
      },
      {
        heading: "Verificări specifice pentru un teren în comună",
        body: "Pe lângă regimul urbanistic și utilitățile, mai sunt câteva lucruri care în mediul rural cauzează cele mai multe blocaje. Intabularea: terenul trebuie înscris în cartea funciară, cu suprafața măsurată de un topograf, nu doar cu cea declarată — la terenurile moștenite, diferențele față de acte sunt frecvente și descoperite târziu. Succesiunea: dacă terenul vine din moștenire, verifică dacă este finalizată și dacă toți moștenitorii sunt de acord cu vânzarea. Regimul juridic: fără ipoteci, litigii sau servituți care te-ar împiedica să construiești unde vrei. Vecinătățile: ce se poate construi pe loturile alăturate, pentru că un lot liniștit astăzi poate avea o hală peste doi ani. Și, specific pentru zona Buzăului, nivelul apei freatice și riscul de inundații — informații care influențează direct tipul de fundație și costul ei.",
      },
      {
        heading: "Cum te ajută CAMIMOB la achiziția unui teren în Mărăcineni",
        body: "Greșelile la teren se descoperă cel mai târziu — de obicei abia la cererea autorizației de construire, când ai plătit deja. Verificăm, înainte să îți recomandăm un lot: extrasul de carte funciară actualizat, concordanța între suprafața măsurată și cea din acte, certificatul de urbanism și ce permite el efectiv, categoria de folosință și regimul intravilan, situația succesiunii, existența litigiilor sau servituților, accesul la drum public și situația reală a utilităților. Lucrăm cu avocați, topografi și evaluatori autorizați pentru cazurile care cer clarificări. Dacă ai un teren de vânzare în Mărăcineni sau Potoceni, contactează-ne: este comuna cu cea mai mare cerere din jurul Buzăului, iar loturile intravilane bine documentate se vând rapid.",
      },
    ],
    faq: [
      {
        q: "Satul Potoceni face parte din comuna Mărăcineni?",
        a: "Da, Potoceni aparține comunei Mărăcineni, iar terenurile din sat apar pe această pagină. Are caracter rezidențial, cu loturi generoase.",
      },
      {
        q: "Pot construi o casă pe orice teren din Mărăcineni?",
        a: "Nu. Terenul trebuie să fie intravilan, iar certificatul de urbanism îți spune concret ce și cât poți construi — procent de ocupare, coeficient de utilizare, regim de înălțime, retrageri obligatorii. Pe extravilan construcția cere mai întâi scoaterea din circuitul agricol, procedură care durează, costă și nu este garantată.",
      },
      {
        q: "De ce sunt terenurile din Mărăcineni mai scumpe decât în alte comune?",
        a: "Pentru că este cea mai apropiată comună de Buzău pe direcția nordică, iar naveta se măsoară în minute. Cererea este constant mai mare decât oferta. Prețul pe metru pătrat rămâne totuși o fracțiune din cel al unui teren echivalent în interiorul orașului.",
      },
      {
        q: "Ce mă costă racordarea la utilități?",
        a: "Depinde decisiv de distanța până la rețelele existente și de tipul utilității. Este cheltuiala cel mai frecvent subestimată și poate depăși diferența de preț față de un lot cu branșamente la poartă. Cere informații de la operatorii locali înainte de a semna.",
      },
      {
        q: "Căutați și case în Mărăcineni?",
        a: "Da, avem o pagină separată pentru casele de vânzare din comuna Mărăcineni, inclusiv din Potoceni. Dacă nu găsești acolo ce cauți, lasă-ne criteriile tale și te anunțăm când intră o ofertă.",
      },
    ],
    filter: {
      propertyType: "TEREN",
      placeNormalizedAny: ["maracineni", "potoceni"],
    },
    keepIndexableWhenEmpty: true,
  },
  {
    slug: "case-merei-buzau",
    title: "Case de vânzare în Merei, Buzău | CAMIMOB",
    description:
      "Case de vânzare în comuna Merei, județul Buzău, inclusiv satul Lipia. Zonă de dealuri și vii la sud-vest de oraș, pe drumul spre Sărata Monteoru. Oferte CAMIMOB.",
    h1: "Case de vânzare în Merei, Buzău",
    breadcrumbLabel: "Case Merei",
    intro:
      "Merei este o comună din județul Buzău situată la sud-vest de oraș, în zona de dealuri și vii, pe direcția Sărata Monteoru. Pe această pagină găsești casele active din portofoliul CAMIMOB din comuna Merei, inclusiv din satul Lipia. Este zona pentru cine caută o casă cu teren generos, într-un cadru natural, la o distanță rezonabilă de Buzău.",
    sections: [
      {
        heading: "Comuna Merei și satul Lipia",
        body: "Merei se află la sud-vest de Buzău, în zona de tranziție dintre câmpie și dealurile subcarpatice — o parte din comună este tradițional viticolă, ceea ce dă zonei un peisaj și un caracter diferite de comunele de câmpie din jurul orașului. Satul Lipia face parte din comună și concentrează o parte importantă a ofertei rezidențiale. Pentru cumpărători, profilul este clar: cauți o casă cu teren generos, într-un cadru natural, la un preț pe care în interiorul orașului nu l-ai găsi pentru nimic comparabil. Comuna este și punctul de acces spre Sărata Monteoru, stațiunea balneară cunoscută pentru apele sărate și nămolul terapeutic — un element care contează pentru unii cumpărători, fie din motive personale, fie ca potențial de închiriere sezonieră.",
      },
      {
        heading: "Transport și acces",
        body: "Legătura cu Buzăul se face pe direcția sud-vest, iar comuna este deservită de traseele Trans Bus care circulă spre Sărata Monteoru și Gura Sărății — linia 2 face acest traseu și ajunge în oraș până la Autogara Marghiloman, tranzitând zona centrală și stația RAM. Pentru cine merge cu mașina, distanța este mai mare decât la Mărăcineni, dar drumul este pe o arteră principală. Important de verificat concret pentru fiecare proprietate: distanța de la casă până la cea mai apropiată stație și starea drumului de la artera principală până la poartă — în comunele de deal, diferența dintre o stradă asfaltată și una pietruită se simte foarte mult iarna.",
      },
      {
        heading: "Ce verifici la o casă în Merei sau Lipia",
        body: "Cere extrasul de carte funciară și documentația cadastrală și confirmă că terenul și construcția sunt intabulate, cu suprafața măsurată, nu doar declarată — în mediul rural, la proprietățile moștenite, diferențele sunt frecvente. Verifică obligatoriu categoria de folosință a terenului și dacă este intravilan, mai ales dacă intenționezi să extinzi sau să construiești o anexă. Clarifică situația utilităților: apă la rețea sau puț propriu, canalizare sau fosă septică, gaz la poartă sau încălzire pe lemne. Pentru zona de deal, verifică suplimentar stabilitatea terenului și istoricul de alunecări în zonă — este o întrebare pe care puțini cumpărători o pun și care poate conta decisiv. Verifică drumul de acces și servitutea de trecere, constituită legal, nu pe bază de înțelegere verbală cu vecinii. Și cere evaluarea unui specialist pentru structură și instalația electrică la casele mai vechi.",
      },
      {
        heading: "Cum te ajută CAMIMOB în Merei",
        body: "În mediul rural, cele mai multe tranzacții se blochează din cauza actelor, nu a prețului: moșteniri nefinalizate, succesiuni cu mai mulți proprietari, construcții ridicate fără autorizație, suprafețe care nu corespund, drumuri de acces fără servitute legală. Verificăm aceste aspecte înainte să îți recomandăm o proprietate, și lucrăm cu avocați și topografi pentru cazurile care cer clarificări. Te ajutăm cu vizionări organizate eficient — esențial când proprietățile sunt dispersate pe mai multe sate — cu negocierea și cu toată documentația până la notar. Dacă ai o casă de vânzare în Merei sau Lipia, contactează-ne pentru o evaluare realistă: zonele de deal din jurul Buzăului au o cerere stabilă, mai ales din partea cumpărătorilor care caută a doua casă.",
      },
    ],
    faq: [
      {
        q: "Satul Lipia face parte din comuna Merei?",
        a: "Da, Lipia aparține comunei Merei, iar ofertele din sat apar pe această pagină. Lipia concentrează o parte importantă a ofertei rezidențiale din comună.",
      },
      {
        q: "Cât de departe este Merei de Buzău?",
        a: "Comuna se află la sud-vest de oraș, pe direcția Sărata Monteoru. Distanța este mai mare decât la Mărăcineni, dar drumul se face pe o arteră principală. Linia 2 Trans Bus deservește traseul spre Sărata Monteoru și Gura Sărății și ajunge în oraș până la Autogara Marghiloman.",
      },
      {
        q: "Ce verific în plus la o casă în zona de deal?",
        a: "Pe lângă verificările obișnuite pentru o casă de comună — intabulare, categorie de folosință, utilități, drum de acces cu servitute legală — în zona de deal merită să întrebi despre stabilitatea terenului și despre istoricul de alunecări în zonă. Este o întrebare pe care puțini cumpărători o pun.",
      },
    ],
    filter: {
      propertyType: "CASA",
      placeNormalizedAny: ["merei", "lipia"],
    },
    keepIndexableWhenEmpty: true,
  },
  {
    slug: "case-pietroasele-buzau",
    title: "Case de vânzare în Pietroasele, Buzău | CAMIMOB",
    description:
      "Case de vânzare în comuna Pietroasele, județul Buzău. Zonă viticolă istorică, la poalele dealurilor, celebră pentru tezaurul „Cloșca cu puii de aur”. Oferte CAMIMOB.",
    h1: "Case de vânzare în Pietroasele, Buzău",
    breadcrumbLabel: "Case Pietroasele",
    intro:
      "Pietroasele este una dintre cele mai cunoscute comune viticole ale județului Buzău, situată la poalele dealurilor, într-o zonă cu tradiție în cultura viței de vie și cu o istorie care o face celebră în toată România. Pe această pagină găsești casele active din portofoliul CAMIMOB din comuna Pietroasele, inclusiv din satele aparținătoare. Este zona pentru cine caută teren generos, peisaj de dealuri și un preț pe metru pătrat pe care nicio zonă urbană nu îl poate egala.",
    sections: [
      {
        heading: "Comuna Pietroasele: vie, dealuri și istorie",
        body: "Pietroasele este legată de două lucruri în memoria colectivă: via și tezaurul. Zona are o tradiție viticolă veche, cu plantații pe terasele dealurilor și cu o stație de cercetare viticolă recunoscută, iar numele comunei este cunoscut în toată România datorită tezaurului de la Pietroasa — „Cloșca cu puii de aur” — una dintre cele mai importante descoperiri arheologice din țară. Pentru un cumpărător, contextul contează practic, nu doar sentimental: zona are peisaj, are identitate și are un potențial turistic care susține pe termen lung valoarea proprietăților, în special pentru case cu teren care s-ar putea transforma într-o pensiune sau într-o a doua locuință. Prețurile rămân însă printre cele mai accesibile din județ pentru o casă cu curte mare.",
      },
      {
        heading: "Cui i se potrivește o casă în Pietroasele",
        body: "În primul rând celor care caută o a doua casă sau o casă de vacanță la o distanță rezonabilă de Buzău, cu teren suficient pentru grădină, livadă sau chiar câteva rânduri de viță. Apoi celor care vor să se mute definitiv din oraș și lucrează de acasă sau au program flexibil — naveta zilnică spre Buzău este posibilă, dar mai lungă decât din comunele limitrofe, așa că merită calculată realist. Și celor care iau în calcul un proiect: pensiune, agroturism, mică producție. Nu este zona potrivită pentru cine depinde de naveta zilnică cu transportul în comun sau are nevoie de acces rapid la spital și la școli urbane. Fii realist cu privire la acest punct înainte de a cumpăra — este cea mai frecventă cauză de regret la achizițiile din mediul rural îndepărtat.",
      },
      {
        heading: "Ce verifici la o casă în Pietroasele",
        body: "Verificările standard pentru mediul rural rămân esențiale: extras de carte funciară actualizat și documentație cadastrală, cu confirmarea că terenul și construcția sunt intabulate și că suprafața măsurată corespunde actelor; categoria de folosință și regimul intravilan; situația succesiunii, dacă proprietatea este moștenită. Pentru utilități, întrebările concrete sunt: apă la rețea sau puț propriu, canalizare sau fosă septică, gaz la poartă sau încălzire pe lemne, și dacă branșamentul electric suportă ce intenționezi să faci. Pentru zona de deal, verifică stabilitatea terenului și istoricul de alunecări. Dacă terenul include plantație de viță, clarifică starea plantației, vârsta ei și eventualele obligații sau subvenții asociate. Verifică drumul de acces, servitutea legală de trecere și cum arată drumul iarna. Consultanții CAMIMOB verifică aceste aspecte și lucrează cu avocați și topografi unde este nevoie.",
      },
      {
        heading: "Cum te ajută CAMIMOB în Pietroasele",
        body: "Proprietățile din mediul rural cer o verificare juridică mai atentă decât un apartament de oraș, iar în zonele viticole apar și particularități legate de terenul agricol și de plantații. Verificăm actele, situația succesiunii, concordanța suprafețelor și regimul juridic al terenului înainte să îți recomandăm o proprietate. Organizăm vizionările grupat, ca să nu faci mai multe drumuri, și îți spunem deschis ce este realist să aștepți de la o casă dintr-o comună aflată la această distanță de oraș. Te asistăm la negociere și la toată documentația notarială. Dacă ai o casă sau un teren de vânzare în Pietroasele, contactează-ne: zona are o cerere constantă din partea cumpărătorilor care caută a doua locuință sau un proiect turistic.",
      },
    ],
    faq: [
      {
        q: "De ce este cunoscută comuna Pietroasele?",
        a: "Pentru tradiția viticolă — plantații pe terasele dealurilor și o stație de cercetare viticolă recunoscută — și pentru tezaurul de la Pietroasa, „Cloșca cu puii de aur”, una dintre cele mai importante descoperiri arheologice din România.",
      },
      {
        q: "Se poate face naveta zilnică din Pietroasele la Buzău?",
        a: "Este posibil, dar distanța este mai mare decât din comunele limitrofe, iar transportul în comun este mai puțin frecvent. Calculează realist naveta înainte de a cumpăra — este cea mai frecventă cauză de regret la achizițiile din mediul rural mai îndepărtat.",
      },
      {
        q: "Ce verific dacă terenul include plantație de viță?",
        a: "Starea și vârsta plantației, suprafața efectivă plantată, categoria de folosință a terenului și eventualele obligații sau subvenții asociate. Cere documentele relevante înainte să faci o ofertă.",
      },
    ],
    filter: {
      propertyType: "CASA",
      placeNormalizedAny: ["pietroasele", "pietroasa", "saranga"],
    },
    keepIndexableWhenEmpty: true,
  },
  {
    slug: "case-magura-buzau",
    title: "Case de vânzare în Măgura, Buzău | CAMIMOB",
    description:
      "Case de vânzare în comuna Măgura, județul Buzău. Zonă de dealuri lângă Ciuta și Tabăra de Sculptură, la ieșirea spre Vernești și Valea Buzăului. Oferte CAMIMOB.",
    h1: "Case de vânzare în Măgura, Buzău",
    breadcrumbLabel: "Case Măgura",
    intro:
      "Măgura este o comună din județul Buzău situată în zona de dealuri, pe direcția Valea Buzăului, cunoscută pentru peisajul său și pentru Tabăra de Sculptură de la Măgura, una dintre cele mai mari expoziții de sculptură în aer liber din Europa. Pe această pagină găsești casele active din portofoliul CAMIMOB din comuna Măgura. Este zona pentru cine caută liniște, teren generos și un cadru natural remarcabil.",
    sections: [
      {
        heading: "Comuna Măgura și împrejurimile",
        body: "Măgura se află în zona de dealuri a județului Buzău, pe direcția Valea Buzăului, într-un peisaj care o face una dintre comunele cu cel mai mare potențial turistic din zonă. Tabăra de Sculptură de la Măgura, amenajată în anii '70 în apropierea Mănăstirii Ciolanu, adună sute de lucrări monumentale în aer liber și este un punct de atracție cunoscut în toată țara. Pentru un cumpărător, asta înseamnă două lucruri: un cadru de locuit cu adevărat deosebit și un potențial real de valorificare turistică, pentru cine se gândește la o pensiune sau la o casă de vacanță pe care o închiriază sezonier. Prețurile pentru case cu teren sunt mult sub nivelul urban, iar suprafețele de teren depășesc de obicei cu mult ce ai putea obține în oraș.",
      },
      {
        heading: "Cui i se potrivește",
        body: "Celor care caută o casă de vacanță sau o a doua locuință într-un cadru natural, la o distanță rezonabilă de Buzău. Celor care se mută definitiv și au program flexibil sau lucrează de acasă — naveta zilnică este posibilă cu mașina, dar nu o recomandăm ca soluție permanentă pentru un program fix de birou. Celor interesați de un proiect turistic, dată fiind apropierea de Tabăra de Sculptură și de Mănăstirea Ciolanu. Și celor care caută liniște reală, nu doar relativă: aici diferența față de oraș nu este de grad, este de natură. Nu este zona potrivită dacă depinzi de transportul în comun pentru naveta zilnică sau ai nevoie de acces rapid la spital și la școli urbane — fii realist cu aceste aspecte înainte de a semna.",
      },
      {
        heading: "Ce verifici la o casă în Măgura",
        body: "Verificările pentru mediul rural de deal se aplică integral. Extras de carte funciară actualizat și documentație cadastrală, cu confirmarea că terenul și construcția sunt intabulate și că suprafața măsurată corespunde actelor — la proprietățile moștenite diferențele sunt frecvente. Categoria de folosință și regimul intravilan, esențiale dacă vrei să extinzi sau să construiești. Situația succesiunii, dacă proprietatea vine din moștenire. Pentru utilități, întrebările sunt concrete: apă la rețea sau puț propriu, canalizare sau fosă septică, gaz la poartă sau încălzire pe lemne, și ce putere suportă branșamentul electric. Pentru zona de deal, verifică stabilitatea terenului și istoricul de alunecări — într-o comună cu relief, aceasta este verificarea cea mai importantă și cea mai des omisă. Verifică drumul de acces, servitutea legală de trecere și, foarte practic, cum se circulă iarna. Cere evaluarea unui specialist pentru structură și instalația electrică la casele mai vechi.",
      },
      {
        heading: "Cum te ajută CAMIMOB în Măgura",
        body: "Achizițiile din comunele de deal sunt cele în care verificarea juridică și cea tehnică contează cel mai mult, iar greșelile se descoperă cel mai târziu. Verificăm actele, succesiunea, concordanța suprafețelor, regimul juridic al terenului și accesul, și lucrăm cu avocați, topografi și ingineri constructori pentru cazurile care cer clarificări. Organizăm vizionările grupat, ca să nu faci drumuri repetate, și îți spunem deschis ce este realist să aștepți — inclusiv despre navetă și despre costurile de întreținere iarna, care într-o casă de deal neizolată pot surprinde neplăcut. Dacă ai o casă sau un teren de vânzare în Măgura, contactează-ne: zona are cerere din partea cumpărătorilor care caută casă de vacanță sau un proiect turistic.",
      },
    ],
    faq: [
      {
        q: "De ce este cunoscută comuna Măgura?",
        a: "Pentru Tabăra de Sculptură de la Măgura, amenajată în anii '70 în apropierea Mănăstirii Ciolanu — una dintre cele mai mari expoziții de sculptură în aer liber din Europa, cu sute de lucrări monumentale — și pentru peisajul de dealuri din zona Văii Buzăului.",
      },
      {
        q: "Se poate face naveta zilnică din Măgura la Buzău?",
        a: "Cu mașina este posibil, dar nu o recomandăm ca soluție permanentă pentru un program fix de birou. Transportul în comun este mai rar decât în comunele limitrofe orașului. Zona se potrivește mai bine celor cu program flexibil sau care lucrează de acasă.",
      },
      {
        q: "Ce verific în plus la o casă în zonă de deal?",
        a: "Stabilitatea terenului și istoricul de alunecări — într-o comună cu relief este verificarea cea mai importantă și cea mai des omisă. Apoi drumul de acces, servitutea legală de trecere și cum se circulă iarna. Plus verificările obișnuite: intabulare, categorie de folosință, utilități, succesiune.",
      },
    ],
    filter: {
      propertyType: "CASA",
      placeNormalizedAny: ["magura"],
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
  // Service pages have no filter, so there is no stock to be empty of —
  // `null` keeps them indexable, same as an unreachable database would.
  const count = config.filter
    ? await countSeoProperties(config.filter)
    : null;
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



