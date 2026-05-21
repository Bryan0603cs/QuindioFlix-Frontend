import { Component, Input } from '@angular/core';

@Component({
  selector: 'qf-perfil-avatar',
  standalone: true,
  template: `<span [class]="'avatar ' + (tipo === 'INFANTIL' ? 'kids' : 'adult')">{{ iniciales }}</span>`,
  styles: [`
    .avatar { width: 58px; height: 58px; border-radius: 8px; display: grid; place-items: center; border: 1px solid var(--qf-line); font-family: "Space Mono", monospace; font-weight: 700; font-size: 1.1rem; }
    .adult { background: linear-gradient(135deg,#11234d,#1d356e); color: var(--qf-highlight); }
    .kids { background: linear-gradient(135deg,#1f233d,#4b2f68); color: #f5c451; }
  `]
})
export class PerfilAvatarComponent {
  @Input() nombre = 'QF';
  @Input() tipo: 'ADULTO' | 'INFANTIL' = 'ADULTO';
  get iniciales(): string {
    return this.nombre.split(' ').filter(Boolean).slice(0, 2).map(word => word[0]?.toUpperCase()).join('') || 'QF';
  }
}
