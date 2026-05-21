import { Component, Input } from '@angular/core';

@Component({
  selector: 'qf-badge-clasificacion',
  standalone: true,
  template: `<span [class]="tone">{{ label }}</span>`,
  styles: [`
    span { display: inline-flex; align-items: center; border-radius: 3px; padding: 3px 8px; border: 1px solid; font-family: "Space Mono", monospace; font-size: .68rem; font-weight: 700; }
    .tp { background:#001a0a;color:#00ff9f;border-color:#003a1f; }
    .r7 { background:#001020;color:#00d4ff;border-color:#002040; }
    .r13 { background:#0a0020;color:#a0b8ff;border-color:#1a0040; }
    .r16 { background:#150020;color:#d47aff;border-color:#300050; }
    .r18 { background:#200010;color:#ff6ab0;border-color:#400020; }
  `]
})
export class BadgeClasificacionComponent {
  @Input() clasificacion = 'TP';

  get label(): string {
    return (this.clasificacion || 'TP').replace('MAS_', '+');
  }

  get tone(): string {
    return this.label === 'TP' ? 'tp' : this.label === '+7' ? 'r7' : this.label === '+13' ? 'r13' : this.label === '+16' ? 'r16' : 'r18';
  }
}
