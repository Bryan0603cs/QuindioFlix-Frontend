import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'qf-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar">
      <a class="brand" routerLink="/dashboard"><span>QF</span><strong>QuindioFlix</strong></a>
      <nav>
        <a routerLink="/dashboard" routerLinkActive="active">Inicio</a>
        <a routerLink="/catalogo" routerLinkActive="active">Catálogo</a>
        <a routerLink="/perfiles" routerLinkActive="active">Perfiles</a>
        <a routerLink="/pagos" routerLinkActive="active">Pagos</a>
        @if (auth.hasRole(['ADMIN','MODERADOR'])) {
          <a routerLink="/analitica" routerLinkActive="active">Analítica</a>
          <a routerLink="/moderacion" routerLinkActive="active">Moderación</a>
          <a routerLink="/admin/usuarios" routerLinkActive="active">Usuarios</a>
        }
        @if (auth.hasRole(['ADMIN','CONTENIDO'])) {
          <a routerLink="/admin/contenidos" routerLinkActive="active">Gestión catálogo</a>
        }
      </nav>
    </aside>
  `,
  styles: [`
    .sidebar { min-height: 100vh; width: 270px; padding: 24px 18px; background: rgba(5,5,5,.76); border-right: 1px solid var(--qf-line); position: sticky; top: 0; backdrop-filter: blur(18px); }
    .brand { display: flex; gap: 12px; align-items: center; margin-bottom: 28px; }
    .brand span { width: 48px; height: 48px; border-radius: 18px; display: grid; place-items: center; background: linear-gradient(135deg, var(--qf-blue), var(--qf-blue-2)); font-weight: 950; }
    .brand strong { font-size: 1.15rem; }
    nav { display: grid; gap: 8px; }
    nav a { color: var(--qf-muted); padding: 12px 14px; border-radius: 16px; font-weight: 800; }
    nav a:hover, nav a.active { background: rgba(0,3,140,.25); color: var(--qf-text); }
    @media (max-width: 920px) { .sidebar { width: 100%; min-height: auto; position: relative; } nav { grid-template-columns: repeat(2, minmax(0,1fr)); } }
  `]
})
export class SidebarComponent { constructor(public auth: AuthService) {} }
