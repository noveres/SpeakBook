import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';


export const routes: Routes = [

  // 認證相關路由
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent),
    canActivate: [() => {
      const isLoggedIn = localStorage.getItem('token') !== null;
      // return !isLoggedIn ? true : ['/dashboard'];
      return !isLoggedIn ? true : ['/home'];
    }]
  },
    // HOME頁面
  {
    path: 'home',
    loadComponent: () => import('./features/home/pages/home/home.component').then(m => m.HomeComponent),
    // canActivate: [AuthGuard]
  },
  // 書籍頁面
  {
    path: 'book',
    loadComponent: () => import('./features/book/page/book-page/book-page.component').then(m => m.BookPageComponent),
    // canActivate: [AuthGuard]
  },

  // 預設路由
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' }

];
