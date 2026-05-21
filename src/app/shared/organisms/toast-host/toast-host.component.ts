import { Component } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'qf-toast-host',
  standalone: true,
  template: `
    <section class="toast-wrap" aria-live="polite">
      @for (toast of toast.messages(); track toast.id) {
        <article class="toast" [class.success]="toast.type === 'success'" [class.error]="toast.type === 'error'" (click)="toastService.remove(toast.id)">
          {{ toast.text }}
        </article>
      }
    </section>
  `,
  styles: [`
    .toast-wrap { position: fixed; right: 18px; bottom: 18px; z-index: 1000; display: grid; gap: 10px; }
    .toast { max-width: 360px; padding: 14px 16px; border-radius: 8px; color: var(--qf-text); background: rgba(17,17,26,.92); border: 1px solid var(--qf-line); box-shadow: var(--qf-shadow); }
    .toast.success { border-color: rgba(34,197,94,.4); }
    .toast.error { border-color: rgba(239,68,68,.4); }
  `]
})
export class ToastHostComponent {
  toast = this.toastService;
  constructor(public toastService: ToastService) {}
}
