import { Component, Input } from '@angular/core';

@Component({
  selector: 'qf-badge',
  standalone: true,
  template: `<span [class]="'badge ' + tone"><ng-content /></span>`,
  styles: [`
    .badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 10px; border-radius: 999px; font-size: .78rem; font-weight: 800; border: 1px solid var(--qf-line); background: rgba(255,255,255,.06); color: var(--qf-text); }
    .blue { background: rgba(0,3,140,.25); border-color: rgba(0,3,140,.55); }
    .success { background: rgba(34,197,94,.15); border-color: rgba(34,197,94,.35); color: #bbf7d0; }
    .warning { background: rgba(245,158,11,.15); border-color: rgba(245,158,11,.35); color: #fde68a; }
    .danger { background: rgba(239,68,68,.15); border-color: rgba(239,68,68,.35); color: #fecaca; }
  `]
})
export class QfBadgeComponent { @Input() tone: 'default' | 'blue' | 'success' | 'warning' | 'danger' = 'default'; }
