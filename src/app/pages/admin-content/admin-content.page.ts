import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { TemporadaService } from '../../core/services/temporada.service';
import { Categoria, Contenido, Empleado, Episodio, Genero, Temporada } from '../../core/models/api.models';
import { ToastService } from '../../core/services/toast.service';
import { QfCardComponent } from '../../shared/atoms/qf-card/qf-card.component';
import { QfButtonComponent } from '../../shared/atoms/qf-button/qf-button.component';
import { QfBadgeComponent } from '../../shared/atoms/qf-badge/qf-badge.component';
import { AdminUsersPage } from '../admin-users/admin-users.page';
import { AnalyticsPage } from '../analytics/analytics.page';

type AdminTab = 'catalogo' | 'usuarios' | 'reportes';

@Component({
  standalone: true,
  imports: [FormsModule, QfCardComponent, QfButtonComponent, QfBadgeComponent, AdminUsersPage, AnalyticsPage],
  template: `
    <section class="qf-page">
      <div class="tabs">
        <button [class.active]="tab() === 'catalogo'" (click)="tab.set('catalogo')">Catálogo</button>
        @if (auth.hasRole(['ADMIN'])) {
          <button [class.active]="tab() === 'usuarios'" (click)="tab.set('usuarios')">Usuarios</button>
          <button [class.active]="tab() === 'reportes'" (click)="tab.set('reportes')">Reportes</button>
        }
      </div>

      @if (tab() === 'catalogo') {

        <div class="qf-admin-grid">

          <qf-card>
            <div class="qf-page-header">
              <div>
                <p class="qf-kicker">Panel unificado</p>
                <h2>{{ editandoId() ? 'Editar contenido' : 'Crear contenido' }}</h2>
                <p class="qf-muted">Configura los datos principales del material multimedia.</p>
              </div>
              @if (editandoId()) { <qf-button variant="ghost" (clicked)="resetForm()">Nuevo</qf-button> }
            </div>

            <div class="qf-form-group">
              <label>Título del Contenido</label>
              <input [(ngModel)]="form.titulo" placeholder="Ej: Stranger Things o Batman"/>
            </div>

            <div class="qf-form-row">
              <div class="qf-form-group">
                <label>Año de Lanzamiento</label>
                <input [(ngModel)]="form.anioLanzamiento" type="number"/>
              </div>
              <div class="qf-form-group">
                <label>Clasificación de Edad</label>
                <select [(ngModel)]="form.clasificacionEdad">
                  <option>TP</option><option>MAS_7</option><option>MAS_13</option><option>MAS_16</option><option>MAS_18</option>
                </select>
              </div>
            </div>

            <div class="qf-form-row">
              <div class="qf-form-group">
                <label>Categoría</label>
                <select [(ngModel)]="form.categoriaId" (change)="onCategoriaChange()">
                  <option [ngValue]="0">Seleccione categoría...</option>
                  @for(c of categorias(); track c.id){
                    <option [ngValue]="c.id">{{ c.nombre }}</option>
                  }
                </select>
              </div>

              @if (!esSerieId(form.categoriaId)) {
                <div class="qf-form-group">
                  <label>Duración Total (Minutos)</label>
                  <input [(ngModel)]="form.duracionMinutos" type="number" placeholder="Minutos"/>
                </div>
              }
            </div>

            <div class="qf-form-group">
              <label>Empleado Responsable</label>
              <select [(ngModel)]="form.empleadoResponsableId">
                <option [ngValue]="0">Seleccione un empleado...</option>
                @for(e of empleados(); track e.id){
                  <option [ngValue]="e.id">{{ e.nombre }} - {{ e.departamento }}</option>
                }
              </select>
            </div>

            <div class="qf-form-group">
              <label>Sinopsis de la trama</label>
              <textarea [(ngModel)]="form.sinopsis" placeholder="Escribe un resumen atractivo..."></textarea>
            </div>

            <div class="qf-form-group">
              <label>Géneros asociados</label>
              <div class="checks">
                @for(g of generos(); track g.id){
                  <label>
                    <input type="checkbox" [checked]="form.generoIds.includes(g.id)" (change)="toggleGenero(g.id)"/>
                    {{ g.nombre }}
                  </label>
                }
              </div>
            </div>

            <label class="original">
              <input type="checkbox" [(ngModel)]="form.originalQuindioflix"/>
              Producción original QuindioFlix
            </label>

            <qf-button (clicked)="guardarContenido()">{{ editandoId() ? 'Guardar cambios' : 'Crear contenido' }}</qf-button>
          </qf-card>

          <div class="qf-side-panel">
            @if (contenidoTemporadas(); as contenido) {
              @if (esSerie(contenido)) {
                <qf-card>
                  <div class="qf-page-header">
                    <div>
                      <p class="qf-kicker">Estructura de la Serie</p>
                      <h2>{{ contenido.titulo }}</h2>
                    </div>
                    <qf-button variant="ghost" (clicked)="contenidoTemporadas.set(null)">Cerrar Gestor</qf-button>
                  </div>

                  <div class="qf-season-creator">
                    <p class="qf-info-badge">Siguiente temporada a crear: <strong>Temporada {{ temporadaForm.numeroTemporada }}</strong></p>
                    <div class="qf-form-row">
                      <div class="qf-form-group">
                        <label>Título de la Temporada</label>
                        <input [(ngModel)]="temporadaForm.titulo" placeholder="Ej: Inicio o El Regreso"/>
                      </div>
                      <div class="qf-form-group">
                        <label>Fecha de Estreno</label>
                        <input [(ngModel)]="temporadaForm.fechaLanzamiento" type="date"/>
                      </div>
                    </div>
                    <qf-button variant="soft" (clicked)="crearTemporada(contenido.id)">✨ Registrar Temporada</qf-button>
                  </div>

                  <div class="season-list">
                    @for (t of temporadas(); track t.id) {
                      <article class="season">
                        <header>
                          <div class="season-title-block">
                            <strong>Temporada {{ t.numeroTemporada }} · {{ t.titulo }}</strong>
                            <span class="date-badge">{{ t.fechaLanzamiento }}</span>
                          </div>
                          <button class="btn-delete-season" (click)="eliminarTemporada(contenido.id, t.id)" title="Eliminar temporada">❌ Borrar T{{ t.numeroTemporada }}</button>
                        </header>

                        <div class="episode-box-form">
                          <p class="form-sub-title">✏️ {{ episodioEditandoId[t.id] ? 'Modificar' : 'Añadir' }} Capítulo</p>

                          <div class="qf-form-row">
                            <div class="qf-form-group size-small">
                              <label>N° Capítulo</label>
                              <input [(ngModel)]="episodioForms[t.id].numeroEpisodio" type="number"/>
                            </div>
                            <div class="qf-form-group">
                              <label>Duración (Minutos)</label>
                              <input [(ngModel)]="episodioForms[t.id].duracionMinutos" type="number"/>
                            </div>
                          </div>

                          <div class="qf-form-group">
                            <label>Título del Episodio</label>
                            <input [(ngModel)]="episodioForms[t.id].titulo" placeholder="Nombre completo del capítulo o episodio"/>
                          </div>

                          <div class="qf-form-group">
                            <label>Sinopsis del Episodio</label>
                            <textarea [(ngModel)]="episodioForms[t.id].sinopsis" placeholder="¿Qué pasa en este capítulo?" class="textarea-caps"></textarea>
                          </div>

                          <div class="qf-form-actions-caps">
                            @if (episodioEditandoId[t.id]) {
                              <qf-button variant="soft" (clicked)="guardarEdicionEpisodio(contenido.id, t.id)">Guardar Capítulo</qf-button>
                              <button class="qf-btn-cancel-caps" (click)="cancelarEdicionEpisodio(t)">Cancelar</button>
                            } @else {
                              <qf-button variant="ghost" (clicked)="crearEpisodio(contenido.id, t.id)">+ Agregar Capítulo</qf-button>
                            }
                          </div>
                        </div>

                        <div class="episodes-container">
                          @for (e of t.episodios; track e.id) {
                            <div class="episode-row">
                              <div class="episode-info">
                                <p class="episode"><strong>Cap. {{ e.numeroEpisodio }}</strong>: {{ e.titulo }}</p>
                                <span class="duration-tag">{{ e.duracionMinutos }} min</span>
                              </div>
                              <div class="episode-actions">
                                <button class="btn-edit-inline" (click)="activarEditarEpisodio(t.id, e)">✏️ Editar</button>
                                <button class="btn-delete-inline" (click)="eliminarEpisodio(contenido.id, t.id, e.id)" title="Eliminar capítulo">🗑️</button>
                              </div>
                            </div>
                          }
                        </div>
                      </article>
                    } @empty {
                      <p class="qf-muted text-center" style="padding: 20px 0;">Esta serie aún no cuenta con temporadas registradas.</p>
                    }
                  </div>
                </qf-card>
              }
            } @else {
              <div class="qf-placeholder-card">
                <p>💡 Selecciona una <strong>Serie</strong> en la tabla de abajo y dale clic al botón <strong>"Temporadas"</strong> para gestionar sus capítulos y orden en este espacio de forma inmediata.</p>
              </div>
            }
          </div>
        </div>

        <qf-card tone="flat" style="margin-top: 24px;">
          <div class="qf-table-wrap">
            <table class="qf-table">
              <thead><tr><th>ID</th><th>Título</th><th>Categoría</th><th>Año</th><th>Popularidad</th><th>Acciones</th></tr></thead>
              <tbody>
                @for(c of contenidos(); track c.id){
                  <tr>
                    <td>{{ c.id }}</td>
                    <td><strong>{{ c.titulo }}</strong></td>
                    <td><qf-badge tone="blue">{{ c.categoria }}</qf-badge></td>
                    <td>{{ c.anioLanzamiento }}</td>
                    <td>{{ c.popularidad }}</td>
                    <td>
                      <div class="qf-actions">
                        <button (click)="editar(c)">Editar</button>
                        @if (esSerie(c)) {
                          <button (click)="gestionarTemporadas(c)">Temporadas</button>
                        }
                        <button class="danger" (click)="eliminar(c.id)">Eliminar</button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </qf-card>
      }

      @if (tab() === 'usuarios' && auth.hasRole(['ADMIN'])) { <app-admin-users /> }
      @if (tab() === 'reportes' && auth.hasRole(['ADMIN'])) { <app-analytics /> }
    </section>
  `,
  styles: [`
    .tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px}.tabs button{border:1px solid var(--qf-line);border-radius:999px;padding:8px 12px;color:var(--qf-muted);background:var(--qf-black-3);font-weight:800}.tabs button.active{color:var(--qf-highlight);border-color:var(--qf-blue)}
    h2{margin:0;font-size:1.8rem;color:var(--qf-text)}.qf-form-row{display:flex;gap:12px;margin-top:12px}
    .qf-form-group{display:flex;flex-direction:column;gap:6px;width:100%;margin-top:12px}
    .qf-form-group label{font-size:0.85rem;color:var(--qf-muted);font-weight:700;text-transform:uppercase;letter-spacing:0.5px}
    input,select,textarea,button{border:1px solid var(--qf-line);border-radius:8px;padding:12px 14px;color:var(--qf-text);background:var(--qf-black-3);outline:none} input,select,textarea{width:100%} textarea{min-height:90px}button{cursor:pointer} .danger{color:var(--qf-danger)}

    .qf-admin-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:start}
    @media(max-width:1100px){.qf-admin-grid{grid-template-columns:1fr}}

    .qf-placeholder-card{border:2px dashed var(--qf-line);border-radius:12px;padding:40px 24px;text-align:center;color:var(--qf-muted);background:rgba(255,255,255,0.01);font-size:1rem;line-height:1.6}

    .qf-info-badge{background:rgba(245,196,81,0.08);border:1px solid rgba(245,196,81,0.2);color:#f5c451;padding:10px 14px;border-radius:8px;font-size:0.9rem;margin:0}
    .qf-season-creator{display:flex;flex-direction:column;gap:12px;border-bottom:1px solid var(--qf-line);padding-bottom:16px;margin-top:12px}
    .season-list{display:flex;flex-direction:column;gap:16px;margin-top:16px;max-height:600px;overflow-y:auto;padding-right:4px}
    .season{border:1px solid var(--qf-line);border-radius:8px;padding:14px;background:rgba(255,255,255,.025)}
    .season header{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,0.05);padding-bottom:8px;gap:10px}
    .season-title-block{display:flex;align-items:center;gap:10px;color:var(--qf-text);font-size:1.05rem;flex-wrap:wrap}
    .date-badge{font-size:0.8rem;color:var(--qf-muted);background:rgba(255,255,255,0.04);padding:4px 8px;border-radius:4px}

    /* Botón Borrar Temporada */
    .btn-delete-season{background:rgba(235,94,85,0.1);border:1px solid rgba(235,94,85,0.2);color:var(--qf-danger);padding:4px 10px;font-size:0.8rem;border-radius:6px;font-weight:700;transition:all 0.2s}
    .btn-delete-season:hover{background:var(--qf-danger);color:white}

    /* Formulario de capítulos Cómodo y Amplio */
    .episode-box-form{background:rgba(255,255,255,0.02);border:1px solid var(--qf-line);border-radius:8px;padding:16px;margin:12px 0}
    .form-sub-title{margin:0 0 4px 0;font-size:0.85rem;font-weight:700;color:var(--qf-blue);text-transform:uppercase}
    .size-small{width:110px;flex:none}
    .textarea-caps{min-height:55px;margin-top:4px}
    .qf-form-actions-caps{margin-top:14px;display:flex;gap:10px}
    .qf-btn-cancel-caps{background:rgba(255,255,255,0.05);color:var(--qf-text);border:1px solid var(--qf-line);padding:8px 14px;border-radius:8px;font-weight:600}

    /* Lista de capítulos */
    .episodes-container{margin-top:12px;display:flex;flex-direction:column;gap:8px}
    .episode-row{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:rgba(0,0,0,0.15);border-radius:8px;border:1px solid rgba(255,255,255,0.02)}
    .episode-info{display:flex;flex-direction:column;gap:2px}
    .episode{margin:0;font-size:0.9rem;color:var(--qf-text)}
    .duration-tag{font-size:0.75rem;color:var(--qf-muted)}
    .episode-actions{display:flex;gap:4px;align-items:center}
    .btn-edit-inline{background:transparent;border:none;color:var(--qf-blue);font-size:0.85rem;padding:6px 10px}
    .btn-edit-inline:hover{text-decoration:underline}
    .btn-delete-inline{background:transparent;border:none;color:var(--qf-danger);font-size:0.9rem;padding:6px 10px;opacity:0.7;transition:opacity 0.2s}
    .btn-delete-inline:hover{opacity:1}

    /* Checkboxes estilo chips */
    .checks{display:flex;gap:8px;flex-wrap:wrap;margin-top:6px}
    .checks label{display:flex;align-items:center;gap:8px;border:1px solid var(--qf-line);border-radius:8px;padding:8px 14px;background:var(--qf-black-3);cursor:pointer;user-select:none;font-weight:600;font-size:0.85rem;transition:all 0.2s ease}
    .checks label:hover{border-color:rgba(245,196,81,0.4);background:rgba(245,196,81,0.02)}
    .checks label input[type="checkbox"]{display:none}
    .checks label:has(input:checked){border-color:#f5c451;background:rgba(245,196,81,0.1);color:#f5c451}
    .original{display:flex;align-items:center;gap:10px;margin:14px 0;color:var(--qf-muted);border:1px solid var(--qf-line);border-radius:8px;padding:12px 14px;background:var(--qf-black-3);cursor:pointer;font-weight:700;transition:all 0.2s ease}
    .original input[type="checkbox"]{accent-color:var(--qf-blue);width:18px;height:18px}
    .original:has(input:checked){border-color:var(--qf-blue);color:var(--qf-text);background:rgba(74,111,212,0.05)}
  `]
})
export class AdminContentPage implements OnInit {
  tab = signal<AdminTab>('catalogo');
  categorias = signal<Categoria[]>([]);
  generos = signal<Genero[]>([]);
  empleados = signal<Empleado[]>([]);
  contenidos = signal<Contenido[]>([]);
  temporadas = signal<Temporada[]>([]);
  contenidoTemporadas = signal<Contenido | null>(null);
  editandoId = signal<number | null>(null);
  form = this.emptyForm();

