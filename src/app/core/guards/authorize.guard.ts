import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, GuardResult, MaybeAsync, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthorizationService } from '@core/services/authorization.service';
import { apiPath } from '@shared/constants';
import { environment } from 'environments/environment';
import { catchError, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthorizeGuard implements CanActivate {
  private auth_url: string = environment.__API_URL__ + apiPath.__AUTH_PATH__;
  constructor(
    private authService: AuthorizationService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (route.data['loginNonRequired']) {
      return true;
    }

    // Check for OAuth code in URL
    // from ui-bsmd
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const redirectUrl = location.protocol + '//' + location.host;
    const authorizeUrl = `${this.auth_url}/oauth/authorize?response_type=code&client_id=crss&redirect_uri=${redirectUrl}`;

    if (code) {
      return this.authService.authorize(code, redirectUrl).pipe(
        map(() => {
          window.location.href = redirectUrl;
          return false;
        }),
        catchError(() => {
          window.location.href = authorizeUrl;
          return of(false);
        })
      );
    } else {
      return this.authService.getUser().pipe(
        map(data => {
          const permissions = route.data['permissions'] || [];
          if (!this.authService.isAuthorized(permissions)) {
            this.router.navigate(['/']);
            return false;
          }
          return true;
        }),
        catchError(error => {
          if (error.status === 500) {
            return of(false);
          } else {
            window.location.href = authorizeUrl;
            return of(false);
          }
        })
      );
    }
  }
}
