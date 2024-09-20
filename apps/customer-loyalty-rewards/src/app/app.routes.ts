import { Routes } from '@angular/router';
import { CustomerLookupComponent } from './components/customer-lookup/customer-lookup.component';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'customer-lookup', 
    component: CustomerLookupComponent, 
    canActivate: [authGuard] 
  },
  { path: '', redirectTo: '/customer-lookup', pathMatch: 'full' },
  { path: '**', redirectTo: '/customer-lookup' }
];
