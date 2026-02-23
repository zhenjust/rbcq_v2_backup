import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthorizationService } from '@core/services/authorization.service';
import { apiPath } from '@shared/constants';
import { environment } from 'environments/environment';
import { NgxPermissionsService } from 'ngx-permissions';
import { catchError, map, Observable, of, switchMap, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthorizeGuard implements CanActivate {
  private auth_url: string = environment.__API_URL__ + apiPath.__AUTH_PATH__;

  private authService = inject(AuthorizationService);
  private readonly ngp = inject(NgxPermissionsService);
  private readonly router = inject(Router);
  locationData: any;

  searchCode(): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('code');
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    if (route.data['loginNonRequired']) {
      return true;
    }

    if (this.authService.getToken()) {
      const userRole = Object.keys(this.ngp.getPermissions());

      if (userRole.length === 0) {
        return this.authService.loadUser()
          .pipe(
            map((user) => {
              try {
                const roles: string[] = user?.principal?.privileges;
                if (roles) {
                  this.ngp.loadPermissions(roles);
                  return this.validateRole(route.data);
                }
              } catch (error) {
                if (error instanceof TypeError) {
                  localStorage.removeItem('id_token');
                  localStorage.removeItem('refresh_token');
                  this.canActivate(route, state);
                }
              }

              return true;
            })
          );
      } else {
        return this.validateRole(route.data);
      }
    } else {
      const code = this.searchCode() || '';
      const baseRedirectUri = `${location.protocol}//${location.host}`;
      const authorizeUrl = `${this.auth_url}/oauth/authorize?response_type=code&client_id=crss&redirect_uri=${baseRedirectUri}`;

      return this.authService.authorize(code, baseRedirectUri).pipe(
        switchMap(() => this.authService.userInit()),
        tap(() => {
          this.authService.loadUser().subscribe(user => {
            this.ngp.loadPermissions(user?.principal?.privileges);
            window.location.href = baseRedirectUri + location.pathname !== '/' ? location.pathname : '';
          });
        }),
        map(() => true),
        catchError(() => {
          window.location.href = authorizeUrl;
          return of(false);
        })
      );
    }
  }

  validateRole(data: any): boolean {
    const allowedRoles = data && data.roles;
    const userRoles = Object.keys(this.ngp.getPermissions());

    if (allowedRoles) {
      if (allowedRoles.some((role: string) => userRoles.indexOf(role) !== -1)) {
        return true;
      } else {
        this.router.navigateByUrl('/unauthorized');
        return false;
      }
    } else {
      return true;
    }
  }


  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.canActivate(childRoute, state);
  }
}