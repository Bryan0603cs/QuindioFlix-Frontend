import { Component, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { QfButtonComponent } from '../../shared/atoms/qf-button/qf-button.component';
import { QfCardComponent } from '../../shared/atoms/qf-card/qf-card.component';
import { QfInputComponent } from '../../shared/atoms/qf-input/qf-input.component';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, QfButtonComponent, QfCardComponent, QfInputComponent],
  template: `
    <main class="auth-page">
      <section class="hero">
        <span class="brand">QF</span>
        <p class="qf-kicker">// QUINDIOFLIX COLOMBIA</p>
        <h1>Streaming, datos y control institucional.</h1>

        <div class="proof">
          <span>Catálogo</span>
          <span>Perfiles</span>
          <span>Pagos</span>
          <span>Analítica</span>
        </div>
      </section>
      <qf-card>
        <form [formGroup]="form" (ngSubmit)="submit()" class="auth-form">
          <h2>Iniciar sesión</h2>
          <p class="qf-muted">Ejemplo: correo&#64;ejemplo.com</p>
          <qf-input label="Email" type="email" placeholder="usuario&#64;mail.com" formControlName="email" />
          <qf-input label="Contraseña" type="password" placeholder="password123" formControlName="password" />
          @if (error()) { <div class="qf-error">{{ error() }}</div> }
          <qf-button type="submit" [disabled]="form.invalid || loading()">{{ loading() ? 'Ingresando...' : 'Entrar' }}</qf-button>

          <a routerLink="/register" class="link">Crear una cuenta nueva</a>
        </form>
      </qf-card>
    </main>
  `,
  styles: [`
    .auth-page { min-height: 100vh; display: grid; grid-template-columns: 1.2fr minmax(340px, 460px); gap: 40px; align-items: center; padding: 7vw; }
    .brand { width: 72px; height: 72px; display: grid; place-items: center; border-radius: 10px; font-family: "Space Mono", monospace; font-weight: 700; background: linear-gradient(135deg,#1a3080,#4a1a80); border: 1px solid #2a3f7a; color: var(--qf-highlight); box-shadow: 0 30px 80px rgba(74,111,212,.18); }
    
    .qf-kicker {
      margin-top: 24px !important; 
      font-family: "Space Mono", monospace;
      letter-spacing: .12em;
      font-weight: 700;
      font-size: 0.9rem;
    }

    h1 { font-size: clamp(2.4rem, 6vw, 5.8rem); line-height: .94; margin: 12px 0 18px; max-width: 900px; }
    .hero p { color: var(--qf-muted); max-width: 640px; font-size: 1.1rem; line-height: 1.7; }
    .proof { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 28px; }
    .proof span { border: 1px solid var(--qf-line); background: rgba(74,111,212,.08); border-radius: 6px; padding: 8px 11px; color: var(--qf-highlight); font-family: "Space Mono", monospace; font-size: .76rem; font-weight: 700; text-transform: uppercase; }
    .auth-form { display: grid; gap: 16px; }
    h2 { margin: 0; font-size: 2rem; }
    .link { color: var(--qf-muted); text-align: center; font-weight: 800; }
    @media (max-width: 920px) { .auth-page { grid-template-columns: 1fr; padding: 24px; } }
  `]
})
export class LoginPage {
  loading = signal(false);
  error = signal('');
  form = this.fb.nonNullable.group({
    email: ['usuario1@mail.com', [Validators.required, Validators.email]],
    password: ['Password123', [Validators.required]]
  });

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router, private toast: ToastService) {}

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true); this.error.set('');
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => { this.toast.show('Sesión iniciada correctamente', 'success'); this.router.navigateByUrl('/perfiles'); },
      error: () => { this.error.set('Credenciales inválidas o cuenta inactiva.'); this.loading.set(false); },
      complete: () => this.loading.set(false)
    });
  }
}