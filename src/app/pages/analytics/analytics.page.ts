import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { DataService } from '../../core/services/data.service';
import { ToastService } from '../../core/services/toast.service';
import { QfCardComponent } from '../../shared/atoms/qf-card/qf-card.component';
import { QfButtonComponent } from '../../shared/atoms/qf-button/qf-button.component';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [FormsModule, QfCardComponent, QfButtonComponent],
  template: `
    <section class="qf-page">
      <header class="page-header">
        <h1>Dashboard de Analítica QuindioFlix</h1>
        <div class="filters-panel">
          <select [(ngModel)]="ciudad">
            <option value="">Todas las ciudades</option>
            @for(c of ciudades; track c){ <option [value]="c">{{c}}</option> }
          </select>
          <select [(ngModel)]="genero">
            <option value="">Todos los géneros</option>
            @for(g of generos; track g){ <option [value]="g">{{g}}</option> }
          </select>
          <input type="number" [(ngModel)]="mes" min="1" max="12" placeholder="Mes"/>
          <input type="number" [(ngModel)]="anio" min="2020" max="2026" placeholder="Año"/>

          <div class="actions">
            <qf-button (clicked)="cargar()">Generar Reporte</qf-button>
            <qf-button (clicked)="resetear()" style="background: #444;">Reporte General</qf-button>
          </div>
        </div>
      </header>

      <div class="bento-grid">
        <qf-card class="card-large">
          <h3>Ingresos por Suscripción (Análisis de datos)</h3>
          @for(i of ingresos(); track i.plan) {
            <div class="stat-row">
              <span>{{i.plan}}</span>
              <div class="progress-bg"><div class="progress-bar" [style.width.%]="(i.total/maxIngreso)*100"></div></div>
              <strong>$ {{i.total.toLocaleString()}}</strong>
            </div>
          }
        </qf-card>

        <qf-card class="card-small">
          <h3>Promedio por Género</h3>
          <div class="kpi-container">
            @for(c of calificaciones(); track c.categoria) {
              <div class="kpi-card">
                <span class="kpi-value">{{c.promedio.toFixed(1)}}</span>
                <span class="kpi-label">{{c.categoria}}</span>
              </div>
            }
          </div>
        </qf-card>

        <qf-card class="card-full">
          <h3>Top Contenido (Resultados de consulta avanzada)</h3>
          <table class="modern-table">
            <thead><tr><th>Título</th><th>Reproducciones</th></tr></thead>
            <tbody>
              @for(t of top(); track t.contenidoId) {
                <tr><td>{{t.titulo}}</td><td>{{t.reproducciones}}</td></tr>
              }
            </tbody>
          </table>
        </qf-card>
      </div>
    </section>
  `,
  styles: [`
    .filters-panel { display: flex; gap: 10px; background: #1a1a1a; padding: 20px; border-radius: 12px; align-items: center; flex-wrap: wrap; }
    .actions { display: flex; gap: 8px; margin-left: auto; }
    .bento-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-top: 20px; }
    .card-full { grid-column: span 2; }
    .stat-row { display: grid; grid-template-columns: 100px 1fr 120px; gap: 15px; align-items: center; margin: 15px 0; }
    .progress-bg { height: 10px; background: #333; border-radius: 5px; overflow: hidden; }
    .progress-bar { height: 100%; background: var(--qf-blue); transition: width 0.5s; }
    .kpi-container { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px; }
    .kpi-card { background: #222; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #333; }
    .kpi-value { display: block; font-size: 1.5rem; font-weight: bold; color: var(--qf-blue); }
    .kpi-label { font-size: 0.7rem; color: #888; text-transform: uppercase; }
    .modern-table { width: 100%; border-collapse: collapse; }
    .modern-table td { padding: 15px; border-bottom: 1px solid #333; }
    select, input { padding: 10px; background: #222; color: white; border: 1px solid #444; border-radius: 4px; }
  `]
})
export class AnalyticsPage implements OnInit {
  ciudades = ['Armenia', 'Calarcá', 'Circasia', 'Montenegro', 'Quimbaya'];
  generos = ['Acción', 'Comedia', 'Drama', 'Suspenso', 'Romance', 'Ciencia Ficción', 'Terror', 'Documental', 'Infantil'];

  ciudad = ''; genero = ''; mes = 5; anio = 2026;

  top = signal<any[]>([]);
  ingresos = signal<any[]>([]);
  calificaciones = signal<any[]>([]);
  maxIngreso = 1;

  constructor(private data: DataService, private toast: ToastService) {}

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    // Si los filtros son vacíos, el backend debería entender que es un Reporte General
    forkJoin({
      top: this.data.topContenidoCiudad(this.ciudad || 'TODOS'),
      ingresos: this.data.ingresosPlan(this.mes, this.anio),
      calificaciones: this.data.calificacionGenero(this.genero || 'TODOS')
    }).subscribe({
      next: (res) => {
        this.top.set(res.top);
        this.ingresos.set(res.ingresos);
        this.calificaciones.set(res.calificaciones);
        this.maxIngreso = res.ingresos.length > 0 ? Math.max(...res.ingresos.map(i => i.total)) : 1;
      },
      error: () => this.toast.show('Error al procesar consulta avanzada', 'error')
    });
  }

  resetear(): void {
    this.ciudad = ''; this.genero = ''; this.mes = 5; this.anio = 2026;
    this.cargar();
    this.toast.show('Reporte general aplicado', 'info');
  }
}