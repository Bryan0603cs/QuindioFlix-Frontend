import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../core/services/data.service';
import { Usuario } from '../../core/models/api.models';
import { ToastService } from '../../core/services/toast.service';
import { QfCardComponent } from '../../shared/atoms/qf-card/qf-card.component';
import { QfButtonComponent } from '../../shared/atoms/qf-button/qf-button.component';
import { QfBadgeComponent } from '../../shared/atoms/qf-badge/qf-badge.component';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [FormsModule, QfCardComponent, QfButtonComponent, QfBadgeComponent],
  template: `
    <section class="qf-page">
      <qf-card>
        <div class="qf-page-header">
          <div>
            <p class="qf-kicker">Acceso y roles</p>
            <h2>Administración de usuarios</h2>
          </div>
        </div>
        <div class="filters">
          <select [(ngModel)]="rol">
            <option value="">Todos los roles</option>
            <option value="CLIENTE">CLIENTE</option>
            <option value="MODERADOR">MODERADOR</option>
            <option value="CONTENIDO">MODERADOR DE CONTENIDO</option>
            <option value="ADMIN">ADMIN</option>
          </select>
          <select [(ngModel)]="estado">
            <option value="">Todos los estados</option>
            <option value="ACTIVO">ACTIVO</option>
            <option value="INACTIVO">INACTIVO</option>
            <option value="SUSPENDIDO">SUSPENDIDO</option>
          </select>
          <input [(ngModel)]="ciudad" placeholder="Ciudad" />
          <qf-button (clicked)="cargar(true)">Filtrar</qf-button>
        </div>
      </qf-card>

      <qf-card tone="flat" style="margin-top: 24px;">
        <div class="qf-table-wrap">
          <table class="qf-table">
            <thead>
            <tr><th>ID</th><th>Nombre</th><th>Email</th><th>Ciudad</th><th>Plan</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              @for (u of usuarios(); track u.id) {
                <tr>
                  <td>{{ u.id }}</td>
                  <td><strong>{{ u.nombre }}</strong></td>
                  <td>{{ u.email }}</td>
                  <td>{{ u.ciudad }}</td>
                  <td>{{ u.plan }}</td>
                  <td>
                    <select class="qf-role-select" [ngModel]="u.rol" (ngModelChange)="cambiarRol(u, $event)">
                      <option value="CLIENTE">CLIENTE</option>
                      <option value="MODERADOR">MODERADOR</option>
                      <option value="CONTENIDO">MODERADOR DE CONTENIDO</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td>
                    <qf-badge [tone]="u.estadoCuenta === 'ACTIVO' ? 'success' : 'warning'">
                      {{ u.estadoCuenta }}
                    </qf-badge>
                  </td>
                  <td>
                    <div class="qf-actions">
                      <button (click)="estadoUsuario(u)">{{ u.estadoCuenta === 'ACTIVO' ? 'Suspender' : 'Activar' }}</button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        @if (!esUltimaPagina()) {
          <div class="qf-load-more">
            <qf-button variant="ghost" (clicked)="cargarMas()">Cargar más usuarios</qf-button>
          </div>
        }
      </qf-card>
    </section>
  `,
  styles: [`
    .filters { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-top: 18px; }
    input, select, button { border: 1px solid var(--qf-line); border-radius: 8px; padding: 10px 12px; color: var(--qf-text); background: var(--qf-black-3); }

    /* Estilo elegante para el selector de roles */
    .qf-role-select {
      appearance: none;
      background: var(--qf-black-3);
      border: 1px solid var(--qf-line);
      color: var(--qf-text);
      padding: 6px 12px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.85rem;
      width: 100%;
      outline: none;
    }
    .qf-role-select:focus { border-color: var(--qf-blue); }
    .qf-role-select option { background: var(--qf-black-3); color: var(--qf-text); padding: 10px; }

    .qf-load-more { display: flex; justify-content: center; padding-top: 20px; }
    @media(max-width: 900px) { .filters { grid-template-columns: 1fr; } }
  `]
})
export class AdminUsersPage implements OnInit {
  usuarios = signal<Usuario[]>([]);
  pagina = 0;
  esUltimaPagina = signal<boolean>(false);
  rol = ''; estado = ''; ciudad = '';

  constructor(private data: DataService, private toast: ToastService) {}

  ngOnInit(): void { this.cargar(true); }

  cargar(reset = false): void {
    if (reset) this.pagina = 0;
    this.data.usuarios({ rol: this.rol, estado: this.estado, ciudad: this.ciudad, page: this.pagina, size: 20, sort: 'id,asc' })
        .subscribe(v => {
          if (reset) this.usuarios.set(v.content);
          else this.usuarios.update(prev => [...prev, ...v.content]);
          this.esUltimaPagina.set(v.last);
        });
  }

  cargarMas(): void { this.pagina++; this.cargar(); }

  estadoUsuario(u: Usuario): void {
    const nuevoEstado = u.estadoCuenta === 'ACTIVO' ? 'SUSPENDIDO' : 'ACTIVO';
    this.data.cambiarEstadoUsuario(u.id, nuevoEstado).subscribe({
      next: () => { this.toast.show('Estado actualizado', 'success'); this.cargar(true); },
      error: () => this.toast.show('Error al actualizar', 'error')
    });
  }

  cambiarRol(u: Usuario, nuevoRol: string): void {
    this.data.cambiarRolUsuario(u.id, nuevoRol).subscribe({
      next: () => {
        this.toast.show('Rol actualizado correctamente', 'success');
        this.cargar(true);
      },
      error: () => this.toast.show('No fue posible cambiar rol', 'error')
    });
  }
}