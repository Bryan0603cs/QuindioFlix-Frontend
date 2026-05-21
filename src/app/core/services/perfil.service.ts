import { Injectable } from '@angular/core';
import { DataService } from './data.service';

@Injectable({ providedIn: 'root' })
export class PerfilService {
  constructor(private data: DataService) {}
  getByUsuario(usuarioId: number) { return this.data.perfiles(usuarioId); }
  create(usuarioId: number, payload: { nombre: string; avatar: string; tipoPerfil: string }) { return this.data.crearPerfil(usuarioId, payload); }
  update(id: number, payload: { nombre: string; avatar: string }) { return this.data.editarPerfil(id, payload); }
  delete(id: number) { return this.data.eliminarPerfil(id); }
}
