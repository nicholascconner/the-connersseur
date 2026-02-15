export interface DrinkOptionGroup {
  label: string;
  options: string[];
}

export const DRINK_OPTIONS: Record<string, DrinkOptionGroup[]> = {
  'martini': [
    { label: 'Alcohol', options: ['Gin', 'Vodka'] },
    { label: 'Level of Dirt', options: ['None', 'Some', 'Extra', 'Filthy'] },
    { label: 'Vermouth', options: ['Bone Dry', 'Spray', 'Standard', 'Wet'] },
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
  const parts = Object.values(selections).filter(v => v !== '');
  let result = parts.join(' | ');
  if (additionalNotes.trim()) {
    result = result ? `${result}\n${additionalNotes.trim()}` : additionalNotes.trim();
  }
  return result;
}
