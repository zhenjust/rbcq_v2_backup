import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable, Signal, signal } from '@angular/core';
import { apiPath } from '@shared/constants';
import { AuthToken, CurrentUser } from '@shared/interfaces';
import { NgxPermissionsService } from 'ngx-permissions';
import { map, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthorizationService {
  private http = inject(HttpClient);

  private _currentUser = signal<CurrentUser | null>(null);

  readonly currentUser: Signal<CurrentUser | null> = this._currentUser.asReadonly();

  private readonly ps = inject(NgxPermissionsService);

  loadUser(): Observable<CurrentUser> {
    return this.http.get<CurrentUser>(`${apiPath.__AUTH_PATH__}/user`).pipe(
      tap(user => {
        this.ps.loadPermissions(user?.principal?.privileges);
        this._currentUser.set(user)
      })
    );
  }

  // Access identity reactively or trigger a load if needed
  identity(): CurrentUser | null {
    if (!this._currentUser()) {
      this.loadUser().subscribe();
    }
    return this._currentUser();
  }

  refreshUser(): Observable<CurrentUser> {
    return this.loadUser();
  }

  logout(): Observable<string> {
    return this.http.get<string>(`${apiPath.__AUTH_PATH__}/oauth/invalidate-token`);
  }

  login(payload: any) {
    let body = new HttpParams();

    Object.keys(payload).forEach(key => {
      body = body.set(key, payload[key]);
    });

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http.post<any>(`${apiPath.__AUTH_PATH__}/login`, body, { headers, withCredentials: true });
  }

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

    return this.http.post<AuthToken>(`${apiPath.__AUTH_PATH__}/oauth/token`, body.toString(), { headers }).pipe(
      tap(response => {
        localStorage.setItem('id_token', response.access_token);
        localStorage.setItem('refresh_token', response.refresh_token);
      }),
      map(() => true)
    );
  }

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
    return this.http.post<string>(`${apiPath.__REG_PATH__}/participant/0/info/audit/log`, {});
  }

  userNameList(): Observable<string[]> {
    return this.http.get<string[]>(`${apiPath.__REG_PATH__}/applicant/ldap-user`);
  }

  auditLog(): Observable<string> {
    return this.http.post<string>(`${apiPath.__REG_PATH__}/participant/0/info/audit/log`, {});
  }

  getToken(): string | null {
    return localStorage.getItem('id_token');
  }
}
