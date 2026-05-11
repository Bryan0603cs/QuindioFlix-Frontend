import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { Plan } from '../../core/models/api.models';
import { QfButtonComponent } from '../../shared/atoms/qf-button/qf-button.component';
import { QfCardComponent } from '../../shared/atoms/qf-card/qf-card.component';
import { QfInputComponent } from '../../shared/atoms/qf-input/qf-input.component';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, QfButtonComponent, QfCardComponent, QfInputComponent],
  template: `
    <main class="auth-page">
      <qf-card>
        <form [formGroup]="form" (ngSubmit)="submit()" class="auth-form">
          <h2>Crear cuenta</h2>
          <div class="qf-form-row">
            <qf-input label="Nombre" formControlName="nombre" />
            <qf-input label="Email" type="email" formControlName="email" />
          </div>
          <div class="qf-form-row">
            <qf-input label="Teléfono" formControlName="telefono" />
            <qf-input label="Ciudad" formControlName="ciudad" />
          </div>
          <div class="qf-form-row">
            <qf-input label="Fecha nacimiento" type="date" formControlName="fechaNacimiento" />
            <label class="field"><span>Plan</span><select formControlName="planId"><option [ngValue]="null">Seleccionar</option>@for (plan of planes(); track plan.id) { <option [ngValue]="plan.id">{{ plan.nombre }} - {{ plan.calidad }}</option> }</select></label>
          </div>
          <div class="qf-form-row">
            <qf-input label="Contraseña" type="password" formControlName="password" />
            <label class="field"><span>Método primer pago</span><select formControlName="metodoPagoPrimerPago"><option value="PSE">PSE</option><option value="TARJETA_CREDITO">Tarjeta crédito</option><option value="NEQUI">Nequi</option><option value="DAVIPLATA">Daviplata</option></select></label>
          </div>
          @if (error()) { <div class="qf-error">{{ error() }}</div> }
          <qf-button type="submit" [disabled]="form.invalid || loading()">Registrarme</qf-button>
          <a routerLink="/login" class="link">Ya tengo cuenta</a>
        </form>
      </qf-card>
    </main>
  `,
  styles: [`
    .auth-page { min-height: 100vh; display: grid; place-items: center; padding: 28px; }
    qf-card { width: min(780px, 100%); }
    .auth-form { display: grid; gap: 16px; }
    h2 { margin: 0; font-size: 2rem; letter-spacing: -.04em; }
    .field { display: grid; gap: 8px; color: var(--qf-muted); font-weight: 700; font-size: .88rem; }
    select { width: 100%; border: 1px solid var(--qf-line); border-radius: 16px; padding: 13px 14px; color: var(--qf-text); background: #11111a; outline: none; }
    .link { color: var(--qf-muted); text-align: center; font-weight: 800; }
  `]
})
export class RegisterPage implements OnInit {
  loading = signal(false);
  error = signal('');
  planes = signal<Plan[]>([]);
  form = this.fb.group({
    nombre: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required]],
    fechaNacimiento: ['', [Validators.required]],
    ciudad: ['Armenia', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    planId: [null as number | null, [Validators.required]],
    referidoPorId: [null as number | null],
    metodoPagoPrimerPago: ['PSE', [Validators.required]]
  });

  constructor(private fb: FormBuilder, private auth: AuthService, private data: DataService, private router: Router) {}
  ngOnInit(): void { this.data.planes().subscribe(p => this.planes.set(p)); }
  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true); this.error.set('');
    this.auth.register(this.form.getRawValue() as any).subscribe({
      next: () => this.router.navigateByUrl('/dashboard'),
      error: () => { this.error.set('No fue posible registrar la cuenta. Verifica el email o el plan.'); this.loading.set(false); },
      complete: () => this.loading.set(false)
    });
  }
}
