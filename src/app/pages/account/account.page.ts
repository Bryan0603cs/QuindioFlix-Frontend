import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { Pago, Perfil, Plan, Usuario } from '../../core/models/api.models';
import { formatMoney } from '../../core/utils/poster.util';
import { ToastService } from '../../core/services/toast.service';
import { QfBadgeComponent } from '../../shared/atoms/qf-badge/qf-badge.component';
import { QfButtonComponent } from '../../shared/atoms/qf-button/qf-button.component';
import { QfCardComponent } from '../../shared/atoms/qf-card/qf-card.component';
import { ModalComponent } from '../../shared/molecules/modal/modal.component';
import { PlanCardComponent } from '../../shared/molecules/plan-card/plan-card.component';

type Tab = 'datos' | 'suscripcion' | 'pagos' | 'referidos' | 'perfiles';

@Component({
  standalone: true,
  imports: [FormsModule, QfBadgeComponent, QfButtonComponent, QfCardComponent, ModalComponent, PlanCardComponent],
  template: `
    <section class="qf-page">
      <div class="tabs">
        @for (item of tabs; track item.id) { <button [class.active]="tab() === item.id" (click)="tab.set(item.id)">{{ item.label }}</button> }
      </div>

      @if (tab() === 'datos') {
        <qf-card>
          <h2>Datos personales</h2>
          <div class="qf-form-row">
            <input [(ngModel)]="form.nombre" placeholder="Nombre" />
            <input [(ngModel)]="form.email" placeholder="Email" />
            <input [(ngModel)]="form.telefono" placeholder="Teléfono" />
            <input [(ngModel)]="form.ciudad" placeholder="Ciudad" />
          </div>
          <qf-button (clicked)="guardarDatos()">Guardar</qf-button>
        </qf-card>
      }

      @if (tab() === 'suscripcion') {
        <qf-card>
          <h2>Suscripción</h2>
          <p>Estado <qf-badge [tone]="usuario()?.estadoCuenta === 'ACTIVO' ? 'success' : 'warning'">{{ usuario()?.estadoCuenta }}</qf-badge></p>
          <div class="qf-grid qf-grid-3">
            @for (plan of planes(); track plan.id) {
              <button class="plan-button" (click)="cambiarPlan(plan)">
                <qf-plan-card [plan]="plan" [seleccionado]="plan.id === usuario()?.planId" [recomendado]="plan.nombre === 'Premium'" />
              </button>
            }
          </div>
        </qf-card>
      }

      @if (tab() === 'pagos') {
        <qf-card>
          <div class="qf-page-header"><h2>Pagos</h2><qf-button (clicked)="modalPago.set(true)">Registrar pago</qf-button></div>
          <p class="qf-muted">Próximo pago estimado: {{ money(proximoPago()) }} @if (descuentoReferido() > 0) { · descuento referido {{ descuentoReferido() }}% aplicado }</p>
          <div class="qf-table-wrap"><table class="qf-table"><thead><tr><th>Fecha</th><th>Monto</th><th>Método</th><th>Estado</th></tr></thead><tbody>@for (p of pagos(); track p.id) { <tr><td>{{ p.fechaPago }}</td><td>{{ money(p.monto) }}</td><td>{{ p.metodoPago }}</td><td><qf-badge [tone]="p.estadoPago === 'EXITOSO' ? 'success' : 'warning'">{{ p.estadoPago }}</qf-badge></td></tr> }</tbody></table></div>
        </qf-card>
      }

      @if (tab() === 'referidos') {
        <qf-card>
          <h2>Referidos</h2>
          <p class="share">{{ codigoReferido() }}</p>
          <p class="qf-muted">{{ linkReferido() }}</p>
          <p class="qf-muted">Comparte tu código o link. Descuento activo: {{ descuentoReferido() > 0 ? 'sí' : 'no' }}</p>
          @for (u of referidos(); track u.id) { <p>{{ u.nombre }} · {{ u.email }}</p> } @empty { <p class="qf-muted">Aún no tienes usuarios referidos.</p> }
        </qf-card>
      }

      @if (tab() === 'perfiles') {
        <qf-card>
          <h2>Perfiles</h2>
          <p class="qf-muted">{{ perfiles().length }} de {{ planActual()?.maxPerfiles || 5 }} perfiles usados.</p>
          @for (p of perfiles(); track p.id) { <div class="profile-row"><span>{{ p.nombre }} · {{ p.tipoPerfil }}</span><qf-button variant="danger" (clicked)="eliminarPerfil(p)">Eliminar</qf-button></div> }
        </qf-card>
      }
    </section>

    <qf-modal [open]="modalPago()" titulo="Registrar pago" (closed)="modalPago.set(false)">
      <div class="modal-form">
        <select [(ngModel)]="metodoPago">
          <option value="TARJETA_CREDITO">Tarjeta crédito</option>
          <option value="TARJETA_DEBITO">Tarjeta débito</option>
          <option value="PSE">PSE</option>
          <option value="NEQUI">Nequi</option>
          <option value="DAVIPLATA">Daviplata</option>
        </select>
        <qf-button (clicked)="registrarPago()">Confirmar</qf-button>
      </div>
    </qf-modal>
  `,
  styles: [`
    .tabs { display: flex; gap: 8px; flex-wrap: wrap; }
    .tabs button, .plan-button { border: 0; background: transparent; padding: 0; color: inherit; text-align: left; }
    .tabs button { border: 1px solid var(--qf-line); border-radius: 999px; padding: 8px 12px; color: var(--qf-muted); background: var(--qf-black-3); }
    .tabs button.active { color: var(--qf-highlight); border-color: var(--qf-blue); }
    input, select { width: 100%; border: 1px solid var(--qf-line); border-radius: 8px; padding: 13px; color: var(--qf-text); background: var(--qf-black-3); outline: none; }
    h2 { margin: 0 0 14px; }
    .share { font-family: "Space Mono", monospace; color: var(--qf-highlight); font-size: 1.2rem; }
    .profile-row, .modal-form { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-top: 10px; flex-wrap: wrap; }
  `]
})
export class AccountPage implements OnInit {
  tabs: Array<{ id: Tab; label: string }> = [
    { id: 'datos', label: 'Datos personales' },
    { id: 'suscripcion', label: 'Suscripción' },
    { id: 'pagos', label: 'Pagos' },
    { id: 'referidos', label: 'Referidos' },
    { id: 'perfiles', label: 'Perfiles' }
  ];
  tab = signal<Tab>('datos');
  usuario = signal<Usuario | null>(null);
  planes = signal<Plan[]>([]);
  pagos = signal<Pago[]>([]);
  referidos = signal<Usuario[]>([]);
  perfiles = signal<Perfil[]>([]);
  modalPago = signal(false);
  metodoPago = 'PSE';
  form = { nombre: '', email: '', telefono: '', ciudad: '' };
  money = formatMoney;

