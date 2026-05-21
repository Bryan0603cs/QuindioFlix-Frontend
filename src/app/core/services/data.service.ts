import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService, Query } from './api.service';
import { AuthService } from './auth.service';
import {
  Calificacion, CalificacionCategoria, CambiarPlanPayload, Categoria, Contenido, ContenidoRelacionado, CrearContenidoPayload, Empleado, Genero,
  IngresoPlan, Page, Pago, Perfil, Plan, ReporteContenido, Reproduccion, Temporada, TopContenido, Usuario
} from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class DataService {
  constructor(private api: ApiService, private auth: AuthService) {}

  // --- MÉTODOS DE BASE ---
  planes(): Observable<Plan[]> { return this.api.get<Plan[]>('/planes'); }
  categorias(): Observable<Categoria[]> { return this.api.get<Categoria[]>('/categorias'); }
  generos(): Observable<Genero[]> { return this.api.get<Genero[]>('/generos'); }
  empleados(query: Query = { page: 0, size: 100, sort: 'id,asc' }): Observable<Page<Empleado>> { return this.api.get<Page<Empleado>>('/empleados', query); }

  // --- GESTIÓN DE USUARIOS Y PERFILES ---
  me(): Observable<Usuario> { return this.api.get<Usuario>('/usuarios/me'); }
  usuarios(query: Query): Observable<Page<Usuario>> { return this.api.get<Page<Usuario>>('/usuarios', { sort: 'id,asc', ...query }); }
  usuario(id: number): Observable<Usuario> { return this.api.get<Usuario>(`/usuarios/${id}`); }
  actualizarUsuario(id: number, payload: Partial<Usuario>): Observable<Usuario> { return this.api.put<Usuario>(`/usuarios/${id}`, payload); }
  cambiarEstadoUsuario(id: number, estadoCuenta: string): Observable<Usuario> { return this.api.patch<Usuario>(`/usuarios/${id}/estado`, { estadoCuenta }); }
  cambiarRolUsuario(id: number, rol: string): Observable<Usuario> { return this.api.patch<Usuario>(`/usuarios/${id}/rol`, { rol }); }
  cambiarPlan(id: number, payload: CambiarPlanPayload): Observable<Usuario> { return this.api.patch<Usuario>(`/usuarios/${id}/plan`, payload); }
  eliminarUsuario(id: number): Observable<void> { return this.api.delete<void>(`/usuarios/${id}`); }
  referidos(usuarioId: number): Observable<Usuario[]> { return this.api.get<Usuario[]>(`/usuarios/${usuarioId}/referidos`); }

  perfiles(usuarioId: number): Observable<Perfil[]> { return this.api.get<Perfil[]>(`/usuarios/${usuarioId}/perfiles`); }
  crearPerfil(usuarioId: number, payload: { nombre: string; avatar: string; tipoPerfil: string }): Observable<Perfil> { return this.api.post<Perfil>(`/usuarios/${usuarioId}/perfiles`, payload); }
  editarPerfil(id: number, payload: { nombre: string; avatar: string }): Observable<Perfil> { return this.api.put<Perfil>(`/perfiles/${id}`, payload); }
  eliminarPerfil(id: number): Observable<void> { return this.api.delete<void>(`/perfiles/${id}`); }

  // --- CONTENIDO Y FAVORITOS ---
  contenidos(query: Query): Observable<Page<Contenido>> {
    return this.api.get<Page<Contenido>>('/contenidos', { page: 0, size: 12, sort: 'id,asc', ...query })
        .pipe(map(page => ({ ...page, content: this.filtrarParaPerfil(page.content) })));
  }
  contenido(id: number): Observable<Contenido> { return this.api.get<Contenido>(`/contenidos/${id}`); }
  crearContenido(payload: CrearContenidoPayload): Observable<Contenido> { return this.api.post<Contenido>('/contenidos', payload); }
  actualizarContenido(id: number, payload: CrearContenidoPayload): Observable<Contenido> { return this.api.put<Contenido>(`/contenidos/${id}`, payload); }
  eliminarContenido(id: number): Observable<void> { return this.api.delete<void>(`/contenidos/${id}`); }
  relacionados(id: number): Observable<ContenidoRelacionado[]> { return this.api.get<ContenidoRelacionado[]>(`/contenidos/${id}/relacionados`); }
  temporadas(contenidoId: number): Observable<Temporada[]> { return this.api.get<Temporada[]>(`/contenidos/${contenidoId}/temporadas`); }

  favoritos(perfilId: number, query: Query = { page: 0, size: 12, sort: 'id,asc' }): Observable<Page<Contenido>> {
    return this.api.get<Page<Contenido>>(`/favoritos/perfil/${perfilId}`, query)
        .pipe(map(page => ({ ...page, content: this.filtrarParaPerfil(page.content) })));
  }
  agregarFavorito(perfilId: number, contenidoId: number): Observable<any> { return this.api.post('/favoritos', { perfilId, contenidoId }); }
  quitarFavorito(perfilId: number, contenidoId: number): Observable<void> { return this.api.delete<void>(`/favoritos/${perfilId}/${contenidoId}`); }

  // --- REPRODUCCIONES Y CALIFICACIONES ---
  reproducciones(query: Query): Observable<Page<Reproduccion>> { return this.api.get<Page<Reproduccion>>('/reproducciones', { page: 0, size: 10, sort: 'id,desc', ...query }); }
  registrarReproduccion(payload: any): Observable<Reproduccion> { return this.api.post<Reproduccion>('/reproducciones', payload); }
  actualizarAvance(id: number, porcentajeAvance: number, fechaHoraFin?: string | null): Observable<Reproduccion> {
    return this.api.patch<Reproduccion>(`/reproducciones/${id}`, { porcentajeAvance, fechaHoraFin });
  }

  calificaciones(query: Query): Observable<Page<Calificacion>> { return this.api.get<Page<Calificacion>>('/calificaciones', query); }
  calificar(payload: any): Observable<Calificacion> { return this.api.post<Calificacion>('/calificaciones', payload); }

  // --- PAGOS Y REPORTES ---
  pagos(query: Query = { page: 0, size: 10, sort: 'id,desc' }): Observable<Page<Pago>> {
    const usuarioLogueado = this.auth.currentUser();
    const finalQuery = { ...query, usuarioId: usuarioLogueado?.id };
    return this.api.get<Page<Pago>>('/pagos', finalQuery);
  }

  registrarPago(payload: { metodoPago: string; referencia: string }): Observable<Pago> { return this.api.post<Pago>('/pagos', payload); }

  reportes(query: Query = { page: 0, size: 20, sort: 'id,desc' }): Observable<Page<ReporteContenido>> { return this.api.get<Page<ReporteContenido>>('/reportes-contenido', query); }
  crearReporte(payload: { contenidoId: number; descripcion: string }): Observable<ReporteContenido> { return this.api.post<ReporteContenido>('/reportes-contenido', payload); }
  resolverReporte(id: number, payload: { estado: string; comentarioResolucion: string }): Observable<ReporteContenido> { return this.api.patch<ReporteContenido>(`/reportes-contenido/${id}/resolver`, payload); }

  // --- ANALÍTICA AVANZADA (Reportes del Proyecto) ---
  ingresosPlan(mes: number, anio: number): Observable<IngresoPlan[]> {
    return this.api.get<IngresoPlan[]>('/reportes/analitica/ingresos-plan', { mes, anio });
  }

  topContenidoCiudad(ciudad: string, limite = 10): Observable<TopContenido[]> {
    return this.api.get<TopContenido[]>('/reportes/analitica/top-contenido-ciudad', { ciudad, limite });
  }

  calificacionGenero(genero: string): Observable<CalificacionCategoria[]> {
    return this.api.get<CalificacionCategoria[]>('/reportes/analitica/calificacion-genero', { genero });
  }

  // --- MANTENIMIENTO ---
  actualizarPopularidad(): Observable<any> { return this.api.post('/admin/contenidos/actualizar-popularidad', {}); }
  desactivarVencidas(): Observable<any> { return this.api.post('/admin/cuentas/desactivar-vencidas', {}); }

  private filtrarParaPerfil(contenidos: Contenido[]): Contenido[] {
    const perfil = this.auth.getPerfilActivo();
    if (perfil?.tipoPerfil !== 'INFANTIL') return contenidos;
    return contenidos.filter(item => !['MAS_16', 'MAS_18', '+16', '+18'].includes(item.clasificacionEdad));
  }
}