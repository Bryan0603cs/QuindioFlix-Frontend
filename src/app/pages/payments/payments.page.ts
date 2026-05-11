import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../core/services/data.service';
import { Pago } from '../../core/models/api.models';
import { formatMoney } from '../../core/utils/poster.util';
import { ToastService } from '../../core/services/toast.service';
import { QfCardComponent } from '../../shared/atoms/qf-card/qf-card.component';
import { QfButtonComponent } from '../../shared/atoms/qf-button/qf-button.component';
import { QfBadgeComponent } from '../../shared/atoms/qf-badge/qf-badge.component';

@Component({
  standalone: true,
  imports: [FormsModule, QfCardComponent, QfButtonComponent, QfBadgeComponent],
  template: `
    <section class="qf-page">
      <qf-card>
        <h2>Pagos</h2><p class="qf-muted">Registra pagos y revisa historial desde Oracle.</p>
        <div class="qf-form-row"><select [(ngModel)]="metodo"><option value="PSE">PSE</option><option value="TARJETA_CREDITO">Tarjeta crédito</option><option value="TARJETA_DEBITO">Tarjeta débito</option><option value="NEQUI">Nequi</option><option value="DAVIPLATA">Daviplata</option></select><input [(ngModel)]="referencia" placeholder="Referencia" /></div>
        <qf-button (clicked)="pagar()">Registrar pago</qf-button>
      </qf-card>
      <qf-card tone="flat">
        <table><thead><tr><th>ID</th><th>Fecha</th><th>Monto</th><th>Método</th><th>Estado</th></tr></thead><tbody>@for (p of pagos(); track p.id) { <tr><td>{{ p.id }}</td><td>{{ p.fechaPago }}</td><td>{{ money(p.monto) }}</td><td>{{ p.metodoPago }}</td><td><qf-badge [tone]="p.estadoPago === 'EXITOSO' ? 'success' : 'warning'">{{ p.estadoPago }}</qf-badge></td></tr> }</tbody></table>
      </qf-card>
    </section>
  `,
  styles: [`
    h2 { margin: 0; font-size: 2rem; letter-spacing: -.04em; }
    select, input { width: 100%; border: 1px solid var(--qf-line); border-radius: 16px; padding: 13px 14px; color: var(--qf-text); background: #11111a; outline: none; margin: 14px 0; }
    table { width: 100%; border-collapse: collapse; } th, td { padding: 13px 10px; border-bottom: 1px solid var(--qf-line); text-align: left; } th { color: var(--qf-muted); }
  `]
})
export class PaymentsPage implements OnInit {
  pagos = signal<Pago[]>([]); metodo = 'PSE'; referencia = `PAGO-FRONT-${Date.now()}`; money = formatMoney;
  constructor(private data: DataService, private toast: ToastService) {}
  ngOnInit(): void { this.cargar(); }
  cargar(): void { this.data.pagos({ page: 0, size: 20, sort: 'id,desc' }).subscribe(p => this.pagos.set(p.content)); }
  pagar(): void { this.data.registrarPago({ metodoPago: this.metodo, referencia: this.referencia }).subscribe({ next: () => { this.toast.show('Pago registrado', 'success'); this.referencia = `PAGO-FRONT-${Date.now()}`; this.cargar(); }, error: () => this.toast.show('No se pudo registrar el pago', 'error') }); }
}
