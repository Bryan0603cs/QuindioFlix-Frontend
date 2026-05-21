import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { Query } from './api.service';

@Injectable({ providedIn: 'root' })
export class ReproduccionService {
  constructor(private data: DataService) {}
  registrar(payload: unknown) { return this.data.registrarReproduccion(payload); }
  getByPerfil(perfilId: number, query: Query = {}) { return this.data.reproducciones({ perfilId, ...query }); }
  updatePorcentaje(id: number, porcentaje: number, fechaHoraFin?: string | null) { return this.data.actualizarAvance(id, porcentaje, fechaHoraFin); }
}
