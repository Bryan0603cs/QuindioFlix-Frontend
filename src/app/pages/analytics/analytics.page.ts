import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../core/services/data.service';
import { CalificacionCategoria, IngresoPlan, TopContenido } from '../../core/models/api.models';
import { formatMoney } from '../../core/utils/poster.util';
import { ToastService } from '../../core/services/toast.service';
import { QfCardComponent } from '../../shared/atoms/qf-card/qf-card.component';
import { QfButtonComponent } from '../../shared/atoms/qf-button/qf-button.component';

@Component({
  standalone: true,
  imports: [FormsModule, QfCardComponent, QfButtonComponent],
  template: `
    <section class="qf-page">
      <qf-card><h2>Analítica</h2><p class="qf-muted">Reportes gerenciales de consumo, ingresos y calificación.</p><div class="filters"><input [(ngModel)]="ciudad" placeholder="Ciudad"/><input [(ngModel)]="genero" placeholder="Género"/><input [(ngModel)]="mes" type="number"/><input [(ngModel)]="anio" type="number"/><qf-button (clicked)="cargar()">Actualizar</qf-button></div></qf-card>
      <div class="qf-grid qf-grid-3"><qf-card tone="flat"><h3>Top por ciudad</h3>@for(t of top(); track t.contenidoId){<div class="bar"><span>{{ t.titulo }}</span><strong>{{ t.reproducciones }}</strong></div>}</qf-card><qf-card tone="flat"><h3>Ingresos por plan</h3>@for(i of ingresos(); track i.plan){<div class="bar"><span>{{ i.plan }}</span><strong>{{ money(i.total) }}</strong></div>}</qf-card><qf-card tone="flat"><h3>Calificación por género</h3>@for(c of calificaciones(); track c.categoria){<div class="bar"><span>{{ c.categoria }}</span><strong>{{ c.promedio }}</strong></div>}</qf-card></div>
      <div class="qf-actions"><qf-button variant="ghost" (clicked)="popularidad()">Actualizar popularidad</qf-button><qf-button variant="ghost" (clicked)="vencidas()">Desactivar vencidas</qf-button></div>
    </section>
  `,
  styles: [`h2{margin:0;font-size:2rem;letter-spacing:-.04em}.filters{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;margin-top:18px}input{width:100%;border:1px solid var(--qf-line);border-radius:16px;padding:13px 14px;color:var(--qf-text);background:#11111a;outline:none}.bar{display:flex;justify-content:space-between;gap:12px;padding:11px 0;border-bottom:1px solid var(--qf-line);color:var(--qf-muted)}.bar strong{color:var(--qf-text)}@media(max-width:900px){.filters{grid-template-columns:1fr}}`]
})
export class AnalyticsPage implements OnInit {
  ciudad='Armenia'; genero='Acción'; mes=new Date().getMonth()+1; anio=new Date().getFullYear();
  top=signal<TopContenido[]>([]); ingresos=signal<IngresoPlan[]>([]); calificaciones=signal<CalificacionCategoria[]>([]); money=formatMoney;
  constructor(private data: DataService, private toast: ToastService) {}
  ngOnInit(): void { this.cargar(); }
  cargar(): void { this.data.topContenidoCiudad(this.ciudad,10).subscribe(v=>this.top.set(v)); this.data.ingresosPlan(this.mes,this.anio).subscribe({next:v=>this.ingresos.set(v), error:()=>this.ingresos.set([])}); this.data.calificacionGenero(this.genero).subscribe(v=>this.calificaciones.set(v)); }
  popularidad(): void { this.data.actualizarPopularidad().subscribe({next:()=>this.toast.show('Popularidad actualizada','success'), error:()=>this.toast.show('No fue posible actualizar','error')}); }
  vencidas(): void { this.data.desactivarVencidas().subscribe({next:()=>this.toast.show('Cuentas vencidas procesadas','success'), error:()=>this.toast.show('No fue posible procesar cuentas','error')}); }
}
