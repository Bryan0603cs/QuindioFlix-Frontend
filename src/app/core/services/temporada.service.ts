import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { DataService } from './data.service';

@Injectable({ providedIn: 'root' })
export class TemporadaService {
  constructor(private data: DataService, private api: ApiService) {}

  getByContenido(contenidoId: number) { return this.data.temporadas(contenidoId); }

  createTemporada(contenidoId: number, payload: unknown) {
    return this.api.post(`/contenidos/${contenidoId}/temporadas`, payload);
  }

  // AGREGA ESTO:
  deleteTemporada(contenidoId: number, temporadaId: number) {
    return this.api.delete(`/contenidos/${contenidoId}/temporadas/${temporadaId}`);
  }

  createEpisodio(contenidoId: number, temporadaId: number, payload: unknown) {
    return this.api.post(`/contenidos/${contenidoId}/temporadas/${temporadaId}/episodios`, payload);
  }

  // AGREGA ESTO:
  deleteEpisodio(contenidoId: number, temporadaId: number, episodioId: number) {
    return this.api.delete(`/contenidos/${contenidoId}/temporadas/${temporadaId}/episodios/${episodioId}`);
  }
}