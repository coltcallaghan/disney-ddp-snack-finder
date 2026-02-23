// Utility to map a restaurant name from the CSV to a canonical location name using aliases
import aliases from '../restaurant_aliases.json';

export function getCanonicalLocationName(restaurantName: string) {
  if (!restaurantName) return null;
  const normalized = restaurantName.trim().toLowerCase();
  for (const [canonical, aliasList] of Object.entries(aliases)) {
    if (
      canonical.trim().toLowerCase() === normalized ||
      aliasList.some(alias => alias.trim().toLowerCase() === normalized)
    ) {
      return canonical;
    }
  }
  return null;
}
