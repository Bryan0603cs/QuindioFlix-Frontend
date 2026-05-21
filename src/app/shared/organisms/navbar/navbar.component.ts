import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Perfil } from '../../../core/models/api.models';
import { QfBadgeComponent } from '../../atoms/qf-badge/qf-badge.component';
import { QfButtonComponent } from '../../atoms/qf-button/qf-button.component';
import { PerfilAvatarComponent } from '../../molecules/perfil-avatar/perfil-avatar.component';

@Component({
  selector: 'qf-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, QfBadgeComponent, QfButtonComponent, PerfilAvatarComponent],
  template: `
    <header class="navbar">
      <a class="brand" routerLink="/home"><span>QF</span><strong>QuindioFlix</strong></a>
      <nav>
        <a routerLink="/home" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Inicio</a>
        <a routerLink="/buscar" routerLinkActive="active">Buscar</a>

        <a routerLink="/mi-lista" routerLinkActive="active">Mi lista</a>

        <a routerLink="/historial" routerLinkActive="active">Historial</a>
        <a routerLink="/cuenta" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Cuenta</a>
        @if (auth.hasRole(['MODERADOR'])) { <a routerLink="/moderador" routerLinkActive="active">Moderador</a> }
        @if (auth.hasRole(['ADMIN','CONTENIDO'])) { <a routerLink="/admin" routerLinkActive="active">Admin</a> }
      </nav>
      <div class="profile">
        @if (perfilActivo; as perfil) { <qf-perfil-avatar [nombre]="perfil.nombre" [tipo]="perfil.tipoPerfil" /> }
        <a routerLink="/perfiles"><qf-badge tone="blue">{{ perfilActivo?.nombre || 'Perfil' }}</qf-badge></a>
        <qf-button variant="ghost" (clicked)="auth.logout()">Salir</qf-button>
      </div>
    </header>
  `,
  styles: [`
    .navbar { display: grid; grid-template-columns: auto 1fr auto; gap: 18px; align-items: center; padding: 18px 28px; border-bottom: 1px solid var(--qf-line); background: rgba(7,8,16,.92); position: sticky; top: 0; z-index: 50; backdrop-filter: blur(16px); }
    .brand { display: flex; gap: 10px; align-items: center; }
    .brand span { width: 38px; height: 38px; border-radius: 8px; display: grid; place-items: center; background: var(--qf-gradient); font-family: "Space Mono", monospace; font-weight: 700; }
    .brand strong { font-family: "Space Mono", monospace; }
    nav { display: flex; gap: 6px; flex-wrap: wrap; }
    nav a { color: var(--qf-muted); padding: 9px 11px; border-radius: 6px; font-weight: 700; }
    nav a.active, nav a:hover { color: var(--qf-highlight); background: rgba(74,111,212,.1); }
    .profile { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; justify-content: end; }
    @media(max-width: 920px) { .navbar { grid-template-columns: 1fr; } }
  `]
})
export class NavbarComponent {
  @Input() perfil: Perfil | null = null;
  constructor(public auth: AuthService) {}

  get perfilActivo(): Perfil | null {
    return this.perfil ?? this.auth.getPerfilActivo();
  }
}
