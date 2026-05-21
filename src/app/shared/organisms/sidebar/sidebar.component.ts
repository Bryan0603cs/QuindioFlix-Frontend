import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'qf-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar">
      <a class="brand" routerLink="/dashboard"><span>QF</span><strong>QUINDIOFLIX</strong></a>
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
    .sidebar { min-height: 100vh; width: 270px; padding: 24px 18px; background: rgba(7,8,16,.92); border-right: 1px solid var(--qf-line-soft); position: sticky; top: 0; backdrop-filter: blur(18px); }
    .brand { display: flex; gap: 12px; align-items: center; margin-bottom: 28px; }
    .brand span { width: 42px; height: 42px; border-radius: 10px; display: grid; place-items: center; background: linear-gradient(135deg,#1a3080,#4a1a80); border: 1px solid #2a3f7a; color: var(--qf-highlight); font-family: "Space Mono", monospace; font-weight: 700; }
    .brand strong { font-family: "Space Mono", monospace; font-size: .98rem; background: var(--qf-gradient-cyan); -webkit-background-clip: text; background-clip: text; color: transparent; }
    nav { display: grid; gap: 8px; }
    nav a { color: var(--qf-muted-2); padding: 12px 14px; border-radius: 6px; font-weight: 600; position: relative; }
    nav a:hover, nav a.active { background: rgba(74,111,212,.08); color: var(--qf-highlight); }
    nav a.active::after { content: ''; position: absolute; left: 14px; right: 14px; bottom: 6px; height: 2px; border-radius: 1px; background: linear-gradient(90deg,var(--qf-blue),var(--qf-violet)); }
    @media (max-width: 920px) { .sidebar { width: 100%; min-height: auto; position: relative; } nav { grid-template-columns: repeat(2, minmax(0,1fr)); } }
  `]
})
export class SidebarComponent { constructor(public auth: AuthService) {} }
