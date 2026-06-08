import { generateSeoName, applyZoneDiacritics, type SeoNameInput } from "./seoName";

export type SeoDescriptionInput = SeoNameInput & {
  price: number;
  currency?: string | null;
  rawDescription?: string | null;
};

function formatPrice(price: number, currency = "RON"): string {
  const cur = currency === "EUR" ? "EUR" : currency === "USD" ? "USD" : "RON";
  return new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency: cur,
    maximumFractionDigits: 0,
  }).format(price);
}

function pricePerSqm(price: number, surface: number, currency = "RON"): string {
  if (!surface) return "";
  const per = Math.round(price / surface);
  return formatPrice(per, currency);
}

export function generateSeoMetaDescription(input: SeoDescriptionInput): string {
  const seoName = generateSeoName(input);
  const priceStr = formatPrice(input.price, input.currency || "RON");
  const localityFixed = applyZoneDiacritics(input.locality || "Buzău");
  const pieces = [
    `${seoName}.`,
    `Preț: ${priceStr}.`,
    `Vizionare rapidă cu agenția BESTINVEST CAMIMOB ${localityFixed}.`,
  ];
  const full = pieces.join(" ");
  return full.length > 160 ? full.slice(0, 157) + "..." : full;
}

export function generateSeoIntro(input: SeoDescriptionInput): string {
  const seoName = generateSeoName(input);
  const priceStr = formatPrice(input.price, input.currency || "RON");
  const ppsm = pricePerSqm(input.price, input.surface, input.currency || "RON");
  const localityFixed = applyZoneDiacritics(input.locality || "Buzău");
  const operationLabel =
    input.operationType?.toUpperCase() === "VANZARE"
      ? "spre vânzare"
      : "spre închiriere";

  const ppsmPart = ppsm ? ` (${ppsm}/m²)` : "";

  return (
    `${seoName} prin agenția imobiliară BESTINVEST CAMIMOB ${localityFixed}. ` +
    `Această proprietate este oferită ${operationLabel} la prețul de ${priceStr}${ppsmPart}, ` +
    `cu acte verificate și asistență completă din partea echipei noastre, de la prima vizionare ` +
    `și până la semnarea actelor la notar.`
  );
}

export function combineSeoDescription(input: SeoDescriptionInput): string {
  const intro = generateSeoIntro(input);
  const raw = (input.rawDescription || "").trim();
  if (!raw) return intro;
  return `${intro}\n\n${raw}`;
}
