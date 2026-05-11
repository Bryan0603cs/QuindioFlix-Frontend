import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { QfButtonComponent } from '../../shared/atoms/qf-button/qf-button.component';

@Component({
  standalone: true,
  imports: [RouterLink, QfButtonComponent],
  template: `<main class="not"><h1>404</h1><p>La ruta solicitada no existe.</p><qf-button routerLink="/dashboard">Volver al inicio</qf-button></main>`,
  styles: [`.not{min-height:100vh;display:grid;place-items:center;text-align:center}h1{font-size:8rem;margin:0;letter-spacing:-.08em}p{color:var(--qf-muted)}`]
})
export class NotFoundPage {}
