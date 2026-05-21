import { Component, Input } from '@angular/core';
import { Plan } from '../../../core/models/api.models';
import { formatMoney } from '../../../core/utils/poster.util';
import { QfBadgeComponent } from '../../atoms/qf-badge/qf-badge.component';

@Component({
  selector: 'qf-plan-card',
  standalone: true,
  imports: [QfBadgeComponent],
  template: `
    <article [class.selected]="seleccionado" class="plan">
      <div class="head"><h3>{{ plan?.nombre }}</h3>@if (recomendado) { <qf-badge tone="success">Recomendado</qf-badge> }</div>
      <strong>{{ money(plan?.precioMensual) }}</strong>
      <p>{{ plan?.pantallasSimultaneas }} pantalla(s) · {{ plan?.maxPerfiles }} perfiles · {{ plan?.calidad }}</p>
    </article>
  `,
  styles: [`
    .plan { border: 1px solid var(--qf-line); border-radius: 8px; padding: 16px; background: var(--qf-black-3); min-height: 150px; }
    .selected { border-color: var(--qf-success); box-shadow: inset 0 0 0 1px rgba(0,255,159,.22); }
    .head { display: flex; justify-content: space-between; gap: 10px; align-items: start; }
    h3 { margin: 0; }
    strong { display: block; margin: 14px 0 8px; font-size: 1.5rem; }
    p { margin: 0; color: var(--qf-muted); }
  `]
})
export class PlanCardComponent {
  @Input() plan: Plan | null = null;
  @Input() seleccionado = false;
  @Input() recomendado = false;
  money = formatMoney;
}