  temporadaForm = { numeroTemporada: 1, titulo: '', fechaLanzamiento: new Date().toISOString().slice(0, 10) };
  episodioForms: Record<number, { numeroEpisodio: number; titulo: string; duracionMinutos: number; sinopsis: string }> = {};
  episodioEditandoId: Record<number, number | null> = {};

  constructor(public auth: AuthService, private data: DataService, private temporadasSrv: TemporadaService, private toast: ToastService) {}

  ngOnInit(): void {
    forkJoin({
      categorias: this.data.categorias(),
      generos: this.data.generos(),
      empleados: this.data.empleados()
    }).subscribe(({ categorias, generos, empleados }) => {
      this.categorias.set(categorias);
      this.generos.set(generos);
      this.empleados.set(empleados.content);
    });
    this.cargar();
  }

  esSerie(contenido: Contenido | null): boolean {
    if (!contenido) return false;
    if (contenido.categoria) {
      return contenido.categoria.toUpperCase().includes('SERIE');
    }
    return this.esSerieId(contenido.categoriaId);
  }

  esSerieId(categoriaId: number): boolean {
    const catEncontrada = this.categorias().find(c => c.id === categoriaId);
    return catEncontrada ? catEncontrada.nombre.toUpperCase().includes('SERIE') : false;
  }

