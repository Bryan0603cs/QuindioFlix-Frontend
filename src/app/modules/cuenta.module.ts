import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountPage } from '../pages/account/account.page';

const routes: Routes = [
  { path: '', component: AccountPage }
];

@NgModule({
  imports: [AccountPage, RouterModule.forChild(routes)]
})
export class CuentaModule {}
