// import { inject } from '@angular/core';
// import { CanActivateFn, Router, UrlTree } from '@angular/router';
// import { PermissionService } from '@core/services/permission/local-permission.service';

// // 使用路由 data 配置所需權限，缺權限則導向 403
// export const PermissionGuard: CanActivateFn = (route, state): boolean | UrlTree => {
//   const permission = inject(PermissionService);
//   const router = inject(Router);

//   const required = (route.data?.['permissions'] as string[] | undefined) ?? [];
//   const mode = (route.data?.['permissionMode'] as 'all' | 'any') ?? 'any';

//   if (!required || required.length === 0) {
//     return true;
//   }

//   const ok = mode === 'all' ? permission.hasAll(required) : permission.hasAny(required);
//   return ok ? true : router.parseUrl('/403');
// };