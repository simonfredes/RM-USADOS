export const VEHICLE_BRANDS = [
  "Abarth", "Alfa Romeo", "Audi", "BMW", "BYD", "Changan", "Chevrolet", "Chrysler",
  "Citroën", "Dodge", "Ferrari", "Fiat", "Ford", "Genesis", "GWM", "Honda", "Hyundai",
  "JAC", "Jaguar", "Jeep", "Kia", "Land Rover", "Lexus", "Maserati", "Mazda", "McLaren",
  "Mercedes-Benz", "MG", "MINI", "Mitsubishi", "Nissan", "Peugeot", "Porsche", "RAM",
  "Renault", "SEAT", "Škoda", "Smart", "Subaru", "Suzuki", "Tesla", "Toyota", "Volkswagen", "Volvo",
] as const;

const aliases: Record<string, string> = {
  mercedes: "Mercedes-Benz", "mercedes benz": "Mercedes-Benz", mercedesbenz: "Mercedes-Benz",
  citroen: "Citroën", mini: "MINI", bmw: "BMW", ram: "RAM", vw: "Volkswagen",
  landrover: "Land Rover", "land rover": "Land Rover", alfa: "Alfa Romeo",
};

function comparable(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function distance(first: string, second: string) {
  const a = comparable(first); const b = comparable(second);
  const row = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i++) {
    let previous = row[0]; row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const current = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = current;
    }
  }
  return row[b.length];
}

export function suggestBrands(value: string) {
  const query = comparable(value);
  if (!query) return [];
  return VEHICLE_BRANDS.filter((brand) => comparable(brand).includes(query)).slice(0, 6);
}

export function normalizeBrand(value: string) {
  const clean = value.trim().replace(/\s+/g, " ");
  if (!clean) return "";
  const key = comparable(clean);
  if (aliases[key]) return aliases[key];
  const exact = VEHICLE_BRANDS.find((brand) => comparable(brand) === key);
  if (exact) return exact;
  const closest = VEHICLE_BRANDS.map((brand) => ({ brand, distance: distance(clean, brand) })).sort((a, b) => a.distance - b.distance)[0];
  if (closest && closest.distance <= (key.length >= 8 ? 2 : 1)) return closest.brand;
  return clean.split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
}
