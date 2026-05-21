import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NavbarComponent } from '../../organisms/navbar/navbar.component';
import { ToastHostComponent } from '../../organisms/toast-host/toast-host.component';

@Component({
  selector: 'qf-shell',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, ToastHostComponent],
  template: `
    <main class="layout">
      <qf-navbar [perfil]="auth.activeProfile()" />
      <section class="main">
        <router-outlet />
      </section>
      <qf-toast-host />
    </main>
  `,
  styles: [`
    .layout { min-height: 100vh; }
    .main { flex: 1; padding: 28px; min-width: 0; }
    @media (max-width: 920px) { .main { padding: 18px; } }
  `]
})
export class ShellComponent {
  constructor(public auth: AuthService) {}
}
