import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, forkJoin, of, switchMap } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { Calificacion, Contenido, ContenidoRelacionado, Episodio, Reproduccion, Temporada } from '../../core/models/api.models';
import { initials, posterStyle } from '../../core/utils/poster.util';
import { ToastService } from '../../core/services/toast.service';
import { BadgeClasificacionComponent } from '../../shared/atoms/badge-clasificacion/badge-clasificacion.component';
import { QfBadgeComponent } from '../../shared/atoms/qf-badge/qf-badge.component';
import { QfButtonComponent } from '../../shared/atoms/qf-button/qf-button.component';
import { QfCardComponent } from '../../shared/atoms/qf-card/qf-card.component';
import { ProgressBarComponent } from '../../shared/atoms/progress-bar/progress-bar.component';
import { ModalComponent } from '../../shared/molecules/modal/modal.component';
import { StarRatingComponent } from '../../shared/molecules/star-rating/star-rating.component';

@Component({
  standalone: true,
  imports: [FormsModule, RouterLink, BadgeClasificacionComponent, QfBadgeComponent, QfButtonComponent, QfCardComponent, ProgressBarComponent, ModalComponent, StarRatingComponent],
  template: `
    @if (contenido(); as item) {
      <section class="detail">
        <div class="poster" [style.background]="posterStyle(item)"><span>{{ initials(item.titulo) }}</span></div>
        <div class="info">
          <div class="badges">
            <qf-badge tone="blue">{{ item.categoria }}</qf-badge>
            <qf-badge-clasificacion [clasificacion]="item.clasificacionEdad" />
            @if(item.originalQuindioflix){<qf-badge tone="success">Original</qf-badge>}
          </div>
          <h2>{{ item.titulo }}</h2>
          <p>{{ item.sinopsis }}</p>
          <div class="meta"><strong>{{ item.anioLanzamiento }}</strong><strong>{{ item.duracionMinutos }} min</strong><strong>{{ item.generos.join(', ') }}</strong></div>
          <div class="qf-actions">
            <qf-button [disabled]="auth.currentUser()?.estadoCuenta !== 'ACTIVO'" (clicked)="reproducir(item)">Reproducir</qf-button>
            <qf-button variant="soft" (clicked)="toggleFavorito(item)">{{ esFavorito() ? 'Quitar de mi lista' : 'Mi lista' }}</qf-button>
            <qf-button variant="danger" (clicked)="modalReporte.set(true)">Reportar</qf-button>
          </div>
          @if (auth.currentUser()?.estadoCuenta !== 'ACTIVO') { <div class="qf-error">Tu cuenta está inactiva. No puedes reproducir contenido.</div> }

          @if (temporadas().length) {
            <qf-card tone="flat">
              <h3>Temporadas y episodios</h3>
              <select [(ngModel)]="temporadaSeleccionadaId">
                @for (t of temporadas(); track t.id) { <option [ngValue]="t.id">Temporada {{ t.numeroTemporada }} · {{ t.titulo }}</option> }
              </select>
              <div class="episodes">
                @for (e of episodiosSeleccionados(); track e.id) {
                  <div><span>{{ e.numeroEpisodio }}. {{ e.titulo }}</span><qf-button variant="ghost" (clicked)="reproducir(item, e)">Reproducir</qf-button></div>
                }
              </div>
            </qf-card>
          }

          <qf-card tone="flat">
            <h3>Calificaciones</h3>
            <div class="rating-summary"><qf-star-rating [value]="promedio()" /> <span>{{ promedio() }} · {{ calificaciones().length }} reseñas</span></div>
            @for (c of ultimasResenas(); track c.id) {
              <article class="review">
                <qf-star-rating [value]="c.estrellas" />
                <p>{{ c.resena || 'Sin reseña escrita.' }}</p>
                <small style="color: var(--qf-muted-2);">{{ c.nombrePerfil }}</small>
              </article>
            }
            @if (yaCalifico()) {
              <div class="qf-badge" style="background: var(--qf-black-3); padding: 10px; border-radius: 8px; margin-top: 10px;">Ya has calificado este contenido.</div>
            } @else if (puedeCalificar()) {
              <div class="rate-form">
                <qf-star-rating [(value)]="estrellas" [editable]="true" />
                <textarea [(ngModel)]="resena" placeholder="Escribe tu reseña"></textarea>
                <qf-button variant="ghost" (clicked)="calificar(item)">Enviar calificación</qf-button>
              </div>
            } @else {
              <div class="qf-error" style="margin-top: 10px;">Para calificar debes tener una reproducción de este contenido con avance mínimo del 50%.</div>
            }
          </qf-card>

          @if (relacionados().length) {
            <qf-card tone="flat">
              <h3>Contenido relacionado</h3>
              <div class="related">@for (r of relacionados(); track r.id) { <a [routerLink]="['/contenido', r.contenidoDestinoId]"><qf-badge tone="blue">{{ r.tipoRelacion }}</qf-badge><span>{{ r.tituloDestino }}</span></a> }</div>
            </qf-card>
          }
        </div>
      </section>
    }

    <qf-modal [open]="modalReporte()" titulo="Reportar contenido" (closed)="modalReporte.set(false)">
      <div style="display: grid; gap: 15px; margin-top: 15px;">
        <label>Motivo del reporte</label>
        <select [(ngModel)]="motivoReporte">
          <option value="">-- Selecciona una opción --</option>
          <option value="Error de reproducción">Error de reproducción</option>
          <option value="Contenido inapropiado">Contenido inapropiado</option>
          <option value="Información incorrecta">Información incorrecta</option>
          <option value="Otro">Otro motivo</option>
        </select>
        <label>Detalles adicionales</label>
        <textarea [(ngModel)]="descripcionReporte" placeholder="Describe el problema"></textarea>
        <qf-button variant="danger" [disabled]="!motivoReporte || !descripcionReporte.trim()" (clicked)="reportar()">
          Confirmar reporte
        </qf-button>
      </div>
    </qf-modal>

    <qf-modal [open]="modalPlayer()" titulo="Reproduciendo" (closed)="cerrarPlayer()">
      @if (reproduccionActiva(); as actual) {
        <div class="player">
          <strong>{{ contenido()?.titulo }}</strong>
          <qf-progress-bar [porcentaje]="actual.porcentajeAvance" />
          <input type="range" min="1" max="100" step="1" [ngModel]="actual.porcentajeAvance" (ngModelChange)="actualizarAvanceLocal($event)" />
          <div class="qf-actions">
            <qf-button variant="ghost" (clicked)="guardarAvance(50)">Marcar 50%</qf-button>
            <qf-button (clicked)="guardarAvance(100)">Finalizar</qf-button>
          </div>
        </div>
      }
    </qf-modal>
  `,
  styles: [`
    .detail { display: grid; grid-template-columns: minmax(280px, 420px) 1fr; gap: 28px; align-items: start; }
    .poster { min-height: 600px; border-radius: 8px; display: grid; place-items: center; position: sticky; top: 24px; border: 1px solid var(--qf-line); overflow: hidden; box-shadow: var(--qf-shadow); }
    .poster span { font-size: 5.6rem; font-weight: 950; }
    .info { display: grid; gap: 18px; }
    .badges, .meta, .rating-summary { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
    h2 { margin: 0; font-size: clamp(2.4rem, 6vw, 5.2rem); line-height: .94; }
    p { color: var(--qf-muted); line-height: 1.8; font-size: 1.03rem; }
    select, textarea { width: 100%; border: 1px solid var(--qf-line); border-radius: 8px; padding: 13px 14px; color: var(--qf-text); background: var(--qf-black-3); outline: none; }
    textarea { min-height: 96px; resize: vertical; margin: 10px 0; }
    .episodes { display: grid; gap: 9px; margin-top: 12px; }
    .episodes div, .related a { display: flex; justify-content: space-between; align-items: center; gap: 12px; border-bottom: 1px solid var(--qf-line); padding: 10px 0; }
    .review { border-top: 1px solid var(--qf-line); padding-top: 12px; }
    .review p { margin: 6px 0; }
    .review small { color: var(--qf-muted-2); }
    .player { display: grid; gap: 14px; }
    .player input[type="range"] { width: 100%; accent-color: var(--qf-highlight); }
    @media (max-width: 980px) { .detail { grid-template-columns: 1fr; } .poster { min-height: 320px; position: relative; } }
  `]
})
export class ContentDetailPage implements OnInit {
  contenido = signal<Contenido | null>(null);
  temporadas = signal<Temporada[]>([]);
  relacionados = signal<ContenidoRelacionado[]>([]);
  calificaciones = signal<Calificacion[]>([]);
  reproducciones = signal<Reproduccion[]>([]);
  favoritoIds = signal<number[]>([]);
  modalReporte = signal(false);
  modalPlayer = signal(false);
  reproduccionActiva = signal<Reproduccion | null>(null);
  temporadaSeleccionadaId: number | null = null;
  estrellas = 5;
  resena = '';
  descripcionReporte = '';
  motivoReporte = '';
  posterStyle = posterStyle;
  initials = initials;

