import { Injectable } from '@angular/core';
import { DataService } from './data.service';

@Injectable({ providedIn: 'root' })
export class CalificacionService {
  constructor(private data: DataService) {}
  getByContenido(contenidoId: number) { return this.data.calificaciones({ contenidoId }); }
  calificar(payload: unknown) { return this.data.calificar(payload); }
}
