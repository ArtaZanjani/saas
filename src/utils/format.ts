export const removeSpaces = (s: string) => s.replace(/\s+/g, "");

export const removeCommas = (n: string) => n.replace(/,/g, "");

export const addCommas = (n: string) => n.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export const formatPhone = (p: string) => {
  const c = removeSpaces(p);
  if (!c.startsWith("09") || c.length <= 4) return c;
  if (c.length <= 7) return `${c.slice(0, 4)} ${c.slice(4)}`;
  return `${c.slice(0, 4)} ${c.slice(4, 7)} ${c.slice(7, 11)}`;
};

export const formatCardNumber = (n: string) =>
  n
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(\d{4})/g, "$1 ")
    .trim();

export const formatIban = (n: string) =>
  n
    .replace(/\s/g, "")
    .toUpperCase()
    .replace(/(.{4})/g, "$1 ")
    .trim();

export const trimObject = <T extends Record<string, unknown>>(obj: T): T => {
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    result[k] = typeof v === "string" ? v.trim().replace(/\s+/g, " ") : v;
  }
  return result as T;
};
