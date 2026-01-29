export function validateBartenderKey(key: string | null | undefined): boolean {
  const expectedKey = process.env.BARTENDER_DASH_KEY;

  if (!expectedKey) {
    console.error('BARTENDER_DASH_KEY environment variable is not set');
    return false;
  }

  return key === expectedKey;
}
