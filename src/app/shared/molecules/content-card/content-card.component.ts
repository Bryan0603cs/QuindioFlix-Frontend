import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Contenido } from '../../../core/models/api.models';
import { initials, posterStyle } from '../../../core/utils/poster.util';
import { BadgeClasificacionComponent } from '../../atoms/badge-clasificacion/badge-clasificacion.component';
import { QfBadgeComponent } from '../../atoms/qf-badge/qf-badge.component';

@Component({
  selector: 'qf-content-card',
  standalone: true,
  imports: [RouterLink, QfBadgeComponent, BadgeClasificacionComponent],
  template: `
    <article [class.original]="content.originalQuindioflix" class="content-card">
      <a [routerLink]="['/contenido', content.id]" class="poster" [style.background]="posterStyle(content)">

        <span>{{ initials(content.titulo) }}</span>
        <qf-badge-clasificacion class="rating-wrap" [clasificacion]="content.clasificacionEdad" />
      </a>
      <div class="info">
        <div class="badges">
          <qf-badge tone="blue">{{ content.categoria }}</qf-badge>
          @if (content.originalQuindioflix) { <qf-badge tone="success">Original</qf-badge> }
        </div>
        <a [routerLink]="['/contenido', content.id]" class="title">{{ content.titulo }}</a>
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
    .content-card { border: 1px solid var(--qf-line); background: var(--qf-black-3); border-radius: 8px; overflow: hidden; transition: .3s ease; min-height: 100%; position: relative; }

    /* ¡AQUÍ ESTÁ TU DISEÑO CYBERPUNK MEJORADO PARA LOS ORIGINALES! */
    .content-card.original {
      border: 1px solid transparent;
      background-image: linear-gradient(var(--qf-black-3), var(--qf-black-3)),
      linear-gradient(135deg, #00f0ff, #7000ff);
      background-origin: border-box;
      background-clip: content-box, border-box;
      /* Sombra neón violeta/azul sutil en reposo */
      box-shadow: 0 0 12px rgba(0, 240, 255, 0.2);
    }

    /* Cuando el usuario pasa el mouse por encima de CUALQUIER tarjeta */
    .content-card:hover {
      transform: translateY(-5px);
      border-color: var(--qf-blue);
      box-shadow: 0 20px 40px rgba(74,111,212,.16);
    }

    /* ¡Efecto Hover potenciado si la tarjeta además es un ORIGINAL! */
    .content-card.original:hover {
      box-shadow: 0 0 20px rgba(0, 240, 255, 0.45),
      0 0 35px rgba(112, 0, 255, 0.25);
    }

    .poster { display: grid; place-items: center; height: 188px; position: relative; overflow: hidden; }
    .poster::after { content: ''; position: absolute; inset: 0; background: linear-gradient(0deg, rgba(7,8,15,.74), transparent 62%); }

    /* ¡Estilos de scan-line ELIMINADOS de aquí! */

    .poster span { position: relative; z-index: 1; font-size: 3rem; font-weight: 950; }
    .rating-wrap { position: absolute; left: 12px; bottom: 12px; z-index: 1; }
    .info { padding: 16px; }
    .badges, .meta { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
    .title { display: block; margin: 12px 0 8px; font-size: 1.05rem; font-weight: 900; }
    p { color: var(--qf-muted); margin: 0 0 14px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.45; }
    .meta { color: var(--qf-muted-2); font-family: "Space Mono", monospace; font-size: .72rem; }
  `]
})
export class ContentCardComponent {
  @Input({ required: true }) content!: Contenido;
  @Output() favorite = new EventEmitter<Contenido>();
  posterStyle = posterStyle;
  initials = initials;
}