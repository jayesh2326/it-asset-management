export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function createId(prefix: string) {
  const random = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${random}`;
}

function createNumericSuffix(length = 4) {
  const base = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  return base.slice(-length).padStart(length, "0");
}

export function createEmployeeCode() {
  return `EMP-${createNumericSuffix(4)}`;
}

export function createAssetTag(category: string) {
  const prefixMap: Record<string, string> = {
    Laptop: "LAP",
    Desktop: "DSK",
    Monitor: "MON",
    Phone: "PHN",
    Tablet: "TAB",
    Printer: "PRN",
    Accessory: "ACC",
    Network: "NET"
  };

  return `${prefixMap[category] ?? "AST"}-${createNumericSuffix(4)}`;
}

export function createSerialNumber(brand = "AST") {
  const brandPrefix = brand.replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, 3) || "AST";
  return `${brandPrefix}-${createNumericSuffix(6)}`;
}

export function nowIso() {
  return new Date().toISOString();
}

export function titleCase(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "Not set";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  }).format(value);
}

export function safeJsonParse<T>(value: string | null, fallback: T) {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
