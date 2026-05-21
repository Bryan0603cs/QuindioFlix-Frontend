import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { Query } from './api.service';

@Injectable({ providedIn: 'root' })
export class PagoService {
  constructor(private data: DataService) {}
  getByUsuario(usuarioId: number, query: Query = {}) { return this.data.pagos({ usuarioId, ...query }); }
  registrarPago(payload: { metodoPago: string; referencia: string }) { return this.data.registrarPago(payload); }
}