  constructor(private auth: AuthService, private data: DataService, private toast: ToastService) {}

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    const user = this.auth.currentUser();
    if (!user) return;
    this.usuario.set(user);
    this.form = { nombre: user.nombre, email: user.email, telefono: user.telefono, ciudad: user.ciudad };
    this.data.planes().subscribe(v => this.planes.set(v));
    this.data.pagos({ usuarioId: user.id, page: 0, size: 20, sort: 'fechaPago,desc' }).subscribe(v => this.pagos.set(v.content));
    this.data.referidos(user.id).subscribe(v => this.referidos.set(v));
    this.data.perfiles(user.id).subscribe(v => this.perfiles.set(v));
  }

  planActual(): Plan | undefined {
    return this.planes().find(plan => plan.id === this.usuario()?.planId);
  }

  descuentoReferido(): number {
    return this.usuario()?.referidoPorId ? 10 : 0;
  }

  proximoPago(): number {
    const base = this.planActual()?.precioMensual || 0;
    return Math.max(0, base - (base * this.descuentoReferido() / 100));
  }

  codigoReferido(): string {
    return `QF-${this.usuario()?.id ?? 'USUARIO'}`;
  }

  linkReferido(): string {
    return `${location.origin}/registro?ref=${this.codigoReferido()}`;
  }

  guardarDatos(): void {
    const current = this.usuario();
    if (!current) return;
    const updated = { ...current, ...this.form };
    this.data.actualizarUsuario(current.id, this.form).subscribe({
      next: user => {
        this.auth.refreshUser(user);
        this.usuario.set(user);
        this.toast.show('Datos actualizados', 'success');
      },
      error: () => {
        this.auth.refreshUser(updated);
        this.usuario.set(updated);
        this.toast.show('Datos guardados en la sesión local; el backend no aceptó la edición.', 'info');
      }
    });
  }

  cambiarPlan(plan: Plan): void {
    const user = this.usuario();
    if (!user || plan.id === user.planId) return;
    if (this.perfiles().length > plan.maxPerfiles) {
      this.toast.show(`No puedes cambiar a ${plan.nombre}: permite máximo ${plan.maxPerfiles} perfiles.`, 'error');
      return;
    }
    this.data.cambiarPlan(user.id, { nuevoPlanId: plan.id, motivo: 'Cambio desde frontend' }).subscribe(updated => {
      this.auth.refreshUser(updated);
      this.usuario.set(updated);
      this.toast.show('Plan actualizado', 'success');
    });
  }

  registrarPago(): void {
    this.data.registrarPago({ metodoPago: this.metodoPago, referencia: `PAGO-FRONT-${Date.now()}` }).subscribe({
      next: () => { this.modalPago.set(false); this.toast.show('Pago registrado', 'success'); this.cargar(); },
      error: () => this.toast.show('No se pudo registrar el pago', 'error')
    });
  }

  eliminarPerfil(perfil: Perfil): void {
    if (!confirm(`¿Eliminar el perfil ${perfil.nombre}?`)) return;
    this.data.eliminarPerfil(perfil.id).subscribe({ next: () => this.cargar() });
  }
}
