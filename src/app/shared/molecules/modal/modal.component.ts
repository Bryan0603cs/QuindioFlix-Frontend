import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'qf-modal',
  standalone: true,
  template: `
    @if (open) {
      <section class="overlay" (click)="closed.emit()">
        <article class="modal" (click)="$event.stopPropagation()">
          <header><h3>{{ titulo }}</h3><button type="button" (click)="closed.emit()">×</button></header>
          <ng-content />
        </article>
      </section>
    }
  `,
  styles: [`
    .overlay { position: fixed; inset: 0; z-index: 900; display: grid; place-items: center; padding: 20px; background: rgba(0,0,0,.62); backdrop-filter: blur(6px); }
    .modal { width: min(560px, 100%); border: 1px solid var(--qf-line); border-radius: 8px; background: var(--qf-surface); box-shadow: var(--qf-shadow); padding: 18px; }
    header { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 14px; }
    h3 { margin: 0; }
    button { border: 1px solid var(--qf-line); border-radius: 4px; background: var(--qf-black-3); color: var(--qf-text); width: 34px; height: 34px; }
  `]
})
export class ModalComponent {
  @Input() open = false;
  @Input() titulo = '';
  @Output() closed = new EventEmitter<void>();
}
