import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin, of, switchMap } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { Contenido, Perfil, Temporada } from '../../core/models/api.models';
import { initials, posterStyle } from '../../core/utils/poster.util';
import { ToastService } from '../../core/services/toast.service';
import { QfBadgeComponent } from '../../shared/atoms/qf-badge/qf-badge.component';
import { QfButtonComponent } from '../../shared/atoms/qf-button/qf-button.component';
import { QfCardComponent } from '../../shared/atoms/qf-card/qf-card.component';

@Component({
  standalone: true,
  imports: [FormsModule, QfBadgeComponent, QfButtonComponent, QfCardComponent],
  template: `
    @if (contenido(); as item) {
      <section class="detail">
        <div class="poster" [style.background]="posterStyle(item)"><span>{{ initials(item.titulo) }}</span></div>
        <div class="info">
          <div class="badges"><qf-badge tone="blue">{{ item.categoria }}</qf-badge><qf-badge>{{ item.clasificacionEdad }}</qf-badge>@if(item.originalQuindioflix){<qf-badge tone="success">Original</qf-badge>}</div>
          <h2>{{ item.titulo }}</h2>
          <p>{{ item.sinopsis }}</p>
          <div class="meta"><strong>{{ item.anioLanzamiento }}</strong><strong>{{ item.duracionMinutos }} min</strong><strong>Popularidad {{ item.popularidad }}</strong></div>
          <div class="qf-actions">
            <select [(ngModel)]="perfilId"><option [ngValue]="null">Selecciona perfil</option>@for (p of perfiles(); track p.id) { <option [ngValue]="p.id">{{ p.nombre }} - {{ p.tipoPerfil }}</option> }</select>
            <qf-button (clicked)="reproducir(item)">Registrar reproducción</qf-button>
            <qf-button variant="soft" (clicked)="favorito(item)">Favorito</qf-button>
          </div>
          <qf-card tone="flat">
            <h3>Calificar contenido</h3>
            <div class="qf-form-row"><select [(ngModel)]="estrellas"><option [ngValue]="1">1 estrella</option><option [ngValue]="2">2 estrellas</option><option [ngValue]="3">3 estrellas</option><option [ngValue]="4">4 estrellas</option><option [ngValue]="5">5 estrellas</option></select><input [(ngModel)]="resena" placeholder="Reseña opcional" /></div>
            <qf-button variant="ghost" (clicked)="calificar(item)">Enviar calificación</qf-button>
          </qf-card>
          <qf-card tone="flat">
            <h3>Reportar contenido</h3>
            <textarea [(ngModel)]="descripcionReporte" placeholder="Describe el problema"></textarea>
            <qf-button variant="danger" (clicked)="reportar(item)">Reportar</qf-button>
          </qf-card>
        </div>
      </section>
      @if (temporadas().length) {
        <section class="qf-page">
          <h3 class="qf-section-title">Temporadas y episodios</h3>
          @for (t of temporadas(); track t.id) {
            <qf-card tone="flat"><h3>T{{ t.numeroTemporada }} · {{ t.titulo }}</h3><div class="episodes">@for (e of t.episodios; track e.id) { <span>{{ e.numeroEpisodio }}. {{ e.titulo }}</span> }</div></qf-card>
          }
        </section>
      }
    }
  `,
  styles: [`
    .detail { display: grid; grid-template-columns: minmax(280px, 420px) 1fr; gap: 28px; align-items: start; }
    .poster { min-height: 600px; border-radius: 32px; display: grid; place-items: center; position: sticky; top: 24px; border: 1px solid var(--qf-line); overflow: hidden; }
    .poster span { font-size: 5.6rem; font-weight: 950; letter-spacing: -.08em; }
    .info { display: grid; gap: 18px; }
    .badges, .meta { display: flex; gap: 10px; flex-wrap: wrap; }
    h2 { margin: 0; font-size: clamp(2.4rem, 6vw, 5.2rem); line-height: .94; letter-spacing: -.08em; }
    p { color: var(--qf-muted); line-height: 1.8; font-size: 1.03rem; }
    select, input, textarea { width: 100%; border: 1px solid var(--qf-line); border-radius: 16px; padding: 13px 14px; color: var(--qf-text); background: #11111a; outline: none; }
    textarea { min-height: 96px; resize: vertical; margin-bottom: 12px; }
    .episodes { display: grid; gap: 9px; color: var(--qf-muted); }
    @media (max-width: 980px) { .detail { grid-template-columns: 1fr; } .poster { min-height: 320px; position: relative; } }
  `]
})
export class ContentDetailPage implements OnInit {
  contenido = signal<Contenido | null>(null);
  perfiles = signal<Perfil[]>([]);
  temporadas = signal<Temporada[]>([]);
  perfilId: number | null = null;
  estrellas = 5;
  resena = '';
  descripcionReporte = '';
  posterStyle = posterStyle;
  initials = initials;

  constructor(private route: ActivatedRoute, private data: DataService, private auth: AuthService, private toast: ToastService) {}
  ngOnInit(): void {
    this.route.paramMap.pipe(switchMap(params => {
      const id = Number(params.get('id'));
      const userId = this.auth.currentUser()?.id;
      return forkJoin({ contenido: this.data.contenido(id), perfiles: userId ? this.data.perfiles(userId) : of([]), temporadas: this.data.temporadas(id) });
    })).subscribe(({ contenido, perfiles, temporadas }) => { this.contenido.set(contenido); this.perfiles.set(perfiles); this.temporadas.set(temporadas); });
  }
  reproducir(item: Contenido): void {
    if (!this.perfilId) return this.toast.show('Selecciona un perfil', 'error');
    const now = new Date().toISOString().slice(0, 19);
    this.data.registrarReproduccion({ perfilId: this.perfilId, contenidoId: item.id, episodioId: null, fechaHoraInicio: now, fechaHoraFin: now, dispositivo: 'COMPUTADOR', porcentajeAvance: 80 })
      .subscribe({ next: () => this.toast.show('Reproducción registrada', 'success'), error: () => this.toast.show('No fue posible registrar reproducción', 'error') });
  }
  favorito(item: Contenido): void { if (!this.perfilId) return this.toast.show('Selecciona un perfil', 'error'); this.data.agregarFavorito(this.perfilId, item.id).subscribe({ next: () => this.toast.show('Agregado a favoritos', 'success'), error: () => this.toast.show('No fue posible agregar favorito', 'error') }); }
  calificar(item: Contenido): void { if (!this.perfilId) return this.toast.show('Selecciona un perfil', 'error'); this.data.calificar({ perfilId: this.perfilId, contenidoId: item.id, estrellas: this.estrellas, resena: this.resena }).subscribe({ next: () => this.toast.show('Calificación enviada', 'success'), error: () => this.toast.show('Primero registra una reproducción mayor al 50%', 'error') }); }
  reportar(item: Contenido): void { this.data.crearReporte({ contenidoId: item.id, descripcion: this.descripcionReporte || 'Reporte creado desde frontend' }).subscribe({ next: () => this.toast.show('Reporte enviado', 'success'), error: () => this.toast.show('No fue posible reportar', 'error') }); }
}
