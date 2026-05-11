import { Component, Input } from '@angular/core';

@Component({
  selector: 'qf-card',
  standalone: true,
  template: `<section [class]="'card ' + tone"><ng-content /></section>`,
  styles: [`
    .card { background: var(--qf-surface); border: 1px solid var(--qf-line); border-radius: var(--qf-radius); padding: 20px; box-shadow: var(--qf-shadow); backdrop-filter: blur(16px); }
    .flat { box-shadow: none; background: var(--qf-surface-2); }
    .blue { background: linear-gradient(135deg, rgba(0,3,140,.45), rgba(17,17,26,.9)); }
  `]
})
export class QfCardComponent { @Input() tone: 'default' | 'flat' | 'blue' = 'default'; }
