export type RolUsuario = 'CLIENTE' | 'MODERADOR' | 'CONTENIDO' | 'ADMIN';
export type EstadoCuenta = 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO';
export type TipoPerfil = 'ADULTO' | 'INFANTIL';
export type TipoContenido = 'PELICULA' | 'SERIE' | 'DOCUMENTAL' | 'MUSICA' | 'PODCAST';
export type ClasificacionEdad = 'TP' | 'MAS_7' | 'MAS_13' | 'MAS_16' | 'MAS_18' | '+7' | '+13' | '+16' | '+18';
export type MetodoPago = 'TARJETA_CREDITO' | 'TARJETA_DEBITO' | 'PSE' | 'NEQUI' | 'DAVIPLATA';
export type EstadoPago = 'EXITOSO' | 'FALLIDO' | 'PENDIENTE' | 'REEMBOLSADO';
export type EstadoReporte = 'PENDIENTE' | 'EN_REVISION' | 'RESUELTO' | 'RECHAZADO';
export type Dispositivo = 'CELULAR' | 'TABLET' | 'TV' | 'COMPUTADOR';

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  fechaNacimiento: string;
  ciudad: string;
  planId: number;
  plan: string;
  estadoCuenta: EstadoCuenta;
  fechaRegistro: string;
  fechaUltimoPago?: string | null;
  fechaVencimiento?: string | null;
  referidoPorId?: number | null;
  rol: RolUsuario;
}

export interface AuthResponse {
  token: string;
  usuario: Usuario;
}

export interface Plan {
  id: number;
  nombre: string;
  pantallasSimultaneas: number;
  calidad: string;
  precioMensual: number;
  maxPerfiles: number;
}

export interface Perfil {
  id: number;
  usuarioId: number;
  nombre: string;
  avatar: string;
  tipoPerfil: TipoPerfil;
}

export interface Categoria {
  id: number;
  nombre: string;
  tipoContenido: TipoContenido;
}

export interface Genero {
  id: number;
  nombre: string;
}

export interface Empleado {
  id: number;
  nombre: string;
  cargo: string;
  departamentoId: number;
  departamento: string;
}

export interface Contenido {
  id: number;
  categoriaId: number;
  categoria: string;
  titulo: string;
  anioLanzamiento: number;
  duracionMinutos: number;
  sinopsis: string;
  clasificacionEdad: ClasificacionEdad;
  fechaAgregado: string;
  originalQuindioflix: boolean;
  empleadoResponsableId: number;
  popularidad: number;
  generos: string[];
}

export interface Temporada {
  id: number;
  contenidoId: number;
  numeroTemporada: number;
  titulo: string;
  fechaLanzamiento: string;
  episodios: Episodio[];
}

export interface Episodio {
  id: number;
  temporadaId: number;
  numeroEpisodio: number;
  titulo: string;
  duracionMinutos: number;
  sinopsis: string;
}

export interface Pago {
  id: number;
  usuarioId: number;
  fechaPago: string;
  monto: number;
  metodoPago: MetodoPago;
  estadoPago: EstadoPago;
  referencia: string;
  descuentoAplicado: number;
}

export interface ReporteContenido {
  id: number;
  usuarioReportaId: number;
  contenidoId: number;
  descripcion: string;
  fechaReporte: string;
  estado: EstadoReporte;
  moderadorId?: number | null;
  fechaResolucion?: string | null;
  comentarioResolucion?: string | null;
}

export interface Reproduccion {
  id: number;
  perfilId: number;
  contenidoId: number;
  episodioId?: number | null;
  fechaHoraInicio: string;
  fechaHoraFin?: string | null;
  dispositivo: Dispositivo;
  porcentajeAvance: number;
}

export interface Calificacion {
  id: number;
  perfilId: number;
  contenidoId: number;
  estrellas: number;
  resena?: string | null;
  fechaCalificacion: string;
  perfil?: string;
  nombrePerfil?: string;
}

export interface ContenidoRelacionado {
  id: number;
  contenidoOrigenId: number;
  contenidoDestinoId: number;
  tituloDestino: string;
  tipoRelacion: string;
  descripcion?: string | null;
}

export interface CrearContenidoPayload {
  categoriaId: number;
  titulo: string;
  anioLanzamiento: number;
  duracionMinutos: number;
  sinopsis: string;
  clasificacionEdad: string;
  originalQuindioflix: boolean;
  empleadoResponsableId: number;
  generoIds: number[];
}

export interface CambiarPlanPayload {
  nuevoPlanId: number;
  motivo?: string;
}

export interface IngresoPlan { plan: string; total: number; pagos: number; }
export interface TopContenido { contenidoId: number; titulo: string; reproducciones: number; }
export interface CalificacionCategoria { categoria: string; promedio: number; totalCalificaciones: number; }
export interface ConsumoUsuario { perfil: string; categoria: string; reproducciones: number; minutos: number; }
