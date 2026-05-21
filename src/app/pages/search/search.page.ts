import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { DataService } from '../../core/services/data.service';
import { Categoria, Contenido, Genero } from '../../core/models/api.models';
import { ContentCardComponent } from '../../shared/molecules/content-card/content-card.component';
import { EmptyStateComponent } from '../../shared/molecules/empty-state/empty-state.component';
import { QfButtonComponent } from '../../shared/atoms/qf-button/qf-button.component';

@Component({
  standalone: true,
  imports: [FormsModule, ContentCardComponent, EmptyStateComponent, QfButtonComponent],
  template: `
    <section class="qf-page">
      <div class="search-head">
        <input [(ngModel)]="titulo" (input)="cargar()" placeholder="Buscar por título" />
        <qf-button variant="ghost" (clicked)="limpiar()">Limpiar</qf-button>
      </div>

      <div class="chips">
        <button [class.active]="categoriaId() === null" (click)="categoriaId.set(null); cargar()">Todas</button>
        @for (categoria of categorias(); track categoria.id) {
          <button [class.active]="categoriaId() === categoria.id" (click)="categoriaId.set(categoria.id); cargar()">{{ categoria.nombre }}</button>
        }
      </div>

      <div class="chips">
        @for (genero of generos(); track genero.id) {
          <button [class.active]="generoIds().includes(genero.id)" (click)="toggleGenero(genero.id)">{{ genero.nombre }}</button>
        }
      </div>

      @if (loading()) {
        <div class="qf-grid qf-grid-4">@for (n of [1,2,3,4]; track n) { <div class="skeleton"></div> }</div>
      } @else if (contenidos().length) {
        <div class="qf-grid qf-grid-4">@for (item of contenidos(); track item.id) { <qf-content-card [content]="item" /> }</div>
      } @else {
        <qf-empty-state title="No hay resultados" description="Ajusta la búsqueda o los filtros." />
      }
    </section>
  `,
  styles: [`
    .search-head { display: grid; grid-template-columns: 1fr auto; gap: 12px; }
    input { width: 100%; border: 1px solid var(--qf-line); border-radius: 8px; padding: 14px; color: var(--qf-text); background: var(--qf-black-3); outline: none; }
    .chips { display: flex; gap: 8px; flex-wrap: wrap; }
    .chips button { border: 1px solid var(--qf-line); border-radius: 999px; padding: 8px 12px; color: var(--qf-muted); background: var(--qf-black-3); }
    .chips button.active { border-color: var(--qf-blue); color: var(--qf-highlight); background: rgba(74,111,212,.14); }
    .skeleton { min-height: 340px; border-radius: 8px; background: rgba(255,255,255,.05); }
    @media(max-width:720px){ .search-head { grid-template-columns: 1fr; } }
  `]
})
export class SearchPage implements OnInit {
  categorias = signal<Categoria[]>([]);
  generos = signal<Genero[]>([]);
  contenidos = signal<Contenido[]>([]);
  categoriaId = signal<number | null>(null);
  generoIds = signal<number[]>([]);
  loading = signal(true);
  titulo = '';

  constructor(private data: DataService) {}

  ngOnInit(): void {
    forkJoin({ categorias: this.data.categorias(), generos: this.data.generos() }).subscribe(({ categorias, generos }) => {
      this.categorias.set(categorias);
      this.generos.set(generos);
      this.cargar();
    });
  }

  cargar(): void {
    this.loading.set(true);
    this.data.contenidos({ titulo: this.titulo, categoriaId: this.categoriaId(), page: 0, size: 60, sort: 'titulo,asc' }).subscribe(page => {
      const generoNames = this.generos().filter(g => this.generoIds().includes(g.id)).map(g => g.nombre);
      const filtered = generoNames.length ? page.content.filter(item => generoNames.every(g => item.generos.includes(g))) : page.content;
      this.contenidos.set(filtered);
      this.loading.set(false);
    });
  }

  toggleGenero(id: number): void {
    this.generoIds.update(ids => ids.includes(id) ? ids.filter(item => item !== id) : [...ids, id]);
    this.cargar();
  }

  limpiar(): void {
    this.titulo = '';
    this.categoriaId.set(null);
    this.generoIds.set([]);
    this.cargar();
  }
}
