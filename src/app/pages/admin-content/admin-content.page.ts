import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../core/services/data.service';
import { Categoria, Contenido, Empleado, Genero } from '../../core/models/api.models';
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
        <h2>Gestión de catálogo</h2><p class="qf-muted">CRUD base para contenidos. Las temporadas y episodios se gestionan desde sus endpoints.</p>
        <div class="qf-form-row"><input [(ngModel)]="form.titulo" placeholder="Título"/><input [(ngModel)]="form.anioLanzamiento" type="number" placeholder="Año"/></div>
        <div class="qf-form-row"><input [(ngModel)]="form.duracionMinutos" type="number" placeholder="Duración minutos"/><select [(ngModel)]="form.clasificacionEdad"><option>TP</option><option>MAS_7</option><option>MAS_13</option><option>MAS_16</option><option>MAS_18</option></select></div>
        <div class="qf-form-row"><select [(ngModel)]="form.categoriaId"><option [ngValue]="0">Categoría</option>@for(c of categorias(); track c.id){<option [ngValue]="c.id">{{ c.nombre }}</option>}</select><select [(ngModel)]="form.empleadoResponsableId"><option [ngValue]="0">Empleado responsable</option>@for(e of empleados(); track e.id){<option [ngValue]="e.id">{{ e.nombre }} - {{ e.departamento }}</option>}</select></div>
        <textarea [(ngModel)]="form.sinopsis" placeholder="Sinopsis"></textarea>
        <div class="checks">@for(g of generos(); track g.id){ <label><input type="checkbox" [checked]="form.generoIds.includes(g.id)" (change)="toggleGenero(g.id)"/> {{ g.nombre }}</label> }</div>
        <label class="original"><input type="checkbox" [(ngModel)]="form.originalQuindioflix"/> Producción original QuindioFlix</label>
        <qf-button (clicked)="crear()">Crear contenido</qf-button>
      </qf-card>
      <qf-card tone="flat"><table><thead><tr><th>ID</th><th>Título</th><th>Categoría</th><th>Año</th><th>Popularidad</th><th></th></tr></thead><tbody>@for(c of contenidos(); track c.id){<tr><td>{{ c.id }}</td><td>{{ c.titulo }}</td><td><qf-badge tone="blue">{{ c.categoria }}</qf-badge></td><td>{{ c.anioLanzamiento }}</td><td>{{ c.popularidad }}</td><td><qf-button variant="danger" (clicked)="eliminar(c.id)">Eliminar</qf-button></td></tr>}</tbody></table></qf-card>
    </section>
  `,
  styles: [`
    h2{margin:0;font-size:2rem;letter-spacing:-.04em}.qf-form-row{margin-top:12px} input,select,textarea{width:100%;border:1px solid var(--qf-line);border-radius:16px;padding:13px 14px;color:var(--qf-text);background:#11111a;outline:none} textarea{min-height:92px;margin-top:12px}.checks{display:flex;gap:10px;flex-wrap:wrap;margin:14px 0;color:var(--qf-muted)}.original{display:block;margin-bottom:14px;color:var(--qf-muted)}table{width:100%;border-collapse:collapse}th,td{padding:12px 8px;border-bottom:1px solid var(--qf-line);text-align:left}th{color:var(--qf-muted)}
  `]
})
export class AdminContentPage implements OnInit {
  categorias = signal<Categoria[]>([]); generos = signal<Genero[]>([]); empleados = signal<Empleado[]>([]); contenidos = signal<Contenido[]>([]);
  form = { categoriaId: 0, titulo: '', anioLanzamiento: 2026, duracionMinutos: 90, sinopsis: '', clasificacionEdad: 'TP', originalQuindioflix: false, empleadoResponsableId: 0, generoIds: [] as number[] };
  constructor(private data: DataService, private toast: ToastService) {}
  ngOnInit(): void { this.data.categorias().subscribe(v=>this.categorias.set(v)); this.data.generos().subscribe(v=>this.generos.set(v)); this.data.empleados().subscribe(v=>this.empleados.set(v.content)); this.cargar(); }
  cargar(): void { this.data.contenidos({page:0,size:30,sort:'id,desc'}).subscribe(v=>this.contenidos.set(v.content)); }
  toggleGenero(id:number): void { this.form.generoIds = this.form.generoIds.includes(id) ? this.form.generoIds.filter(x=>x!==id) : [...this.form.generoIds,id]; }
  crear(): void { this.data.crearContenido(this.form as any).subscribe({ next:()=>{this.toast.show('Contenido creado','success'); this.cargar();}, error:()=>this.toast.show('No fue posible crear contenido','error') }); }
  eliminar(id:number): void { if(!confirm('¿Eliminar contenido?')) return; this.data.eliminarContenido(id).subscribe({ next:()=>{this.toast.show('Contenido eliminado','success'); this.cargar();}, error:()=>this.toast.show('No fue posible eliminar','error') }); }
}
