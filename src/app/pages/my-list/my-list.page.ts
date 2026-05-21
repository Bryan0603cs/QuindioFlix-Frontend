import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { Contenido } from '../../core/models/api.models';
import { ToastService } from '../../core/services/toast.service';
import { ContentCardComponent } from '../../shared/molecules/content-card/content-card.component';
import { EmptyStateComponent } from '../../shared/molecules/empty-state/empty-state.component';
import { QfButtonComponent } from '../../shared/atoms/qf-button/qf-button.component';

@Component({
  standalone: true,
  imports: [RouterLink, ContentCardComponent, EmptyStateComponent, QfButtonComponent],
  template: `
    <section class="qf-page">
      <div class="qf-page-header">
        <div><p class="qf-kicker">Favoritos</p><h2>Mi lista · {{ contenidos().length }}</h2></div>
      </div>

      @if (loading()) {
        <div class="qf-grid qf-grid-4">@for (n of [1,2,3,4]; track n) { <div class="skeleton"></div> }</div>
      } @else if (contenidos().length) {
        <div class="qf-grid qf-grid-4">
          @for (item of contenidos(); track item.id) {
            <article class="favorite">
              <qf-content-card [content]="item" />
              @if (confirmando() === item.id) {
                <div class="confirm"><span>¿Quitar?</span><qf-button variant="danger" (clicked)="quitar(item)">Sí</qf-button><qf-button variant="ghost" (clicked)="confirmando.set(null)">No</qf-button></div>
              } @else {
                <qf-button variant="soft" (clicked)="confirmando.set(item.id)">Quitar</qf-button>
              }
            </article>
          }
        </div>
      } @else {
        <div>
          <qf-empty-state title="Tu lista está vacía" description="Agrega contenidos desde el catálogo." />
          <a routerLink="/buscar"><qf-button>Ir al catálogo</qf-button></a>
        </div>
      }
    </section>
  `,
  styles: [`
    .favorite { display: grid; gap: 10px; }
    .confirm { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; color: var(--qf-muted); }
    .skeleton { min-height: 340px; border-radius: 8px; background: rgba(255,255,255,.05); }
  `]
})
export class MyListPage implements OnInit {
  contenidos = signal<Contenido[]>([]);
  confirmando = signal<number | null>(null);
  loading = signal(true);

  constructor(private auth: AuthService, private data: DataService, private toast: ToastService) {}

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    const perfil = this.auth.getPerfilActivo();
    if (!perfil) return;
    this.loading.set(true);
    this.data.favoritos(perfil.id, { page: 0, size: 80, sort: 'id,desc' }).subscribe(page => {
      this.contenidos.set(page.content);
      this.loading.set(false);
    });
  }

  quitar(item: Contenido): void {
    const perfil = this.auth.getPerfilActivo();
    if (!perfil) return;
    this.data.quitarFavorito(perfil.id, item.id).subscribe({
      next: () => { this.toast.show('Contenido quitado de tu lista', 'success'); this.confirmando.set(null); this.cargar(); },
      error: () => this.toast.show('No se pudo quitar de favoritos', 'error')
    });
  }
}
