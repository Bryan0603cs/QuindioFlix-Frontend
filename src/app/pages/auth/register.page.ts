import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { Plan } from '../../core/models/api.models';
import { formatMoney } from '../../core/utils/poster.util';
import { QfButtonComponent } from '../../shared/atoms/qf-button/qf-button.component';
import { QfCardComponent } from '../../shared/atoms/qf-card/qf-card.component';
import { QfInputComponent } from '../../shared/atoms/qf-input/qf-input.component';
import { ModalComponent } from '../../shared/molecules/modal/modal.component';
import { PlanCardComponent } from '../../shared/molecules/plan-card/plan-card.component';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, QfButtonComponent, QfCardComponent, QfInputComponent, ModalComponent, PlanCardComponent],
  template: `
    <main class="auth-page">
      <qf-card>
        <form [formGroup]="form" (ngSubmit)="submit()" class="auth-form" autocomplete="off">
          <input type="text" style="display:none" />
          <input type="password" style="display:none" />
          <h2>Crear cuenta</h2>

          <div class="qf-form-row">
            <qf-input label="Nombre" formControlName="nombre" />
            <qf-input label="Email" type="email" formControlName="email" />
          </div>

          <div class="qf-form-row">
            <qf-input label="Teléfono" formControlName="telefono" />
            <label class="field">
              <span>Ciudad</span>
              <select formControlName="ciudad">
                @for (ciudad of ciudades; track ciudad) { <option [value]="ciudad">{{ ciudad }}</option> }
              </select>
            </label>
          </div>

          <section class="plans">
            <div>
              <span class="label">Plan</span>
              <p>Elige el plan que quieres activar con tu primer pago.</p>
            </div>
            <div class="plan-grid">
              @for (plan of planes(); track plan.id) {
                <button type="button" class="plan-option" (click)="verPlan(plan)">
                  <qf-plan-card [plan]="plan" [seleccionado]="form.value.planId === plan.id" [recomendado]="esRecomendado(plan)" />
                </button>
              }
            </div>
            @if (planSeleccionado(); as plan) {
              <div class="selected-plan">Plan seleccionado: <strong>{{ nombrePlan(plan) }}</strong> · {{ money(plan.precioMensual) }}</div>
            } @else {
              <div class="qf-error">Selecciona un plan para continuar.</div>
            }
          </section>

          <div class="qf-form-row">
            <div style="display: grid; gap: 4px; width: 100%;">
              <qf-input label="Fecha nacimiento" type="date" formControlName="fechaNacimiento" />

              @if (form.get('fechaNacimiento')?.hasError('menorDeEdad') && form.get('fechaNacimiento')?.touched) {
                <div class="qf-error" style="font-size: 0.82rem; color: #ff0055; font-weight: bold; margin-top: -4px;">
                  ⚠️ Solo se permiten usuarios mayores de 18 años.
                </div>
              }
            </div>
            <qf-input label="Contraseña" type="password" formControlName="password" />
          </div>

          <div class="qf-form-row">
            <label class="field">
              <span>Método primer pago</span>
              <select formControlName="metodoPagoPrimerPago">
                <option value="PSE">PSE</option>
                <option value="TARJETA_CREDITO">Tarjeta crédito</option>
                <option value="TARJETA_DEBITO">Tarjeta débito</option>
                <option value="NEQUI">Nequi</option>
                <option value="DAVIPLATA">Daviplata</option>
              </select>
            </label>
            <qf-input label="Código o link referido (opcional)" formControlName="codigoReferido" />
          </div>

          @if (error()) { <div class="qf-error">{{ error() }}</div> }
          <qf-button type="submit" [disabled]="form.invalid || loading()">{{ loading() ? 'Creando cuenta...' : 'Registrarme' }}</qf-button>
          <a routerLink="/login" class="link">Ya tengo cuenta</a>
        </form>
      </qf-card>
    </main>

    <qf-modal [open]="!!planEnVista()" [titulo]="planEnVista() ? nombrePlan(planEnVista()!) : 'Plan'" (closed)="cerrarPlan()">
      @if (planEnVista(); as plan) {
        <div class="plan-detail">
          <strong>{{ money(plan.precioMensual) }} / mes</strong>
          <p>{{ descripcionPlan(plan) }}</p>
          <ul>
            <li>{{ plan.pantallasSimultaneas }} pantalla(s) simultánea(s)</li>
            <li>{{ plan.maxPerfiles }} perfiles por cuenta</li>
            <li>Calidad {{ plan.calidad }}</li>
          </ul>
          <div class="qf-actions">
            <qf-button type="button" (clicked)="confirmarPlan(plan)">Elegir este plan</qf-button>
            <qf-button type="button" variant="ghost" (clicked)="cerrarPlan()">Ver otros</qf-button>
          </div>
        </div>
      }
    </qf-modal>
  `,
  styles: [`
    .auth-page { min-height: 100vh; display: grid; place-items: center; padding: 28px; }
    qf-card { width: min(920px, 100%); }
    .auth-form { display: grid; gap: 16px; }
    h2 { margin: 0; font-size: 2rem; }
    .field { display: grid; gap: 8px; color: var(--qf-muted); font-weight: 700; font-size: .88rem; }
    .field span, .label { font-family: "Space Mono", monospace; letter-spacing: .08em; text-transform: uppercase; color: var(--qf-muted-2); font-size: .78rem; font-weight: 700; }
    select { width: 100%; border: 1px solid var(--qf-line); border-radius: 8px; padding: 13px 14px; color: var(--qf-text); background: var(--qf-black-3); outline: none; }
    .plans { display: grid; gap: 12px; }
    .plans p { margin: 6px 0 0; color: var(--qf-muted); }
    .plan-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
    .plan-option { border: 0; background: transparent; color: inherit; padding: 0; text-align: left; }
    .plan-option:hover { transform: translateY(-1px); }
    .selected-plan { border: 1px solid rgba(0,255,159,.28); background: rgba(0,255,159,.07); color: var(--qf-success); border-radius: 6px; padding: 10px 12px; }
    .plan-detail { display: grid; gap: 12px; }
    .plan-detail strong { font-size: 1.7rem; }
    .plan-detail p, .plan-detail li { color: var(--qf-muted); line-height: 1.55; }
    .plan-detail ul { margin: 0; padding-left: 20px; }
    .link { color: var(--qf-muted); text-align: center; font-weight: 800; }
    @media (max-width: 820px) { .plan-grid { grid-template-columns: 1fr; } }
  `]
})
export class RegisterPage implements OnInit {
  private readonly fallbackPlanes: Plan[] = [
    { id: 1, nombre: 'Básico', pantallasSimultaneas: 1, calidad: 'SD', precioMensual: 14900, maxPerfiles: 2 },
    { id: 2, nombre: 'Estándar', pantallasSimultaneas: 2, calidad: 'HD', precioMensual: 24900, maxPerfiles: 3 },
    { id: 3, nombre: 'Premium', pantallasSimultaneas: 4, calidad: '4K', precioMensual: 34900, maxPerfiles: 5 }
  ];

