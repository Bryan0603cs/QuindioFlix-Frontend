import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { Contenido, Plan } from '../../core/models/api.models';
import { formatMoney } from '../../core/utils/poster.util';
import { QfCardComponent } from '../../shared/atoms/qf-card/qf-card.component';
import { QfButtonComponent } from '../../shared/atoms/qf-button/qf-button.component';
import { MetricCardComponent } from '../../shared/molecules/metric-card/metric-card.component';
import { ContentCardComponent } from '../../shared/molecules/content-card/content-card.component';

@Component({
  standalone: true,
  imports: [RouterLink, QfCardComponent, QfButtonComponent, MetricCardComponent, ContentCardComponent],
  template: `
    <section class="qf-page">
      <qf-card tone="blue">
        <div class="hero">
          <div>
            <p class="eyebrow">Oracle conectado</p>
            <h2>Catálogo, pagos, perfiles y analítica desde QuindioFlix.</h2>
            <p class="qf-muted">Tu cuenta está en plan {{ auth.currentUser()?.plan }} y vence el {{ auth.currentUser()?.fechaVencimiento || 'sin fecha' }}.</p>
          </div>
          <qf-button routerLink="/catalogo">Explorar catálogo</qf-button>
        </div>
      </qf-card>

      <div class="qf-grid qf-grid-4">
        <qf-metric-card label="Usuarios" [value]="stats().usuarios" hint="Cargados desde Oracle" />
        <qf-metric-card label="Contenidos" [value]="stats().contenidos" hint="Catálogo disponible" />
        <qf-metric-card label="Planes" [value]="planes().length" hint="Básico, Estándar, Premium" />
        <qf-metric-card label="Rol" [value]="auth.currentUser()?.rol || '-'" hint="Control de acceso" />
      </div>

      <div>
        <h3 class="qf-section-title">Contenido destacado</h3>
        <div class="qf-grid qf-grid-4">
          @for (item of contenidos(); track item.id) { <qf-content-card [content]="item" /> }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .hero { display: flex; justify-content: space-between; align-items: center; gap: 20px; }
    .eyebrow { margin: 0; color: #c7d2fe; font-weight: 900; letter-spacing: .12em; text-transform: uppercase; font-size: .78rem; }
    h2 { margin: 6px 0 12px; font-size: clamp(2rem, 4vw, 4rem); line-height: 1; letter-spacing: -.07em; max-width: 850px; }
    @media (max-width: 760px) { .hero { flex-direction: column; align-items: flex-start; } }
  `]
})
export class DashboardPage implements OnInit {
  contenidos = signal<Contenido[]>([]);
  planes = signal<Plan[]>([]);
  stats = signal({ usuarios: 0, contenidos: 0 });
  formatMoney = formatMoney;
  constructor(public auth: AuthService, private data: DataService) {}
  ngOnInit(): void {
    forkJoin({
      contenidos: this.data.contenidos({ page: 0, size: 8, sort: 'popularidad,desc' }),
      planes: this.data.planes(),
      usuarios: this.data.usuarios({ page: 0, size: 1, sort: 'id,asc' })
    }).subscribe(({ contenidos, planes, usuarios }) => {
      this.contenidos.set(contenidos.content);
      this.planes.set(planes);
      this.stats.set({ usuarios: usuarios.totalElements, contenidos: contenidos.totalElements });
    });
  }
}
