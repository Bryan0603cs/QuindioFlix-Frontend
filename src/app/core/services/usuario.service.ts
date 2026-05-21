import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { CambiarPlanPayload, Usuario } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  constructor(private data: DataService) {}
  getById(id: number) { return this.data.usuario(id); }
  update(id: number, payload: Partial<Usuario>) { return this.data.actualizarUsuario(id, payload); }
  cambiarPlan(id: number, payload: CambiarPlanPayload) { return this.data.cambiarPlan(id, payload); }
  getReferidos(id: number) { return this.data.referidos(id); }
}
