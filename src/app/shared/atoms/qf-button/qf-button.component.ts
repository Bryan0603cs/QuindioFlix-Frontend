import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'qf-button',
  standalone: true,
  template: `<button [type]="type" [disabled]="disabled" [class]="'btn ' + variant" (click)="clicked.emit($event)"><ng-content /></button>`,
  styles: [`
    .btn { border: 0; border-radius: 6px; min-height: 42px; padding: 10px 18px; color: white; font-weight: 600; transition: .2s ease; display: inline-flex; align-items: center; gap: 9px; justify-content: center; }
    .btn:disabled { opacity: .55; cursor: not-allowed; }
    .primary { background: var(--qf-gradient); box-shadow: 0 16px 36px rgba(74,111,212,.22); }
    .primary:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.12); }
    .ghost { background: rgba(74,111,212,.1); border: 1px solid rgba(74,111,212,.22); color: var(--qf-highlight); }
    .danger { background: rgba(255,74,141,.1); border: 1px solid rgba(255,74,141,.32); color: #ff9ec8; }
    .soft { background: transparent; border: 1px solid #2a3f7a; color: #7ba4ff; }
  `]
})
export class QfButtonComponent {
  @Input() variant: 'primary' | 'ghost' | 'danger' | 'soft' = 'primary';
  @Input() type: 'button' | 'submit' = 'button';
  @Input() disabled = false;
  @Output() clicked = new EventEmitter<Event>();
}
