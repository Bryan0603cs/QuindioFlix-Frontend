import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { perfilGuard } from '../core/guards/perfil.guard';
import { HomePage } from '../pages/home/home.page';
import { SearchPage } from '../pages/search/search.page';
import { MyListPage } from '../pages/my-list/my-list.page';
import { HistoryPage } from '../pages/history/history.page';
import { ContentDetailPage } from '../pages/content-detail/content-detail.page';

const routes: Routes = [
  { path: 'home', canActivate: [perfilGuard], component: HomePage },
  { path: 'buscar', canActivate: [perfilGuard], component: SearchPage },
  { path: 'mi-lista', canActivate: [perfilGuard], component: MyListPage },
  { path: 'historial', canActivate: [perfilGuard], component: HistoryPage },
  { path: 'contenido/:id', canActivate: [perfilGuard], component: ContentDetailPage }
];

@NgModule({
  imports: [HomePage, SearchPage, MyListPage, HistoryPage, ContentDetailPage, RouterModule.forChild(routes)]
})
export class CatalogoModule {}