  constructor(private route: ActivatedRoute, private data: DataService, public auth: AuthService, private toast: ToastService) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(switchMap(params => {
      const id = Number(params.get('id'));
      const perfil = this.auth.getPerfilActivo();
      return forkJoin({
        contenido: this.data.contenido(id),
        temporadas: this.data.temporadas(id).pipe(catchError(() => of([] as Temporada[]))),
        relacionados: this.data.relacionados(id).pipe(catchError(() => of([] as ContenidoRelacionado[]))),
        calificaciones: this.data.calificaciones({ contenidoId: id }).pipe(catchError(() => of({ content: [] } as any))),
        favoritos: perfil ? this.data.favoritos(perfil.id, { page: 0, size: 100, sort: 'id,asc' }).pipe(catchError(() => of({ content: [] } as any))) : of({ content: [] } as any),
        reproducciones: perfil ? this.data.reproducciones({ perfilId: perfil.id, page: 0, size: 100, sort: 'fechaHoraInicio,desc' }).pipe(catchError(() => of({ content: [] } as any))) : of({ content: [] } as any)
      });
    })).subscribe(({ contenido, temporadas, relacionados, calificaciones, favoritos, reproducciones }) => {
      this.contenido.set(contenido);
      this.temporadas.set(temporadas);
      this.temporadaSeleccionadaId = temporadas[0]?.id ?? null;
      this.relacionados.set(relacionados);
      this.calificaciones.set(Array.isArray(calificaciones) ? calificaciones : calificaciones.content);
      this.favoritoIds.set(favoritos.content.map((item: Contenido) => item.id));
      this.reproducciones.set(reproducciones.content);
    });
  }

  episodiosSeleccionados(): Episodio[] {
    return this.temporadas().find(t => t.id === this.temporadaSeleccionadaId)?.episodios ?? [];
  }

  esFavorito(): boolean {
    const id = this.contenido()?.id;
    return !!id && this.favoritoIds().includes(id);
  }

  promedio(): number {
    const values = this.calificaciones();
    if (!values.length) return 0;
    return Math.round((values.reduce((sum, item) => sum + item.estrellas, 0) / values.length) * 10) / 10;
  }

  yaCalifico(): boolean {
    const perfil = this.auth.getPerfilActivo();
    return !!perfil && this.calificaciones().some(c => c.perfilId === perfil.id);
  }

  ultimasResenas(): Calificacion[] {
    const perfilActual = this.auth.getPerfilActivo();
    return [...this.calificaciones()]
        .sort((a, b) => b.fechaCalificacion.localeCompare(a.fechaCalificacion))
        .slice(0, 5)
        .map(c => ({
          ...c,
          nombrePerfil: (perfilActual && c.perfilId === perfilActual.id)
              ? ((c as any).email || c.nombrePerfil || 'Mi reseña')
              : 'Anónimo'
        }));
  }

  puedeCalificar(): boolean {
    const id = this.contenido()?.id;
    return !!id && !this.yaCalifico() && this.reproducciones().some(r => r.contenidoId === id && r.porcentajeAvance >= 50);
  }

  reproducir(item: Contenido, episodio?: Episodio): void {
    const perfil = this.auth.getPerfilActivo();
    if (!perfil) return this.toast.show('Selecciona un perfil', 'error');
    if (this.auth.currentUser()?.estadoCuenta !== 'ACTIVO') return this.toast.show('Cuenta inactiva', 'error');

    const reproduccionPrevia = this.reproducciones().find(r => r.contenidoId === item.id && r.episodioId === (episodio?.id ?? null));
    let avanceInicial = reproduccionPrevia ? (reproduccionPrevia.porcentajeAvance >= 90 ? 0 : reproduccionPrevia.porcentajeAvance) : 0;

    this.data.registrarReproduccion({
      perfilId: perfil.id,
      contenidoId: item.id,
      episodioId: episodio?.id ?? null,
      fechaHoraInicio: this.localDateTime(),
      dispositivo: 'COMPUTADOR',
      porcentajeAvance: avanceInicial
    }).subscribe({
      next: (reproduccion) => {
        this.reproduccionActiva.set(reproduccion);
        this.modalPlayer.set(true);
      },
      error: () => this.toast.show('Error al iniciar', 'error')
    });
  }

  actualizarAvanceLocal(value: number | string): void {
    const actual = this.reproduccionActiva();
    if (actual) this.reproduccionActiva.set({ ...actual, porcentajeAvance: Number(value) });
  }

  guardarAvance(porcentaje?: number): void {
    const actual = this.reproduccionActiva();
    if (!actual) return;
    this.data.actualizarAvance(actual.id, porcentaje ?? actual.porcentajeAvance).subscribe({
      next: updated => {
        this.reproduccionActiva.set(updated);
        if (updated.porcentajeAvance >= 100) this.modalPlayer.set(false);
      }
    });
  }

  cerrarPlayer(): void {
    const actual = this.reproduccionActiva();
    if (actual) this.guardarAvance();
    this.modalPlayer.set(false);
  }

  toggleFavorito(item: Contenido): void {
    const perfil = this.auth.getPerfilActivo();
    if (!perfil) return;
    const request = this.esFavorito() ? this.data.quitarFavorito(perfil.id, item.id) : this.data.agregarFavorito(perfil.id, item.id);
    request.subscribe(() => {
      this.favoritoIds.update(ids => ids.includes(item.id) ? ids.filter(id => id !== item.id) : [...ids, item.id]);
      this.toast.show('Lista actualizada', 'success');
    });
  }

  calificar(item: Contenido): void {
    const perfil = this.auth.getPerfilActivo();
    if (!perfil || !this.puedeCalificar()) return;
    this.data.calificar({ perfilId: perfil.id, contenidoId: item.id, estrellas: this.estrellas, resena: this.resena }).subscribe({
      next: c => { this.calificaciones.update(values => [c, ...values]); this.resena = ''; this.toast.show('Calificación enviada', 'success'); }
    });
  }

  reportar(): void {
    const item = this.contenido();
    if (!item || !this.motivoReporte || !this.descripcionReporte.trim()) return;
    const final = `Motivo: ${this.motivoReporte} | Detalle: ${this.descripcionReporte}`;
    this.data.crearReporte({ contenidoId: item.id, descripcion: final }).subscribe(() => {
      this.descripcionReporte = '';
      this.motivoReporte = '';
      this.modalReporte.set(false);
      this.toast.show('Reporte enviado', 'success');
    });
  }

  private localDateTime(): string {
    return new Date().toISOString().slice(0, 19);
  }
}