  onCategoriaChange(): void {
    if (this.esSerieId(this.form.categoriaId)) {
      this.form.duracionMinutos = 0;
    }
  }

  cargar(): void {
    this.data.contenidos({ page: 0, size: 50, sort: 'id,desc' }).subscribe(v => this.contenidos.set(v.content));
  }

  toggleGenero(id: number): void {
    this.form.generoIds = this.form.generoIds.includes(id) ? this.form.generoIds.filter(x => x !== id) : [...this.form.generoIds, id];
  }

  guardarContenido(): void {
    if (!this.form.categoriaId || !this.form.empleadoResponsableId || !this.form.titulo.trim()) {
      this.toast.show('Completa título, categoría y responsable.', 'error');
      return;
    }
    const id = this.editandoId();
    const request = id ? this.data.actualizarContenido(id, this.form as any) : this.data.crearContenido(this.form as any);
    request.subscribe({
      next: (res: any) => {
        this.toast.show(id ? 'Contenido actualizado' : 'Contenido creado', 'success');
        if (!id && this.esSerieId(this.form.categoriaId) && res?.id) {
          this.gestionarTemporadas(res);
        } else {
          this.resetForm();
        }
        this.cargar();
      },
      error: () => this.toast.show(id ? 'No fue posible actualizar' : 'No fue posible crear contenido', 'error')
    });
  }

