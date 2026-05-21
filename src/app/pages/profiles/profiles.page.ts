import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { Perfil, Plan } from '../../core/models/api.models';
import { ToastService } from '../../core/services/toast.service';
import { QfCardComponent } from '../../shared/atoms/qf-card/qf-card.component';
import { QfButtonComponent } from '../../shared/atoms/qf-button/qf-button.component';
import { QfBadgeComponent } from '../../shared/atoms/qf-badge/qf-badge.component';
import { PerfilAvatarComponent } from '../../shared/molecules/perfil-avatar/perfil-avatar.component';

@Component({
  standalone: true,
  imports: [FormsModule, QfCardComponent, QfButtonComponent, QfBadgeComponent, PerfilAvatarComponent],
  template: `
    <section class="qf-page">
      <qf-card>
        <h2>Perfiles</h2>
        <p class="qf-muted">Elige quién va a ver QuindioFlix o administra los perfiles de tu cuenta.</p>
        <p class="limit">Plan {{ auth.currentUser()?.plan || '-' }} · {{ perfiles().length }} de {{ limitePerfiles() }} perfiles</p>
        <div class="qf-form-row form">
          <input [(ngModel)]="nombre" placeholder="Nombre del perfil"/>
          <select [(ngModel)]="tipoPerfil">
            <option value="ADULTO">Adulto</option>
            <option value="INFANTIL">Infantil</option>
          </select>
        </div>
        @if (perfiles().length >= limitePerfiles()) {
          <div class="qf-error">Tu plan no permite crear más perfiles.</div>
        }
        <div class="qf-actions">
          <qf-button [disabled]="perfiles().length >= limitePerfiles()" (clicked)="crear()">Crear perfil</qf-button>
          <qf-button variant="ghost" (clicked)="auth.logout()">Cerrar sesión</qf-button>
        </div>
      </qf-card>

      <div class="qf-grid qf-grid-3">
        @for (p of perfiles(); track p.id) {
          <qf-card tone="flat">
            <div class="profile-head">
              <qf-perfil-avatar [nombre]="p.nombre" [tipo]="p.tipoPerfil" />
              <qf-badge [tone]="p.tipoPerfil === 'INFANTIL' ? 'warning' : 'blue'">{{ p.tipoPerfil }}</qf-badge>
            </div>
            <h3>{{ p.nombre }}</h3>
            <p class="qf-muted">{{ p.avatar }}</p>
            <div class="qf-actions">
              <qf-button (clicked)="seleccionar(p)">Entrar</qf-button>
              <qf-button variant="danger" (clicked)="eliminar(p.id)">Eliminar</qf-button>
            </div>
          </qf-card>
        }
      </div>
    </section>
  `,
  styles: [`
    h2 { margin: 0; font-size: 2rem; }
    .form { margin: 18px 0; }
    input, select { width: 100%; border: 1px solid var(--qf-line); border-radius: 8px; padding: 13px 14px; color: var(--qf-text); background: var(--qf-black-3); outline: none; }
    .profile-head { display: flex; justify-content: space-between; align-items: center; }
    .limit { color: var(--qf-highlight); font-family: "Space Mono", monospace; font-size: .78rem; }
  `]
})
export class ProfilesPage implements OnInit {
  perfiles = signal<Perfil[]>([]);
  planes = signal<Plan[]>([]);
  nombre = '';
  tipoPerfil = 'ADULTO';

  constructor(public auth: AuthService, private data: DataService, private toast: ToastService, private router: Router) {}

  ngOnInit(): void {
    this.data.planes().subscribe(v => this.planes.set(v));
    this.cargar();
  }

  cargar(): void {
    const id = this.auth.currentUser()?.id;
    if (id) this.data.perfiles(id).subscribe(v => this.perfiles.set(v));
  }

  limitePerfiles(): number {
    const planId = this.auth.currentUser()?.planId;
    return this.planes().find(plan => plan.id === planId)?.maxPerfiles ?? 5;
  }

  seleccionar(perfil: Perfil): void {
    this.auth.setPerfilActivo(perfil);
    this.router.navigateByUrl('/home');
  }

  crear(): void {
    const id = this.auth.currentUser()?.id;
    if (!id || !this.nombre.trim()) return;
    if (this.perfiles().length >= this.limitePerfiles()) {
      this.toast.show('Tu plan alcanzó el límite de perfiles', 'error');
      return;
    }
    this.data.crearPerfil(id, { nombre: this.nombre, avatar: `avatar-${Date.now()}.png`, tipoPerfil: this.tipoPerfil }).subscribe({
      next: () => { this.toast.show('Perfil creado', 'success'); this.nombre = ''; this.cargar(); },
      error: () => this.toast.show('No se pudo crear el perfil', 'error')
    });
  }

  eliminar(id: number): void {
    if (!confirm('¿Eliminar este perfil?')) return;
    this.data.eliminarPerfil(id).subscribe({
      next: () => { this.toast.show('Perfil eliminado', 'success'); this.cargar(); },
      error: () => this.toast.show('No se pudo eliminar el perfil', 'error')
    });
  }
}
