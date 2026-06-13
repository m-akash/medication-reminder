import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent) },
  { path: 'medications', loadComponent: () => import('./components/medications/medications.component').then(m => m.MedicationsComponent) },
  { path: 'add-medicine', loadComponent: () => import('./components/add-medicine/add-medicine.component').then(m => m.AddMedicineComponent) },
  { path: 'update-medicine/:id', loadComponent: () => import('./components/update-medicine/update-medicine.component').then(m => m.UpdateMedicineComponent) },
  { path: 'settings', loadComponent: () => import('./components/settings/settings.component').then(m => m.SettingsComponent) },
  { path: 'reports', loadComponent: () => import('./components/reports/reports.component').then(m => m.ReportsComponent) },
  { path: 'login', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent) },
];