  editar(contenido: Contenido): void {
    this.editandoId.set(contenido.id);
    this.form = {
      categoriaId: contenido.categoriaId,
      titulo: contenido.titulo,
      anioLanzamiento: contenido.anioLanzamiento,
      duracionMinutos: contenido.duracionMinutos,
      sinopsis: contenido.sinopsis,
      clasificacionEdad: contenido.clasificacionEdad,
      originalQuindioflix: contenido.originalQuindioflix,
      empleadoResponsableId: contenido.empleadoResponsableId,
      generoIds: this.generos().filter(g => contenido.generos.includes(g.nombre)).map(g => g.id)
    };
    scrollTo({ top: 0, behavior: 'smooth' });
  }

  resetForm(): void {
    this.editandoId.set(null);
    this.form = this.emptyForm();
  }

  eliminar(id: number): void {
    if (!confirm('¿Eliminar contenido?')) return;
    this.data.eliminarContenido(id).subscribe({ next: () => { this.toast.show('Contenido eliminado', 'success'); this.cargar(); }, error: () => this.toast.show('No fue posible eliminar', 'error') });
  }

  gestionarTemporadas(contenido: Contenido): void {
    this.contenidoTemporadas.set(contenido);
    this.cargarTemporadas(contenido.id);
    scrollTo({ top: 0, behavior: 'smooth' });
  }

