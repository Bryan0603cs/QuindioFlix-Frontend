import { Component, Input } from '@angular/core';

@Component({
  selector: 'qf-card',
  standalone: true,
  template: `<section [class]="'card ' + tone"><ng-content /></section>`,
  styles: [`
    .card { background: var(--qf-surface); border: 1px solid var(--qf-line); border-radius: var(--qf-radius); padding: 20px; box-shadow: var(--qf-shadow); backdrop-filter: blur(16px); }
    .flat { box-shadow: none; background: var(--qf-surface-2); }
    .blue { background: linear-gradient(135deg, rgba(74,111,212,.2), rgba(155,111,212,.12) 45%, rgba(11,13,26,.96)); border-color: rgba(74,111,212,.45); }
  `]
})
export class QfCardComponent { @Input() tone: 'default' | 'flat' | 'blue' = 'default'; }
