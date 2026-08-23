// Naira pricing with thousands separators, from integer kobo (Webflow §8,
// DATABASE_SCHEMA §3.1). Never derive money from a float.
export function formatNaira(amountKobo: number): string {
  const naira = amountKobo / 100;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: naira % 1 === 0 ? 0 : 2,
  }).format(naira);
}
