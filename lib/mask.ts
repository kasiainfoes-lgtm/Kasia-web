export function maskSecret(value: string | null): string | null {
  if (!value) return null;
  if (value.length <= 8) return '••••••••';
  return `${value.slice(0, 6)}••••${value.slice(-4)}`;
}
