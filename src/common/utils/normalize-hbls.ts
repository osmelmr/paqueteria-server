export function normalizeHbl(hbl: string): string {
  let normalized = hbl.trim();

  // Regla especial: ALB + 9 dígitos → ALB + últimos 5 dígitos
  const albMatch = normalized.match(/^ALB(\d{9})$/i);
  if (albMatch) {
    normalized = `ALB${albMatch[1].slice(4)}`;
  }

  normalized = normalized.replace(/^CM0?/i, '');
  normalized = normalized.replace(/AI$/i, '');
  normalized = normalized.replace(/BQ$/i, '');

  return normalized;
}
