import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { apiPath } from '@shared/constants';
import { AuthToken, CurrentUser } from '@shared/interfaces';
import { ToastrService } from 'ngx-toastr';
import { catchError, map, Observable, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthorizationService {
  private currentUser: CurrentUser | null = null;
  
  constructor(
    private http: HttpClient
  ) {}

  getUser(): Observable<CurrentUser> {
    return this.http.get<CurrentUser>(`${apiPath.__AUTH_PATH__}/user`);
  }

  logout(): Observable<string> {
    return this.http.get<string>(`${apiPath.__AUTH_PATH__}/oauth/invalidate-token`);
  }

  // OAuth flow
  authorize(code: string, redirectUri: string): Observable<boolean> {
    const body = new HttpParams()
      .set('grant_type', 'authorization_code')
      .set('client_id', 'crss')
      .set('redirect_uri', redirectUri)
      .set('code', code);

    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa('crss:crsssecret'),
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    });

    return this.http.post<AuthToken>(`${apiPath.__AUTH_PATH__}/oauth/token`,body.toString(),{ headers }).pipe(
      tap(
        response => {
          localStorage.setItem('id_token', response.access_token);
          localStorage.setItem('refresh_token', response.refresh_token);
        }
      ),
      map(() => true)
    );
  }

  //TODO cast proper types to the services
  userInit(): Observable<CurrentUser> {
    return this.http.post<CurrentUser>(`${apiPath.__AUTH_PATH__}/user/init`, {});
  }

  
  changeToSuperUser(user: string): Observable<string> {
    return this.http.post<string>(`${apiPath.__AUTH_PATH__}/super-user/init/${user}`, {});
  }

  changeToNormalUser(user: string): Observable<string> {
    return this.http.post<string>(`${apiPath.__AUTH_PATH__}/normal-user/init/${user}`, {});
  }

  logSuperUserLogin(): Observable<string> {
    return this.http.post<string>(`${apiPath.__REG_PATH__}/participant/0/info/audit/log`, {})
  }

  userNameList(): Observable<string[]> {
    return this.http.get<string[]>(`${apiPath.__REG_PATH__}/applicant/ldap-user`);
  }

  auditLog(): Observable<string> {
    return this.http.post<string>(`${apiPath.__REG_PATH__}/participant/0/info/audit/log`, {});
  }

  isAuthorized(permissions: string | string[]): boolean {
    if (!this.currentUser || this.currentUser.principal.username === 'anonymous') {
      return false;
    }

    let perms: string[];
    if (typeof permissions === 'string') {
      perms = permissions.split(',');
    } else {
      perms = permissions;
    }

    return perms.every(permission => 
      this.currentUser?.principal.privileges.includes(permission)
    );
  }

  getToken(): string | null{
    return localStorage.getItem('id_token');
  }
}