  cargarTemporadas(contenidoId: number): void {
    this.temporadasSrv.getByContenido(contenidoId).subscribe(values => {
      this.temporadas.set(values);
      const maxTemporada = values.reduce((max, t) => Math.max(max, t.numeroTemporada), 0);
      this.temporadaForm.numeroTemporada = maxTemporada + 1;
      values.forEach(t => this.ensureEpisodeForm(t));
    });
  }

  crearTemporada(contenidoId: number): void {
    this.temporadasSrv.createTemporada(contenidoId, this.temporadaForm).subscribe({
      next: () => {
        this.toast.show('Temporada registrada', 'success');
        this.temporadaForm.titulo = '';
        this.cargarTemporadas(contenidoId);
      },
      error: () => this.toast.show('No fue posible crear temporada', 'error')
    });
  }

  /* ¡NUEVO! Función para borrar la temporada completa */
  eliminarTemporada(contenidoId: number, temporadaId: number): void {
    if (!confirm('¿Estás segura de eliminar esta temporada? Se borrarán también todos sus capítulos asociados en la base de datos.')) return;
    this.temporadasSrv.deleteTemporada(contenidoId, temporadaId).subscribe({
      next: () => {
        this.toast.show('Temporada eliminada correctamente', 'success');
        this.cargarTemporadas(contenidoId);
      },
      error: () => this.toast.show('No se pudo borrar la temporada', 'error')
    });
  }

