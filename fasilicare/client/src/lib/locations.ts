export type SearchableLocation = { id: number; name: string; type: string };

export function filterLocations(locations: SearchableLocation[], query: string) {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return locations;
  return locations.filter(location => `${location.name} ${location.type}`.toLocaleLowerCase().includes(normalized));
}
