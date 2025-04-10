import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthorizationService } from '@core/services/authorization.service';
import { apiPath } from '@shared/constants';
import { environment } from 'environments/environment';
import { catchError, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthorizeGuard implements CanActivate {
  private auth_url: string = environment.__API_URL__ + apiPath.__AUTH_PATH__;
  private phaseRootUrl: string = environment.__PHASE_ONE_URL__;
  
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
  
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const baseRedirectUri = `${location.protocol}//${location.host}`;
    
    const authorizeUrl = `${this.auth_url}/oauth/authorize?response_type=code&client_id=crss&redirect_uri=${baseRedirectUri}`;
  
    //TODO make it in way that if the app reloads it uses the same code in the initial login
    if (code) {
      return this.authService.authorize(code, baseRedirectUri).pipe(
        map(() => {
          return true; //forces to redirect
        }),
        catchError(() => {
          window.location.href = authorizeUrl;
          return of(false);
        })
      );
    }
  
    return this.authService.getUser().pipe(
      map(() => {
        const permissions = route.data['permissions'] || [];
        if (!this.authService.isAuthorized(permissions)) {
          window.location.href = this.phaseRootUrl;
          return false;
        }
        return true;
      }),
      catchError(() => {
        window.location.href = authorizeUrl;
        return of(false);
      })
    );
  }
}