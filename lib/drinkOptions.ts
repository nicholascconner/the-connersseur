export interface DrinkOptionGroup {
  label: string;
  options: string[];
}

export const DRINK_OPTIONS: Record<string, DrinkOptionGroup[]> = {
  'martini': [
    { label: 'Alcohol', options: ['Gin', 'Vodka'] },
    { label: 'Vermouth', options: ['Bone Dry', 'Spray', 'Standard', 'Wet'] },
    { label: 'Olive Juice', options: ['None', 'Some', 'Extra', 'Filthy'] },
    { label: 'Garnish', options: ['Garlic Olives', 'Blue Cheese Olives', 'Feta Olives', 'Regular Olives', 'Lemon Peel'] },
  ],
  'old fashioned': [
    { label: 'Liquor', options: ['Rye', 'Bourbon (oaky side)', 'Bourbon (vanilla side)'] },
  ],
};

export function getDrinkOptions(drinkName: string): DrinkOptionGroup[] | null {
  const key = drinkName.toLowerCase();
  return DRINK_OPTIONS[key] || null;
}

export function serializeDrinkOptions(
  selections: Record<string, string>,
  additionalNotes: string
): string {
  const parts = Object.entries(selections)
    .filter(([, v]) => v !== '')
    .map(([label, v]) => `${label}: ${v}`);
  let result = parts.join(' | ');
  if (additionalNotes.trim()) {
    result = result ? `${result}\n${additionalNotes.trim()}` : additionalNotes.trim();
  }
  return result;
}
