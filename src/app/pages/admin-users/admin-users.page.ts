import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../core/services/data.service';
import { Usuario } from '../../core/models/api.models';
import { ToastService } from '../../core/services/toast.service';
import { QfCardComponent } from '../../shared/atoms/qf-card/qf-card.component';
import { QfButtonComponent } from '../../shared/atoms/qf-button/qf-button.component';
import { QfBadgeComponent } from '../../shared/atoms/qf-badge/qf-badge.component';

@Component({
  standalone: true,
  imports: [FormsModule, QfCardComponent, QfButtonComponent, QfBadgeComponent],
  template: `
    <section class="qf-page">
      <qf-card><h2>Administración de usuarios</h2><div class="filters"><select [(ngModel)]="rol"><option value="">Todos los roles</option><option>CLIENTE</option><option>MODERADOR</option><option>CONTENIDO</option><option>ADMIN</option></select><select [(ngModel)]="estado"><option value="">Todos los estados</option><option>ACTIVO</option><option>INACTIVO</option><option>SUSPENDIDO</option></select><input [(ngModel)]="ciudad" placeholder="Ciudad"/><qf-button (clicked)="cargar()">Filtrar</qf-button></div></qf-card>
      <qf-card tone="flat"><table><thead><tr><th>ID</th><th>Nombre</th><th>Email</th><th>Ciudad</th><th>Plan</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>@for (u of usuarios(); track u.id) { <tr><td>{{ u.id }}</td><td>{{ u.nombre }}</td><td>{{ u.email }}</td><td>{{ u.ciudad }}</td><td>{{ u.plan }}</td><td><qf-badge tone="blue">{{ u.rol }}</qf-badge></td><td><qf-badge [tone]="u.estadoCuenta === 'ACTIVO' ? 'success' : 'warning'">{{ u.estadoCuenta }}</qf-badge></td><td><div class="qf-actions"><button (click)="estadoUsuario(u)">Estado</button><button (click)="rolUsuario(u)">Rol</button></div></td></tr> }</tbody></table></qf-card>
    </section>
  `,
  styles: [`
    h2 { margin:0 0 16px; font-size:2rem; letter-spacing:-.04em; } .filters { display:grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap:12px; }
    input, select, button { border:1px solid var(--qf-line); border-radius:14px; padding:10px 12px; color:var(--qf-text); background:#11111a; }
    table { width:100%; border-collapse: collapse; } th,td { padding:12px 8px; border-bottom:1px solid var(--qf-line); text-align:left; } th { color:var(--qf-muted); }
    @media(max-width:900px){ .filters{ grid-template-columns:1fr; } table{font-size:.85rem;} }
  `]
})
export class AdminUsersPage implements OnInit {
  usuarios = signal<Usuario[]>([]); rol=''; estado=''; ciudad='';
  constructor(private data: DataService, private toast: ToastService) {}
  ngOnInit(): void { this.cargar(); }
  cargar(): void { this.data.usuarios({ rol: this.rol, estado: this.estado, ciudad: this.ciudad, page: 0, size: 30, sort: 'id,asc' }).subscribe(v => this.usuarios.set(v.content)); }
  estadoUsuario(u: Usuario): void { const estadoCuenta = u.estadoCuenta === 'ACTIVO' ? 'SUSPENDIDO' : 'ACTIVO'; this.data.cambiarEstadoUsuario(u.id, estadoCuenta).subscribe({ next: () => { this.toast.show('Estado actualizado','success'); this.cargar(); }, error: () => this.toast.show('No fue posible cambiar estado','error') }); }
  rolUsuario(u: Usuario): void { const nuevo = prompt('Nuevo rol: CLIENTE, MODERADOR, CONTENIDO, ADMIN', u.rol); if (!nuevo) return; this.data.cambiarRolUsuario(u.id, nuevo).subscribe({ next: () => { this.toast.show('Rol actualizado','success'); this.cargar(); }, error: () => this.toast.show('No fue posible cambiar rol','error') }); }
}
