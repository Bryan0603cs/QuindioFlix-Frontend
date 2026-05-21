import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../core/services/data.service';
import { Categoria, Contenido, Genero } from '../../core/models/api.models';
import { QfCardComponent } from '../../shared/atoms/qf-card/qf-card.component';
import { QfButtonComponent } from '../../shared/atoms/qf-button/qf-button.component';
import { ContentCardComponent } from '../../shared/molecules/content-card/content-card.component';
import { EmptyStateComponent } from '../../shared/molecules/empty-state/empty-state.component';

@Component({
  standalone: true,
  imports: [FormsModule, QfCardComponent, QfButtonComponent, ContentCardComponent, EmptyStateComponent],
  template: `
    <section class="qf-page">
      <qf-card>
        <div class="qf-page-header">
          <div><p class="qf-kicker">Catálogo multimedia</p><h2>Explora QuindioFlix</h2><p class="qf-muted">Películas, series, documentales, música y podcasts filtrados desde Oracle.</p></div>
          <qf-button variant="ghost" (clicked)="limpiar()">Limpiar filtros</qf-button>
        </div>
        <div class="filters">
          <input placeholder="Buscar por título" [(ngModel)]="titulo" (keyup.enter)="cargar()" />
          <select [(ngModel)]="categoriaId"><option [ngValue]="null">Todas las categorías</option>@for (c of categorias(); track c.id) { <option [ngValue]="c.id">{{ c.nombre }}</option> }</select>
          <select [(ngModel)]="generoId"><option [ngValue]="null">Todos los géneros</option>@for (g of generos(); track g.id) { <option [ngValue]="g.id">{{ g.nombre }}</option> }</select>
          <qf-button (clicked)="cargar()">Buscar</qf-button>
        </div>
      </qf-card>

      @if (contenidos().length) {
        <div class="qf-grid qf-grid-4">
          @for (item of contenidos(); track item.id) { <qf-content-card [content]="item" /> }
        </div>
      } @else { <qf-empty-state title="No hay contenidos" description="Ajusta los filtros para encontrar resultados." /> }

      <div class="pager">
        <qf-button variant="ghost" [disabled]="page() === 0" (clicked)="anterior()">Anterior</qf-button>
        <span>Página {{ page() + 1 }} de {{ totalPages() || 1 }}</span>
        <qf-button variant="ghost" [disabled]="page() + 1 >= totalPages()" (clicked)="siguiente()">Siguiente</qf-button>
      </div>
    </section>
  `,
  styles: [`
    .pager { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
    .filters { display: grid; grid-template-columns: 1.4fr 1fr 1fr auto; gap: 12px; margin-top: 18px; }
    input, select { width: 100%; border: 1px solid var(--qf-line); border-radius: 8px; padding: 13px 14px; color: var(--qf-text); background: var(--qf-black-3); outline: none; }
    input:focus, select:focus { border-color: rgba(245,196,81,.75); box-shadow: 0 0 0 4px rgba(245,196,81,.12); }
    .pager { justify-content: center; color: var(--qf-muted); font-weight: 800; }
    @media (max-width: 900px) { .filters { grid-template-columns: 1fr; } }
  `]
})
export class CatalogPage implements OnInit {
  categorias = signal<Categoria[]>([]);
  generos = signal<Genero[]>([]);
  contenidos = signal<Contenido[]>([]);
  page = signal(0);
  totalPages = signal(0);
  titulo = '';
  categoriaId: number | null = null;
  generoId: number | null = null;

  constructor(private data: DataService) {}
  ngOnInit(): void {
    this.data.categorias().subscribe(v => this.categorias.set(v));
    this.data.generos().subscribe(v => this.generos.set(v));
    this.cargar();
  }
  cargar(): void {
    this.data.contenidos({ titulo: this.titulo, categoriaId: this.categoriaId, generoId: this.generoId, page: this.page(), size: 12, sort: 'id,asc' })
      .subscribe(page => { this.contenidos.set(page.content); this.totalPages.set(page.totalPages); });
  }
  limpiar(): void { this.titulo = ''; this.categoriaId = null; this.generoId = null; this.page.set(0); this.cargar(); }
  anterior(): void { this.page.update(v => Math.max(0, v - 1)); this.cargar(); }
  siguiente(): void { this.page.update(v => v + 1); this.cargar(); }
}

