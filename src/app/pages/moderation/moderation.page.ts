import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin, map, of, switchMap, catchError } from 'rxjs'; // Importamos catchError
import { DataService } from '../../core/services/data.service';
import { Contenido, ReporteContenido, Usuario } from '../../core/models/api.models';
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
        <p class="qf-kicker">Soporte y seguridad</p>
        <h2>Moderador</h2>
        <div class="filters">
          <select [(ngModel)]="estado" (change)="cargar()">
            <option value="">Todos</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="RESUELTO">Resuelto</option>
            <option value="RECHAZADO">Rechazado</option>
          </select>
        </div>
      </qf-card>

      <qf-card tone="flat">
        <div class="qf-table-wrap">
          <table class="qf-table">
            <thead><tr><th>ID</th><th>Contenido</th><th>Usuario</th><th>Descripción</th><th>Fecha</th><th>Estado</th><th>Acción</th></tr></thead>
            <tbody>
              @for (r of reportes(); track r.reporte.id) {
                <tr>
                  <td>#{{ r.reporte.id }}</td>
                  <td>{{ r.contenido?.titulo || ('Contenido ' + r.reporte.contenidoId) }}</td>
                  <td>{{ r.usuario?.nombre || ('Usuario ' + r.reporte.usuarioReportaId) }}</td>
                  <td>{{ r.reporte.descripcion }}</td>
                  <td>{{ r.reporte.fechaReporte }}</td>
                  <td><qf-badge [tone]="r.reporte.estado === 'RESUELTO' ? 'success' : 'warning'">{{ r.reporte.estado }}</qf-badge></td>
                  <td><qf-button [disabled]="r.reporte.estado === 'RESUELTO'" (clicked)="resolver(r.reporte)">Resolver</qf-button></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </qf-card>
    </section>
  `,
  styles: [`
    h2 { margin: 0; font-size: 2rem; }
    .filters { margin-top: 16px; }
    select { border: 1px solid var(--qf-line); border-radius: 8px; padding: 12px; color: var(--qf-text); background: var(--qf-black-3); }
  `]
})
export class ModerationPage implements OnInit {
  reportes = signal<Array<{ reporte: ReporteContenido; contenido: Contenido | null; usuario: Usuario | null }>>([]);
  estado = '';

  constructor(private data: DataService, private toast: ToastService) {}

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    // 💡 Cambiamos 'fechaReporte,desc' por 'id,desc' que sí existe en la estructura de la tabla
    this.data.reportes({ estado: this.estado, page: 0, size: 30, sort: 'id,desc' }).pipe(switchMap(page => {
      const contenidoReqs = page.content.map(r => this.data.contenido(r.contenidoId).pipe(catchError(() => of(null))));
      const usuarioReqs = page.content.map(r => this.data.usuario(r.usuarioReportaId).pipe(catchError(() => of(null))));

      return forkJoin({
        reportes: of(page.content),
        contenidos: contenidoReqs.length ? forkJoin(contenidoReqs) : of([]),
        usuarios: usuarioReqs.length ? forkJoin(usuarioReqs) : of([])
      });
    })).subscribe({
      next: ({ reportes, contenidos, usuarios }) => {
        this.reportes.set(reportes.map((reporte, index) => ({
          reporte,
          contenido: contenidos[index] ?? null,
          usuario: usuarios[index] ?? null
        })));
      },
      error: (err) => console.error("Error al cargar reportes:", err)
    });
  }

  resolver(r: ReporteContenido): void {
    // 1. Validamos que el objeto del reporte venga con su ID real de la base de datos
    if (!r || !r.id) {
      this.toast.show('ID de reporte no válido', 'error');
      return;
    }

    // 2. Creamos el payload exacto que el Record de Java te exige (sin meter datos de más)
    const payload = {
      estado: 'RESUELTO',
      comentarioResolucion: 'Resuelto desde frontend'
    };

    // 3. Invocamos a tu DataService pasando 'r.id' (el id del reporte que entró por parámetro)
    this.data.resolverReporte(r.id, payload).subscribe({
      next: () => {
        this.toast.show('Reporte resuelto con éxito', 'success');
        this.cargar(); // Refresca la tabla automáticamente para ver el cambio de estado
      },
      error: (err) => {
        console.error('Error detallado en la petición PATCH:', err);
        this.toast.show('No fue posible resolver el reporte', 'error');
      }
    });
  }

}