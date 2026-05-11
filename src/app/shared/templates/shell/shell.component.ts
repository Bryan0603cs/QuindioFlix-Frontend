import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../organisms/sidebar/sidebar.component';
import { TopbarComponent } from '../../organisms/topbar/topbar.component';
import { ToastHostComponent } from '../../organisms/toast-host/toast-host.component';

@Component({
  selector: 'qf-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, ToastHostComponent],
  template: `
    <main class="layout">
      <qf-sidebar />
      <section class="main">
        <qf-topbar />
        <router-outlet />
      </section>
      <qf-toast-host />
    </main>
  `,
  styles: [`
    .layout { display: flex; min-height: 100vh; }
    .main { flex: 1; padding: 28px; min-width: 0; }
    @media (max-width: 920px) { .layout { flex-direction: column; } .main { padding: 18px; } }
  `]
})
export class ShellComponent {}
