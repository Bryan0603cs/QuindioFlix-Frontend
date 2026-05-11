import { Routes } from '@angular/router';
import { ShellComponent } from './shared/templates/shell/shell.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'login', loadComponent: () => import('./pages/auth/login.page').then(m => m.LoginPage) },
  { path: 'registro', loadComponent: () => import('./pages/auth/register.page').then(m => m.RegisterPage) },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.page').then(m => m.DashboardPage) },
      { path: 'catalogo', loadComponent: () => import('./pages/catalog/catalog.page').then(m => m.CatalogPage) },
      { path: 'catalogo/:id', loadComponent: () => import('./pages/content-detail/content-detail.page').then(m => m.ContentDetailPage) },
      { path: 'perfiles', loadComponent: () => import('./pages/profiles/profiles.page').then(m => m.ProfilesPage) },
      { path: 'pagos', loadComponent: () => import('./pages/payments/payments.page').then(m => m.PaymentsPage) },
      { path: 'analitica', canActivate: [roleGuard], data: { roles: ['ADMIN','MODERADOR'] }, loadComponent: () => import('./pages/analytics/analytics.page').then(m => m.AnalyticsPage) },
      { path: 'moderacion', canActivate: [roleGuard], data: { roles: ['ADMIN','MODERADOR'] }, loadComponent: () => import('./pages/moderation/moderation.page').then(m => m.ModerationPage) },
      { path: 'admin/usuarios', canActivate: [roleGuard], data: { roles: ['ADMIN','MODERADOR'] }, loadComponent: () => import('./pages/admin-users/admin-users.page').then(m => m.AdminUsersPage) },
      { path: 'admin/contenidos', canActivate: [roleGuard], data: { roles: ['ADMIN','CONTENIDO'] }, loadComponent: () => import('./pages/admin-content/admin-content.page').then(m => m.AdminContentPage) }
    ]
  },
  { path: '**', loadComponent: () => import('./pages/not-found/not-found.page').then(m => m.NotFoundPage) }
];
