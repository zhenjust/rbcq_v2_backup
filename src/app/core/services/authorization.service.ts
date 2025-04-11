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
    private http: HttpClient,
    private toast: ToastrService
  ) {}

  getUser(): Observable<CurrentUser> {
    return this.http.get<CurrentUser>(`${apiPath.__AUTH_PATH__}/user`).pipe(
      tap(data => this.currentUser = data),
      catchError(error => throwError(() => error))
    );
  }

  logout(): void {
    this.http.get<any>(`${apiPath.__AUTH_PATH__}/oauth/invalidate-token`).subscribe({
      next: () => {
        this.toast.success('Logout successfully!');
        localStorage.clear();
        window.location.href = `${apiPath.__AUTH_PATH__}/logout`;
      },
      error: (err) => {
        this.toast.error(err.message);
        //TODO investigate error message but 200 response
        localStorage.clear();
        window.location.href = `${apiPath.__AUTH_PATH__}/logout`;
      }
    })
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
      map(() => {
        window.history.replaceState({}, document.title, window.location.pathname)
        return true;
      })
    );
  }

  //TODO update this change type
  userInit(): Observable<any> {
    //setting params to empty
    return this.http.post(`${apiPath.__AUTH_PATH__}/user/init`, {}).pipe(
      catchError(error => throwError(() => error))
    );
  }

  
  changeToSuperUser(user: string): Observable<any> {
    return this.http.post(
      `${apiPath.__AUTH_PATH__}/super-user/init/${user}`, 
      {},
      { headers: new HttpHeaders({ 'Content-Type': undefined as any }) }
    ).pipe(
      catchError(error => throwError(() => error))
    );
  }

  changeToNormalUser(user: string): Observable<any> {
    return this.http.post(`${apiPath.__AUTH_PATH__}/normal-user/init/${user}`, {}).pipe(
      catchError(error => throwError(() => error))
    );
  }

  userNameList(): Observable<any> {
    return this.http.get(`${apiPath.__REG_PATH__}/applicant/ldap-user`).pipe(
      catchError(error => throwError(() => error))
    );
  }

  auditLog(): Observable<any> {
    return this.http.post(`${apiPath.__REG_PATH__}/participant/0/info/audit/log`, {}).pipe(
      catchError(error => throwError(() => error))
    );
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
