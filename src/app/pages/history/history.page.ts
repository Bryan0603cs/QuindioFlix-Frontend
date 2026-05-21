import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { Contenido, Reproduccion } from '../../core/models/api.models';
import { ToastService } from '../../core/services/toast.service';
import { QfBadgeComponent } from '../../shared/atoms/qf-badge/qf-badge.component';
import { QfButtonComponent } from '../../shared/atoms/qf-button/qf-button.component';
import { ProgressBarComponent } from '../../shared/atoms/progress-bar/progress-bar.component';

@Component({
  standalone: true,
  imports: [CommonModule, QfBadgeComponent, QfButtonComponent, ProgressBarComponent],
  template: `
    <section class="qf-page">
      <div class="qf-page-header"><div><p class="qf-kicker">Actividad</p><h2>Historial</h2></div></div>

      @if (loading()) {
        <div class="skeleton"></div>
      } @else {
        @for (item of items(); track item.reproduccion.id) {
          <article class="history-row">
            <div>
              <h3>{{ item.contenido?.titulo || ('Contenido ' + item.reproduccion.contenidoId) }}</h3>
              @if (item.reproduccion.episodioId) { <p>Episodio #{{ item.reproduccion.episodioId }}</p> }
              <span>{{ deviceIcon(item.reproduccion.dispositivo) }} {{ item.reproduccion.dispositivo }} · {{ item.reproduccion.fechaHoraInicio | date:'short' }}</span>
            </div>
            <qf-progress-bar [porcentaje]="item.reproduccion.porcentajeAvance" />
            @if (item.reproduccion.porcentajeAvance >= 90) { <qf-badge tone="success">Completado</qf-badge> }
            <qf-button variant="ghost" (clicked)="continuar(item.reproduccion)">Continuar</qf-button>
          </article>
        } @empty {
          <p class="qf-muted">Aún no hay reproducciones para este perfil.</p>
        }
      }
    </section>
  `,
  styles: [`
    .history-row { display: grid; grid-template-columns: 1fr 180px auto auto; gap: 14px; align-items: center; border: 1px solid var(--qf-line); border-radius: 8px; padding: 16px; background: var(--qf-surface-2); }
    h3 { margin: 0 0 6px; }
    p, span { margin: 0; color: var(--qf-muted); }
    .skeleton { min-height: 300px; border-radius: 8px; background: rgba(255,255,255,.05); }
    @media(max-width:900px){ .history-row { grid-template-columns: 1fr; } }
  `]
})
export class HistoryPage implements OnInit {
  loading = signal(true);
  items = signal<Array<{ reproduccion: Reproduccion; contenido: Contenido | null }>>([]);

  constructor(private auth: AuthService, private data: DataService, private toast: ToastService, private router: Router) {}

  ngOnInit(): void {
    const perfil = this.auth.getPerfilActivo();
    if (!perfil) {
      this.loading.set(false);
      return;
    }
    this.data.reproducciones({ perfilId: perfil.id, page: 0, size: 50, sort: 'fechaHoraInicio,desc' }).pipe(switchMap(page => {
      const requests = page.content.map(reproduccion => this.data.contenido(reproduccion.contenidoId).pipe(catchError(() => of(null))));
      const contenidos$ = requests.length ? forkJoin(requests) : of([] as Contenido[]);
      return contenidos$.pipe(map(contenidos => ({ reproducciones: page.content, contenidos })));
    })).subscribe(({ reproducciones, contenidos }) => {
      this.items.set(reproducciones.map((reproduccion, index) => ({ reproduccion, contenido: contenidos[index] ?? null })));
      this.loading.set(false);
    }, () => {
      this.items.set([]);
      this.loading.set(false);
    });
  }

  deviceIcon(dispositivo: string): string {
    return dispositivo === 'TV' ? 'TV' : dispositivo === 'CELULAR' ? 'Móvil' : dispositivo === 'TABLET' ? 'Tablet' : 'PC';
  }

  continuar(reproduccion: Reproduccion): void {
    this.toast.show(`Continuando desde ${reproduccion.porcentajeAvance}%`, 'success');
    this.router.navigate(['/contenido', reproduccion.contenidoId], {
      queryParams: { continuar: reproduccion.id, avance: reproduccion.porcentajeAvance }
    });
  }
}
