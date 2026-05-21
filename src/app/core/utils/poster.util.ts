import { Contenido } from '../models/api.models';

const gradients = [
  'linear-gradient(135deg, #0d1020 0%, #1a2a5a 52%, #2a1a5a 100%)',
  'linear-gradient(135deg, #07101f 0%, #1a3040 48%, #4a1a80 100%)',
  'linear-gradient(135deg, #0b0d1a 0%, #1a2040 48%, #4a6fd4 100%)',
  'linear-gradient(135deg, #07080f 0%, #1a2f5a 48%, #9b6fd4 100%)'
];

export function posterStyle(content?: Partial<Contenido> | null): string {
  const id = content?.id ?? 0;
  return gradients[id % gradients.length];
}

export function initials(text?: string): string {
  return (text ?? 'QF')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase())
    .join('') || 'QF';
}

export function formatMoney(value: number | string | null | undefined): string {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount);
}
