import { Injectable } from '@angular/core';
import { DataService } from './data.service';

@Injectable({ providedIn: 'root' })
export class FavoritosService {
  constructor(private data: DataService) {}
  getByPerfil(perfilId: number) { return this.data.favoritos(perfilId); }
  agregar(perfilId: number, contenidoId: number) { return this.data.agregarFavorito(perfilId, contenidoId); }
  quitar(perfilId: number, contenidoId: number) { return this.data.quitarFavorito(perfilId, contenidoId); }
}
