import cityData from "src/data/tr-cities-districts.json";

function toTitleCase(value) {
  if (!value) return "";
  return value
    .toString()
    .split(" ")
    .map((part) => part.charAt(0).toLocaleUpperCase("tr-TR") + part.slice(1))
    .join(" ");
}

const normalizedCities = cityData.map((city) => ({
  key: city.name,
  name: toTitleCase(city.name),
  districts: (city.counties || []).map((district) => ({
    key: district,
    name: toTitleCase(district),
  })),
}));

export function getTurkishCities() {
  return normalizedCities;
}

export function getDistrictsByCity(cityName) {
  if (!cityName) return [];
  const lower = cityName.toLocaleLowerCase("tr-TR");
  const city = normalizedCities.find(
    (item) =>
      item.name.toLocaleLowerCase("tr-TR") === lower ||
      item.key.toLocaleLowerCase("tr-TR") === lower
  );
  return city?.districts || [];
}
