type City = { cityCode: string; cityName: string };
type District = { cityCode: string; districtName: string };

let cityCache: City[] | null = null;
let districtCache: District[] | null = null;

function cities(): City[] {
  if (cityCache) return cityCache;
  // Only the province JSON is included in this server route; neighbourhood/street
  // datasets from the package are intentionally not imported.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const rows = require("@halilertekin/turkey_province_image/cities.json");
  cityCache = Array.isArray(rows) ? rows : [];
  return cityCache;
}

function districts(): District[] {
  if (districtCache) return districtCache;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const rows = require("@halilertekin/turkey_province_image/districts.json");
  districtCache = Array.isArray(rows) ? rows : [];
  return districtCache;
}

function sameTr(a: string, b: string) {
  return String(a || "").localeCompare(String(b || ""), "tr", { sensitivity: "base" }) === 0;
}

function titleTr(value: string) {
  return String(value || "")
    .toLocaleLowerCase("tr")
    .replace(/(^|[\s-])([\p{L}])/gu, (_, lead: string, ch: string) => lead + ch.toLocaleUpperCase("tr"));
}

function cityForName(province: string): City | undefined {
  return cities().find((x) => sameTr(x.cityName, province));
}

export function provinces() {
  return cities().map((x) => titleTr(x.cityName)).sort((a, b) => a.localeCompare(b, "tr"));
}

export function districtsForProvince(province: string) {
  const city = cityForName(String(province || "").trim());
  if (!city) return [];
  return districts()
    .filter((x) => String(x.cityCode) === String(city.cityCode))
    .map((x) => titleTr(x.districtName))
    .sort((a, b) => a.localeCompare(b, "tr"));
}

export function isValidProvinceDistrict(province: string, district: string) {
  const city = cityForName(String(province || "").trim());
  if (!city) return false;
  return districts().some((x) => String(x.cityCode) === String(city.cityCode) && sameTr(x.districtName, String(district || "").trim()));
}
