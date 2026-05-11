import { Contenido } from '../models/api.models';

const gradients = [
  'linear-gradient(135deg, #00038C 0%, #0a0a0f 45%, #111827 100%)',
  'linear-gradient(135deg, #0f172a 0%, #00038C 55%, #000 100%)',
  'linear-gradient(135deg, #020617 0%, #1e1b4b 40%, #00038C 100%)',
  'linear-gradient(135deg, #111827 0%, #020617 50%, #1017d9 100%)'
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
