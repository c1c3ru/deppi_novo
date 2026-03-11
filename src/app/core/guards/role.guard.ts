import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRoles: string[] = route.data['roles'] ?? [];

    if (!this.authService.isAuthenticated) {
      this.router.navigate(['/boletins/login']);
      return false;
    }

    if (requiredRoles.length === 0) {
      return true;
    }

    const hasRole = this.authService.hasAnyRole(requiredRoles);
    if (!hasRole) {
      this.router.navigate(['/home']);
      return false;
    }

    return true;
  }
}
