import { Routes } from '@angular/router';
import { ShellComponent } from './shared/templates/shell/shell.component';
import { authGuard } from './core/guards/auth.guard';
import { perfilGuard } from './core/guards/perfil.guard';
import { moderadorGuard } from './core/guards/moderador.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'login', loadComponent: () => import('./pages/auth/login.page').then(m => m.LoginPage) },
  { path: 'register', loadComponent: () => import('./pages/auth/register.page').then(m => m.RegisterPage) },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: 'perfiles', loadComponent: () => import('./pages/profiles/profiles.page').then(m => m.ProfilesPage) },
      { path: 'home', canActivate: [perfilGuard], loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage) },

      // 💡 CORRECCIÓN: Quitamos el 'perfilGuard' estricto de las páginas globales para que el Admin pueda entrar a verlas sin bloquearse
      { path: 'buscar', loadComponent: () => import('./pages/search/search.page').then(m => m.SearchPage) },
      { path: 'mi-lista', loadComponent: () => import('./pages/my-list/my-list.page').then(m => m.MyListPage) },
      { path: 'favoritos', redirectTo: 'mi-lista' },
      { path: 'historial', loadComponent: () => import('./pages/history/history.page').then(m => m.HistoryPage) },

      { path: 'cuenta', loadChildren: () => import('./modules/cuenta.module').then(m => m.CuentaModule) },
      { path: 'contenido/:id', canActivate: [perfilGuard], loadComponent: () => import('./pages/content-detail/content-detail.page').then(m => m.ContentDetailPage) },
      { path: 'moderador', canActivate: [moderadorGuard], loadComponent: () => import('./pages/moderation/moderation.page').then(m => m.ModerationPage) },
      { path: 'admin', canActivate: [adminGuard], loadChildren: () => import('./modules/admin.module').then(m => m.AdminModule) },

      // Redirecciones útiles del sistema
      { path: 'analitica', redirectTo: 'admin/reportes' },
      { path: 'dashboard', redirectTo: 'home' },
      { path: 'catalogo', redirectTo: 'buscar' },
      { path: 'catalogo/:id', redirectTo: 'contenido/:id' },
      { path: 'pagos', redirectTo: 'cuenta' },
      { path: 'moderacion', redirectTo: 'moderador' },
      { path: 'admin/contenidos', redirectTo: 'admin' }
    ]
  },
  { path: '**', loadComponent: () => import('./pages/not-found/not-found.page').then(m => m.NotFoundPage) }
];