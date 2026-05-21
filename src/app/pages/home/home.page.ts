import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { Categoria, Contenido, Reproduccion } from '../../core/models/api.models';
import { ContentCardComponent } from '../../shared/molecules/content-card/content-card.component';
import { QfBadgeComponent } from '../../shared/atoms/qf-badge/qf-badge.component';
import { QfButtonComponent } from '../../shared/atoms/qf-button/qf-button.component';
import { ProgressBarComponent } from '../../shared/atoms/progress-bar/progress-bar.component';

@Component({
  standalone: true,
  imports: [RouterLink, ContentCardComponent, QfBadgeComponent, QfButtonComponent, ProgressBarComponent],
  template: `
    <section class="qf-page">
      @if (loading()) {
        <div class="skeleton hero-skeleton"></div>
      } @else {
        @if (hero(); as item) {
          <section class="hero">
            <div>
              <div class="badges">
                <qf-badge tone="blue">{{ item.categoria }}</qf-badge>
                @if (item.originalQuindioflix) { <qf-badge tone="success">Original</qf-badge> }
              </div>
              <h2>{{ item.titulo }}</h2>
              <p>{{ item.sinopsis }}</p>
              <a [routerLink]="['/contenido', item.id]"><qf-button>Ver detalle</qf-button></a>
            </div>
          </section>
        }
      }

      <section class="rail-wrap">
        <h3>Tendencias</h3>
        <div class="rail">@for (item of tendencias(); track item.id) { <qf-content-card [content]="item" /> }</div>
      </section>

      <section class="rail-wrap">
        <h3>Originales QuindioFlix</h3>
        <div class="rail">@for (item of originales(); track item.id) { <qf-content-card [content]="item" /> }</div>
      </section>

      @if (continuar().length) {
        <section class="rail-wrap">
          <h3>Continuar viendo</h3>
          <div class="continue-rail">
            @for (item of continuar(); track item.reproduccion.id) {
              <article>
                <qf-content-card [content]="item.contenido" />
                <qf-progress-bar [porcentaje]="item.reproduccion.porcentajeAvance" />
              </article>
            }
          </div>
        </section>
      }

      @if (favoritos().length) {
        <section class="rail-wrap">
          <h3>Mis favoritos</h3>
          <div class="rail">@for (item of favoritos(); track item.id) { <qf-content-card [content]="item" /> }</div>
        </section>
      }

      @for (row of filasCategoria(); track row.categoria.id) {
        @if (row.contenidos.length) {
          <section class="rail-wrap">
            <h3>{{ row.categoria.nombre }}</h3>
            <div class="rail">@for (item of row.contenidos; track item.id) { <qf-content-card [content]="item" /> }</div>
          </section>
        }
      }
    </section>
  `,
  styles: [`
    .hero { min-height: 360px; display: flex; align-items: end; padding: 34px; border: 1px solid var(--qf-line); border-radius: 8px; background: linear-gradient(135deg, rgba(74,111,212,.28), rgba(0,0,0,.2)), var(--qf-black-3); }
    .hero h2 { margin: 12px 0; max-width: 760px; font-size: clamp(2.2rem, 6vw, 5rem); line-height: .95; }
    .hero p { max-width: 720px; color: var(--qf-muted); line-height: 1.65; }
    .badges { display: flex; gap: 8px; flex-wrap: wrap; }
    .rail-wrap { display: grid; gap: 12px; }
    h3 { margin: 0; }
    .rail, .continue-rail { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(230px, 280px); gap: 14px; overflow-x: auto; padding-bottom: 8px; }
    .continue-rail article { display: grid; gap: 10px; }
    .skeleton { border-radius: 8px; background: linear-gradient(90deg, rgba(255,255,255,.04), rgba(255,255,255,.08), rgba(255,255,255,.04)); }
    .hero-skeleton { min-height: 360px; }
  `]
})
export class HomePage implements OnInit {
  loading = signal(true);
  hero = signal<Contenido | null>(null);
  tendencias = signal<Contenido[]>([]);
  originales = signal<Contenido[]>([]);
  favoritos = signal<Contenido[]>([]);
  continuar = signal<Array<{ reproduccion: Reproduccion; contenido: Contenido }>>([]);
  filasCategoria = signal<Array<{ categoria: Categoria; contenidos: Contenido[] }>>([]);

  constructor(private data: DataService, private auth: AuthService) {}

  ngOnInit(): void {
    const perfil = this.auth.getPerfilActivo();
    forkJoin({
      categorias: this.data.categorias().pipe(catchError(() => of([] as Categoria[]))),
      catalogo: this.data.contenidos({ page: 0, size: 80, sort: 'popularidad,desc' }),
      favoritos: perfil ? this.data.favoritos(perfil.id, { page: 0, size: 24, sort: 'id,desc' }).pipe(catchError(() => of({ content: [] } as any))) : of({ content: [] } as any),
      reproducciones: perfil ? this.data.reproducciones({ perfilId: perfil.id, page: 0, size: 20, sort: 'fechaHoraInicio,desc' }).pipe(catchError(() => of({ content: [] } as any))) : of({ content: [] } as any)
    }).pipe(switchMap(({ categorias, catalogo, favoritos, reproducciones }) => {
      // Filtrar por regla de negocio (< 90%)
      const pendientes = reproducciones.content.filter((r: Reproduccion) => r.porcentajeAvance < 90).slice(0, 10);
      const requests = pendientes.map((r: Reproduccion) => this.data.contenido(r.contenidoId).pipe(catchError(() => of(null))));
      const contenidos$ = requests.length ? forkJoin(requests) : of([] as Contenido[]);
      return contenidos$.pipe(map((contenidos) => ({ categorias, catalogo, favoritos, pendientes, contenidos })));
    })).subscribe(({ categorias, catalogo, favoritos, pendientes, contenidos }) => {
      const all = catalogo.content;
      const continueContents = contenidos as Contenido[];

      this.hero.set(all[0] ?? null);
      this.tendencias.set(all);
      this.originales.set(all.filter(item => item.originalQuindioflix));
      this.favoritos.set(favoritos.content);

      // 1. Mapeamos la lista completa inicial uniendo reproducción con contenido
      const listaCompleta = pendientes.map((reproduccion: Reproduccion, index: number) => ({
        reproduccion,
        contenido: continueContents[index]
      })).filter((item: { reproduccion: Reproduccion; contenido: Contenido | undefined }) => !!item.contenido) as Array<{ reproduccion: Reproduccion; contenido: Contenido }>;

      // 2. ¡EL FILTRO MAGICO ANTIDUPLICADOS!
      // Creamos un Map donde la clave es el 'contenido.id'.
      // Al recorrer de atrás hacia adelante (con reverse), las entradas más viejas se escriben primero
      // y la versión más nueva (que está al principio de la lista) sobreescribe el duplicado al final.
      const mapaUnicos = new Map<number, { reproduccion: Reproduccion; contenido: Contenido }>();
      [...listaCompleta].reverse().forEach(item => {
        mapaUnicos.set(item.contenido.id, item);
      });

      // 3. Volvemos a convertir el Map a un array y le aplicamos el orden original (más nuevo primero)
      const listaLimpia = Array.from(mapaUnicos.values()).reverse();

      this.continuar.set(listaLimpia);
      this.filasCategoria.set(categorias.map(categoria => ({ categoria, contenidos: all.filter(item => item.categoriaId === categoria.id) })));
      this.loading.set(false);
    });
  }
}