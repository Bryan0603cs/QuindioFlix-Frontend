import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { Query } from './api.service';
import { CrearContenidoPayload } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class ContenidoService {
  constructor(private data: DataService) {}
  getAll(query: Query = {}) { return this.data.contenidos(query); }
  getById(id: number) { return this.data.contenido(id); }
  getByCategoria(categoriaId: number) { return this.data.contenidos({ categoriaId }); }
  search(titulo: string) { return this.data.contenidos({ titulo }); }
  create(payload: CrearContenidoPayload) { return this.data.crearContenido(payload); }
  update(id: number, payload: CrearContenidoPayload) { return this.data.actualizarContenido(id, payload); }
  delete(id: number) { return this.data.eliminarContenido(id); }
}
