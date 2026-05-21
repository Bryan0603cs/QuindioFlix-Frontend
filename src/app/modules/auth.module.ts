import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginPage } from '../pages/auth/login.page';
import { RegisterPage } from '../pages/auth/register.page';

const routes: Routes = [
  { path: 'login', component: LoginPage },
  { path: 'registro', component: RegisterPage }
];

@NgModule({
  imports: [LoginPage, RegisterPage, RouterModule.forChild(routes)]
})
export class AuthModule {}
