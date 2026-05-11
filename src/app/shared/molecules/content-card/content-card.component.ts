import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Contenido } from '../../../core/models/api.models';
import { initials, posterStyle } from '../../../core/utils/poster.util';
import { QfBadgeComponent } from '../../atoms/qf-badge/qf-badge.component';

@Component({
  selector: 'qf-content-card',
  standalone: true,
  imports: [RouterLink, QfBadgeComponent],
  template: `
    <article class="content-card">
      <a [routerLink]="['/catalogo', content.id]" class="poster" [style.background]="posterStyle(content)">
        <span>{{ initials(content.titulo) }}</span>
      </a>
      <div class="info">
        <div class="badges">
          <qf-badge tone="blue">{{ content.categoria }}</qf-badge>
          @if (content.originalQuindioflix) { <qf-badge tone="success">Original</qf-badge> }
        </div>
        <a [routerLink]="['/catalogo', content.id]" class="title">{{ content.titulo }}</a>
        <p>{{ content.sinopsis || 'Sinopsis no disponible.' }}</p>
        <div class="meta">
          <span>{{ content.anioLanzamiento }}</span>
          <span>{{ content.duracionMinutos }} min</span>
          <span>{{ content.clasificacionEdad }}</span>
        </div>
      </div>
    </article>
  `,
  styles: [`
    .content-card { border: 1px solid var(--qf-line); background: rgba(255,255,255,.045); border-radius: 24px; overflow: hidden; transition: .18s ease; }
    .content-card:hover { transform: translateY(-3px); border-color: rgba(16,23,217,.55); box-shadow: 0 24px 70px rgba(0,3,140,.22); }
    .poster { display: grid; place-items: center; height: 188px; position: relative; overflow: hidden; }
    .poster::after { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 20% 10%, rgba(255,255,255,.22), transparent 32%), linear-gradient(0deg, rgba(0,0,0,.65), transparent); }
    .poster span { position: relative; z-index: 1; font-size: 3rem; font-weight: 950; letter-spacing: -.08em; }
    .info { padding: 16px; }
    .badges, .meta { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
    .title { display: block; margin: 12px 0 8px; font-size: 1.05rem; font-weight: 900; letter-spacing: -.02em; }
    p { color: var(--qf-muted); margin: 0 0 14px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.45; }
    .meta { color: var(--qf-muted); font-size: .86rem; }
  `]
})
export class ContentCardComponent {
  @Input({ required: true }) content!: Contenido;
  @Output() favorite = new EventEmitter<Contenido>();
  posterStyle = posterStyle;
  initials = initials;
}
