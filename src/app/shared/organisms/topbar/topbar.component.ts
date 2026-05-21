import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { QfBadgeComponent } from '../../atoms/qf-badge/qf-badge.component';
import { QfButtonComponent } from '../../atoms/qf-button/qf-button.component';

@Component({
  selector: 'qf-topbar',
  standalone: true,
  imports: [QfBadgeComponent, QfButtonComponent],
  template: `
    <header class="topbar">
      <div>
        <p>Bienvenido</p>
        <h1>{{ auth.currentUser()?.nombre || 'QuindioFlix' }}</h1>
      </div>
      <div class="user">
        <qf-badge tone="blue">{{ auth.currentUser()?.rol }}</qf-badge>
        <qf-badge [tone]="auth.currentUser()?.estadoCuenta === 'ACTIVO' ? 'success' : 'warning'">{{ auth.currentUser()?.estadoCuenta }}</qf-badge>
        <qf-button variant="ghost" (clicked)="auth.logout()">Salir</qf-button>
      </div>
    </header>
  `,
  styles: [`
    .topbar { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding-bottom: 20px; }
    p { margin: 0; color: var(--qf-muted); font-weight: 800; text-transform: uppercase; letter-spacing: .1em; font-size: .76rem; }
    h1 { margin: 4px 0 0; font-size: clamp(1.6rem, 3vw, 2.5rem); }
    .user { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; justify-content: flex-end; }
    @media (max-width: 720px) { .topbar { align-items: flex-start; flex-direction: column; } }
  `]
})
export class TopbarComponent { constructor(public auth: AuthService) {} }
