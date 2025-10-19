import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';


export const routes: Routes = [

  // 認證相關路由
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
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
    canActivate: [AuthGuard]
  },
  // 教材列表頁面
  {
    path: 'book',
    loadComponent: () => import('./features/book/page/book-page/book-page.component').then(m => m.BookPageComponent),
    canActivate: [AuthGuard]
  },
  // 教材詳情頁面
  {
    path: 'book/:id',
    loadComponent: () => import('./features/book/detail/book-detail.component').then(m => m.BookDetailComponent),
    canActivate: [AuthGuard]
  },
  // 編輯教材頁面
  {
    path: 'book/edit/:id',
    loadComponent: () => import('./features/book/page/edit/edit.component').then(m => m.EditComponent),
    canActivate: [AuthGuard]
  },
  // 創建教材頁面
  {
    path: 'create',
    loadComponent: () => import('./features/book/page/edit/edit.component').then(m => m.EditComponent),
    canActivate: [AuthGuard]
  },

  // 預設路由
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' }

];