  crearEpisodio(contenidoId: number, temporadaId: number): void {
    const payload = this.episodioForms[temporadaId];
    this.temporadasSrv.createEpisodio(contenidoId, temporadaId, payload).subscribe({
      next: () => {
        this.toast.show('Episodio creado', 'success');
        this.cargarTemporadas(contenidoId);
      },
      error: () => this.toast.show('No fue posible crear episodio', 'error')
    });
  }

  /* ¡NUEVO! Función para borrar un capítulo específico */
  eliminarEpisodio(contenidoId: number, temporadaId: number, episodioId: number): void {
    if (!confirm('¿Borrar este capítulo?')) return;
    this.temporadasSrv.deleteEpisodio(contenidoId, temporadaId, episodioId).subscribe({
      next: () => {
        this.toast.show('Capítulo eliminado', 'success');
        this.cargarTemporadas(contenidoId);
      },
      error: () => this.toast.show('No se pudo borrar el capítulo', 'error')
    });
  }

  activarEditarEpisodio(temporadaId: number, episodio: Episodio): void {
    this.episodioEditandoId[temporadaId] = episodio.id;
    this.episodioForms[temporadaId] = {
      numeroEpisodio: episodio.numeroEpisodio,
      titulo: episodio.titulo,
      duracionMinutos: episodio.duracionMinutos,
      sinopsis: episodio.sinopsis || ''
    };
  }

  cancelarEdicionEpisodio(temporada: Temporada): void {
    this.episodioEditandoId[temporada.id] = null;
    this.ensureEpisodeForm(temporada, true);
  }

  guardarEdicionEpisodio(contenidoId: number, temporadaId: number): void {
    const epId = this.episodioEditandoId[temporadaId];
    const payload = this.episodioForms[temporadaId];
    if (!epId) return;

    this.temporadasSrv.createEpisodio(contenidoId, temporadaId, { id: epId, ...payload } as any).subscribe({
      next: () => {
        this.toast.show('Capítulo actualizado', 'success');
        this.episodioEditandoId[temporadaId] = null;
        this.cargarTemporadas(contenidoId);
      },
      error: () => this.toast.show('No se pudo actualizar el capítulo', 'error')
    });
  }

  private ensureEpisodeForm(temporada: Temporada, force = false): void {
    if (this.episodioForms[temporada.id] && !force) return;
    const last = temporada.episodios?.reduce((max: number, e: Episodio) => Math.max(max, e.numeroEpisodio), 0) ?? 0;
    this.episodioForms[temporada.id] = { numeroEpisodio: last + 1, titulo: '', duracionMinutos: 45, sinopsis: '' };
  }

  private emptyForm() {
    return { categoriaId: 0, titulo: '', anioLanzamiento: 2026, duracionMinutos: 90, sinopsis: '', clasificacionEdad: 'TP', originalQuindioflix: false, empleadoResponsableId: 0, generoIds: [] as number[] };
  }
}