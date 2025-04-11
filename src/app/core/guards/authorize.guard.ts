import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthorizationService } from '@core/services/authorization.service';
import { apiPath } from '@shared/constants';
import { environment } from 'environments/environment';
import { catchError, map, Observable, of, switchMap, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthorizeGuard implements CanActivate {  
  private auth_url: string = environment.__API_URL__ + apiPath.__AUTH_PATH__;

  constructor(private authService: AuthorizationService) {}

  private searchCode(): string | null {
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

    const token = this.authService.getToken();
    const code = this.searchCode();
    const baseRedirectUri = `${location.protocol}//${location.host}`;
    const authorizeUrl = `${this.auth_url}/oauth/authorize?response_type=code&client_id=crss&redirect_uri=${baseRedirectUri}`;

    if (!token) {
      if (code) {
        return this.authService.authorize(code, baseRedirectUri).pipe(
          switchMap(() => this.authService.userInit()),
          map(() => true),
          catchError(() => {
            window.location.href = authorizeUrl;
            return of(false);
          })
        );
      } else {
        window.location.href = authorizeUrl;
        return false;
      }
    }

    return this.authService.userInit().pipe(
      map(() => true),
      catchError(() => {
        localStorage.removeItem('id_token');
        localStorage.removeItem('refresh_token');
        window.location.href = authorizeUrl;
        return of(false);
      })
    );
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.canActivate(childRoute, state);
  }
}