import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'qf-button',
  standalone: true,
  template: `<button [type]="type" [disabled]="disabled" [class]="'btn ' + variant" (click)="clicked.emit($event)"><ng-content /></button>`,
  styles: [`
    .btn { border: 0; border-radius: 999px; padding: 11px 18px; color: white; font-weight: 800; letter-spacing: -.01em; transition: .18s ease; display: inline-flex; align-items: center; gap: 9px; justify-content: center; }
    .btn:disabled { opacity: .55; cursor: not-allowed; }
    .primary { background: linear-gradient(135deg, var(--qf-blue), var(--qf-blue-2)); box-shadow: 0 18px 40px rgba(0,3,140,.32); }
    .primary:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.12); }
    .ghost { background: rgba(255,255,255,.06); border: 1px solid var(--qf-line); }
    .danger { background: rgba(239,68,68,.16); border: 1px solid rgba(239,68,68,.35); color: #fecaca; }
    .soft { background: rgba(0,3,140,.2); border: 1px solid rgba(0,3,140,.42); }
  `]
})
export class QfButtonComponent {
  @Input() variant: 'primary' | 'ghost' | 'danger' | 'soft' = 'primary';
  @Input() type: 'button' | 'submit' = 'button';
  @Input() disabled = false;
  @Output() clicked = new EventEmitter<Event>();
}
