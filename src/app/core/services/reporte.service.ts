import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { Query } from './api.service';

@Injectable({ providedIn: 'root' })
export class ReporteService {
  constructor(private data: DataService) {}
  crear(payload: { contenidoId: number; descripcion: string }) { return this.data.crearReporte(payload); }
  getAll(query: Query = {}) { return this.data.reportes(query); }
  resolver(id: number, payload: { estado: string; comentarioResolucion: string }) { return this.data.resolverReporte(id, payload); }
}
