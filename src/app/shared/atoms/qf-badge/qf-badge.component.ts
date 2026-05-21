import { Component, Input } from '@angular/core';

@Component({
  selector: 'qf-badge',
  standalone: true,
  template: `<span [class]="'badge ' + tone"><ng-content /></span>`,
  styles: [`
    .badge { display: inline-flex; align-items: center; gap: 6px; padding: 3px 8px; border-radius: 3px; font-family: "Space Mono", monospace; font-size: .66rem; font-weight: 700; letter-spacing: .06em; border: 1px solid var(--qf-line); background: rgba(74,111,212,.08); color: var(--qf-highlight); text-transform: uppercase; }
    .blue { background: #050d25; border-color: #1a2f5a; color: var(--qf-blue); }
    .success { background: #001a0a; border-color: #003a1f; color: var(--qf-success); }
    .warning { background: #150020; border-color: #300050; color: #d47aff; }
    .danger { background: #200010; border-color: #400020; color: #ff6ab0; }
  `]
})
export class QfBadgeComponent { @Input() tone: 'default' | 'blue' | 'success' | 'warning' | 'danger' = 'default'; }
