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
        <h1>Streaming, datos y control institucional.</h1>
        <p>Frontend Angular preparado para el backend QuindioFlix, Oracle y roles de administraciÃ³n.</p>
      </section>
      <qf-card>
        <form [formGroup]="form" (ngSubmit)="submit()" class="auth-form">
          <h2>Iniciar sesiÃ³n</h2>
          <p class="qf-muted">Usa usuario1&#64;mail.com / Password123 para probar.</p>
          <qf-input label="Email" type="email" placeholder="usuario1&#64;mail.com" formControlName="email" />
          <qf-input label="ContraseÃ±a" type="password" placeholder="Password123" formControlName="password" />
          @if (error()) { <div class="qf-error">{{ error() }}</div> }
          <qf-button type="submit" [disabled]="form.invalid || loading()">{{ loading() ? 'Ingresando...' : 'Entrar' }}</qf-button>
          <a routerLink="/registro" class="link">Crear una cuenta nueva</a>
        </form>
      </qf-card>
    </main>
  `,
  styles: [`
    .auth-page { min-height: 100vh; display: grid; grid-template-columns: 1.2fr minmax(340px, 460px); gap: 40px; align-items: center; padding: 7vw; }
    .brand { width: 72px; height: 72px; display: grid; place-items: center; border-radius: 24px; font-weight: 950; background: linear-gradient(135deg, var(--qf-blue), var(--qf-blue-2)); box-shadow: 0 30px 80px rgba(0,3,140,.45); }
    h1 { font-size: clamp(2.4rem, 6vw, 5.8rem); line-height: .94; letter-spacing: -.08em; margin: 26px 0 18px; max-width: 900px; }
    .hero p { color: var(--qf-muted); max-width: 640px; font-size: 1.1rem; line-height: 1.7; }
    .auth-form { display: grid; gap: 16px; }
    h2 { margin: 0; font-size: 2rem; letter-spacing: -.04em; }
    .link { color: var(--qf-muted); text-align: center; font-weight: 800; }
    @media (max-width: 920px) { .auth-page { grid-template-columns: 1fr; padding: 24px; } }
  `]
})
export class LoginPage {
  loading = signal(false);
  error = signal('');
  form = this.fb.nonNullable.group({
    email: ['usuario1&#64;mail.com', [Validators.required, Validators.email]],
    password: ['Password123', [Validators.required]]
  });

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router, private toast: ToastService) {}

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true); this.error.set('');
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => { this.toast.show('SesiÃ³n iniciada correctamente', 'success'); this.router.navigateByUrl('/dashboard'); },
      error: () => { this.error.set('Credenciales invÃ¡lidas o cuenta inactiva.'); this.loading.set(false); },
      complete: () => this.loading.set(false)
    });
  }
}

