import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { Perfil } from '../../core/models/api.models';
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
        <h2>Perfiles</h2><p class="qf-muted">Administra perfiles adultos e infantiles de tu cuenta.</p>
        <div class="qf-form-row form"><input [(ngModel)]="nombre" placeholder="Nombre del perfil"/><select [(ngModel)]="tipoPerfil"><option value="ADULTO">Adulto</option><option value="INFANTIL">Infantil</option></select></div>
        <div class="qf-actions"><qf-button (clicked)="crear()">Crear perfil</qf-button></div>
      </qf-card>
      <div class="qf-grid qf-grid-3">
        @for (p of perfiles(); track p.id) {
          <qf-card tone="flat">
            <div class="profile-head"><div class="avatar">{{ p.nombre[0] }}</div><qf-badge [tone]="p.tipoPerfil === 'INFANTIL' ? 'warning' : 'blue'">{{ p.tipoPerfil }}</qf-badge></div>
            <h3>{{ p.nombre }}</h3><p class="qf-muted">{{ p.avatar }}</p>
            <div class="qf-actions"><qf-button variant="danger" (clicked)="eliminar(p.id)">Eliminar</qf-button></div>
          </qf-card>
        }
      </div>
    </section>
  `,
  styles: [`
    h2 { margin: 0; font-size: 2rem; letter-spacing: -.04em; } .form { margin: 18px 0; }
    input, select { width: 100%; border: 1px solid var(--qf-line); border-radius: 16px; padding: 13px 14px; color: var(--qf-text); background: #11111a; outline: none; }
    .profile-head { display: flex; justify-content: space-between; align-items: center; }
    .avatar { width: 70px; height: 70px; border-radius: 24px; display: grid; place-items: center; background: linear-gradient(135deg, var(--qf-blue), var(--qf-blue-2)); font-size: 2rem; font-weight: 950; }
  `]
})
export class ProfilesPage implements OnInit {
  perfiles = signal<Perfil[]>([]); nombre = ''; tipoPerfil = 'ADULTO';
  constructor(private auth: AuthService, private data: DataService, private toast: ToastService) {}
  ngOnInit(): void { this.cargar(); }
  cargar(): void { const id = this.auth.currentUser()?.id; if (id) this.data.perfiles(id).subscribe(v => this.perfiles.set(v)); }
  crear(): void { const id = this.auth.currentUser()?.id; if (!id || !this.nombre.trim()) return; this.data.crearPerfil(id, { nombre: this.nombre, avatar: `avatar-${Date.now()}.png`, tipoPerfil: this.tipoPerfil }).subscribe({ next: () => { this.toast.show('Perfil creado', 'success'); this.nombre=''; this.cargar(); }, error: () => this.toast.show('No se pudo crear el perfil', 'error') }); }
  eliminar(id: number): void { if (!confirm('¿Eliminar este perfil?')) return; this.data.eliminarPerfil(id).subscribe({ next: () => { this.toast.show('Perfil eliminado', 'success'); this.cargar(); }, error: () => this.toast.show('No se pudo eliminar el perfil', 'error') }); }
}
