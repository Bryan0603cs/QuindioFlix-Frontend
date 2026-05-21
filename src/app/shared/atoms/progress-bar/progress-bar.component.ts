import { Component, Input } from '@angular/core';

@Component({
  selector: 'qf-progress-bar',
  standalone: true,
  template: `<div class="wrap"><i [style.width.%]="safeValue"></i><span>{{ safeValue }}%</span></div>`,
  styles: [`
    .wrap { position: relative; height: 18px; border: 1px solid var(--qf-line); border-radius: 4px; background: var(--qf-black-3); overflow: hidden; min-width: 130px; }
    i { display: block; height: 100%; background: linear-gradient(90deg,var(--qf-blue),var(--qf-success)); }
    span { position: absolute; inset: 0; display: grid; place-items: center; font-family: "Space Mono", monospace; font-size: .65rem; font-weight: 700; color: var(--qf-text); }
  `]
})
export class ProgressBarComponent {
  @Input() porcentaje = 0;
  get safeValue(): number { return Math.max(0, Math.min(100, Math.round(Number(this.porcentaje || 0)))); }
}