  loading = signal(false);
  error = signal('');
  planes = signal<Plan[]>(this.fallbackPlanes);
  planEnVista = signal<Plan | null>(null);
  ciudades = ['Armenia', 'Calarcá', 'Circasia', 'Filandia', 'Génova', 'La Tebaida', 'Montenegro', 'Pijao', 'Quimbaya', 'Salento'];
  money = formatMoney;

  form = this.fb.group({
    nombre: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
    fechaNacimiento: ['', [Validators.required, validarMayoriaEdad]], // <--- Llamado directo a la función externa sin 'this'
    ciudad: ['Armenia', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    planId: [null as number | null, [Validators.required]],
    codigoReferido: [''],
    metodoPagoPrimerPago: ['PSE', [Validators.required]]
  });

  constructor(private fb: FormBuilder, private auth: AuthService, private data: DataService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.data.planes().pipe(
        catchError(() => of(this.fallbackPlanes))
    ).subscribe(p => this.planes.set(p.length ? p : this.fallbackPlanes));
    const ref = this.route.snapshot.queryParamMap.get('ref');
    if (ref) this.form.patchValue({ codigoReferido: ref });
  }

  verPlan(plan: Plan): void {
    this.planEnVista.set(plan);
  }

  cerrarPlan(): void {
    this.planEnVista.set(null);
  }

  confirmarPlan(plan: Plan): void {
    this.form.patchValue({ planId: plan.id });
    this.form.get('planId')?.markAsTouched();
    this.cerrarPlan();
  }

  planSeleccionado(): Plan | undefined {
    return this.planes().find(plan => plan.id === this.form.value.planId);
  }

  nombrePlan(plan: Plan): string {
    const lower = plan.nombre.toLocaleLowerCase('es-CO');
    return lower.charAt(0).toLocaleUpperCase('es-CO') + lower.slice(1);
  }

  esRecomendado(plan: Plan): boolean {
    return plan.nombre.toLocaleUpperCase('es-CO').includes('PREMIUM') || plan.calidad === '4K';
  }

  descripcionPlan(plan: Plan): string {
    if (plan.maxPerfiles <= 2) return 'Ideal si vas a usar QuindioFlix de forma individual o con pocos perfiles.';
    if (plan.maxPerfiles <= 3) return 'Buena opción para compartir en casa con más perfiles y mejor calidad.';
    return 'Pensado para familias o grupos que quieren más perfiles, más pantallas y la mejor calidad disponible.';
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const payload: any = { ...this.form.value };

    if (payload.fechaNacimiento) {
      const fecha = new Date(payload.fechaNacimiento);
      if (!isNaN(fecha.getTime())) {
        payload.fechaNacimiento = fecha.toISOString().split('T')[0];
      }
    }

    const idLimpio = payload.codigoReferido ? this.parseReferido(payload.codigoReferido) : null;
    payload.referidoPor = idLimpio;
    delete payload.codigoReferido;

    this.auth.register(payload).subscribe({
      next: (response) => {
        this.loading.set(false);
        console.log('¡Registro exitoso!', response);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading.set(false);
        console.error('Detalle del rechazo:', err);

        if (err.error && err.error.mensaje) {
          this.error.set(err.error.mensaje);
        } else if (err.error && err.error.message) {
          this.error.set(err.error.message);
        } else {
          this.error.set('Error interno en el servidor (500). Revisa la consola del backend.');
        }
      }
    });
  }

  private parseReferido(value: string): number | null {
    const match = value.trim().match(/(\d+)$/);
    return match ? Number(match[1]) : null;
  }
} // <--- Cierre de la clase RegisterPage

// ¡Función pura externa para evitar errores de inicialización (Hoisting)!
function validarMayoriaEdad(control: any) {
  if (!control.value) return null;

  const fechaInput = new Date(control.value.replace(/-/g, '\/'));
  const hoy = new Date();

  let edad = hoy.getFullYear() - fechaInput.getFullYear();
  const mes = hoy.getMonth() - fechaInput.getMonth();

  if (mes < 0 || (mes === 0 && hoy.getDate() < fechaInput.getDate())) {
    edad--;
  }

  return edad >= 18 ? null : { menorDeEdad: true };
}