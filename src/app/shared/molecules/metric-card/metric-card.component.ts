import { Component, Input } from '@angular/core';
import { QfCardComponent } from '../../atoms/qf-card/qf-card.component';

@Component({
  selector: 'qf-metric-card',
  standalone: true,
  imports: [QfCardComponent],
  template: `
    <qf-card tone="flat">
      <p class="label">{{ label }}</p>
      <h3>{{ value }}</h3>
      <small>{{ hint }}</small>
    </qf-card>
  `,
  styles: [`
    .label { margin: 0 0 8px; color: var(--qf-muted); font-size: .86rem; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; }
    h3 { margin: 0; font-size: 2rem; }
    small { color: var(--qf-muted); }
  `]
})
export class MetricCardComponent {
  @Input() label = '';
  @Input() value: string | number = '';
  @Input() hint = '';
}
