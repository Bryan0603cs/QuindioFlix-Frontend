import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../core/services/data.service';
import { ReporteContenido } from '../../core/models/api.models';
import { ToastService } from '../../core/services/toast.service';
import { QfCardComponent } from '../../shared/atoms/qf-card/qf-card.component';
import { QfButtonComponent } from '../../shared/atoms/qf-button/qf-button.component';
import { QfBadgeComponent } from '../../shared/atoms/qf-badge/qf-badge.component';

@Component({
  standalone: true,
  imports: [FormsModule, QfCardComponent, QfButtonComponent, QfBadgeComponent],
  template: `
    <section class="qf-page">
      <qf-card><h2>Moderación</h2><p class="qf-muted">Revisión y resolución de reportes de contenido inapropiado.</p></qf-card>
      <div class="qf-grid qf-grid-2">@for(r of reportes(); track r.id){<qf-card tone="flat"><div class="row"><qf-badge [tone]="r.estado === 'RESUELTO' ? 'success' : 'warning'">{{ r.estado }}</qf-badge><span>#{{ r.id }}</span></div><h3>Contenido {{ r.contenidoId }}</h3><p>{{ r.descripcion }}</p><textarea [(ngModel)]="comentarios[r.id]" placeholder="Comentario de resolución"></textarea><div class="qf-actions"><qf-button (clicked)="resolver(r,'RESUELTO')">Resolver</qf-button><qf-button variant="ghost" (clicked)="resolver(r,'RECHAZADO')">Rechazar</qf-button></div></qf-card>}</div>
    </section>
  `,
  styles: [`h2{margin:0;font-size:2rem;letter-spacing:-.04em}.row{display:flex;justify-content:space-between;align-items:center}p{color:var(--qf-muted);line-height:1.6}textarea{width:100%;min-height:88px;border:1px solid var(--qf-line);border-radius:16px;padding:13px 14px;color:var(--qf-text);background:#11111a;outline:none;margin-bottom:12px}`]
})
export class ModerationPage implements OnInit {
  reportes = signal<ReporteContenido[]>([]); comentarios: Record<number,string> = {};
  constructor(private data: DataService, private toast: ToastService) {}
  ngOnInit(): void { this.cargar(); }
  cargar(): void { this.data.reportes({page:0,size:30,sort:'id,desc'}).subscribe(v=>this.reportes.set(v.content)); }
  resolver(r: ReporteContenido, estado: string): void { this.data.resolverReporte(r.id,{estado, comentarioResolucion: this.comentarios[r.id] || 'Resuelto desde frontend'}).subscribe({next:()=>{this.toast.show('Reporte actualizado','success');this.cargar();}, error:()=>this.toast.show('No fue posible resolver','error')}); }
}
