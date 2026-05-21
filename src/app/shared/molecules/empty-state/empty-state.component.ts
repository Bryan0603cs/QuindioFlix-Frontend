import { Component, Input } from '@angular/core';

@Component({
  selector: 'qf-empty-state',
  standalone: true,
  template: `<section class="empty"><strong>{{ title }}</strong><p>{{ description }}</p></section>`,
  styles: [`
    .empty { border: 1px dashed var(--qf-line); border-radius: 8px; padding: 30px; text-align: center; color: var(--qf-muted); background: rgba(255,255,255,.025); }
    strong { color: var(--qf-text); display: block; margin-bottom: 8px; }
    p { margin: 0; }
  `]
})
export class EmptyStateComponent {
  @Input() title = 'Sin resultados';
  @Input() description = 'No encontramos información para los filtros seleccionados.';
}
