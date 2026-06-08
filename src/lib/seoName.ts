export type SeoNameInput = {
  propertyType: string;
  operationType: string;
  rooms?: number | null;
  zone?: string | null;
  locality?: string | null;
  surface: number;
};

const ZONE_DIACRITICS: Record<string, string> = {
  buzau: "Buzău",
  brosteni: "Broșteni",
  dorobanti: "Dorobanți",
  "dorobanti 1": "Dorobanți 1",
  "dorobanti 2": "Dorobanți 2",
  magura: "Măgura",
  saranga: "Sărânga",
  maracineni: "Mărăcineni",
  pietroasele: "Pietroasele",
  lipia: "Lipia",
  merei: "Merei",
  potoceni: "Potoceni",
  centru: "Centru",
  crang: "Crâng",
  "nicolae balcescu": "Nicolae Bălcescu",
  unirii: "Unirii",
  "unirii sud": "Unirii Sud",
  "unirii nord": "Unirii Nord",
  "spiru haret": "Spiru Haret",
  "traian vuia": "Traian Vuia",
  "23 august": "23 August",
  "mall plaza": "Mall PLAZA",
  concas: "Concas",
};

function normalize(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
}

export function applyZoneDiacritics(zone: string): string {
  return zone
    .split(/[,.]\s*/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const key = normalize(part);
      return ZONE_DIACRITICS[key] || part;
    })
    .join(", ");
}

function describePropertyType(input: SeoNameInput): string {
  const t = input.propertyType?.toUpperCase();
  const rooms = input.rooms ?? 0;
  if (t === "APARTAMENT") {
    return rooms === 1 ? "Garsonieră" : "Apartament";
  }
  if (t === "CASA") return "Casă";
  if (t === "TEREN") return "Teren";
  if (t === "SPATIU_COMERCIAL") return "Spațiu comercial";
  return "Proprietate";
}

function describeRooms(input: SeoNameInput): string {
  const t = input.propertyType?.toUpperCase();
  if (t === "TEREN" || t === "SPATIU_COMERCIAL") return "";
  const rooms = input.rooms ?? 0;
  if (t === "APARTAMENT" && rooms === 1) return "";
  if (rooms > 0) return `${rooms} camere`;
  return "";
}

function describeOperation(input: SeoNameInput): string {
  return input.operationType?.toUpperCase() === "VANZARE"
    ? "de vânzare"
    : "de închiriat";
}

function describeLocation(input: SeoNameInput): string {
  const rawZone = (input.zone || "").trim();
  const locality = (input.locality || "").trim() || "Buzău";
  const fixedZone = rawZone ? applyZoneDiacritics(rawZone) : "";
  const fixedLocality = applyZoneDiacritics(locality);

  if (!fixedZone) return `în ${fixedLocality}`;

  const zoneNorm = normalize(fixedZone);
  const localityNorm = normalize(fixedLocality);
  if (zoneNorm === localityNorm) return `în ${fixedLocality}`;
  if (zoneNorm.includes(localityNorm)) return `în ${fixedZone}`;
  return `în ${fixedZone}, ${fixedLocality}`;
}

export function generateSeoName(input: SeoNameInput): string {
  const type = describePropertyType(input);
  const rooms = describeRooms(input);
  const operation = describeOperation(input);
  const location = describeLocation(input);
  const surface = `${Math.round(input.surface)} mp`;

  const parts = [type, rooms, operation, location].filter(Boolean);
  return `${parts.join(" ")} – ${surface}`;
}
