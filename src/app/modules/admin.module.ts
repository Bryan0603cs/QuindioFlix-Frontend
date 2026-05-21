import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { roleGuard } from '../core/guards/role.guard';
import { AdminContentPage } from '../pages/admin-content/admin-content.page';
import { AdminUsersPage } from '../pages/admin-users/admin-users.page';
import { AnalyticsPage } from '../pages/analytics/analytics.page';

const routes: Routes = [
  { path: '', component: AdminContentPage },
  { path: 'usuarios', canActivate: [roleGuard], data: { roles: ['ADMIN'] }, component: AdminUsersPage },
  { path: 'reportes', canActivate: [roleGuard], data: { roles: ['ADMIN'] }, component: AnalyticsPage }
];

@NgModule({
  imports: [AdminContentPage, AdminUsersPage, AnalyticsPage, RouterModule.forChild(routes)]
})
export class AdminModule {}
