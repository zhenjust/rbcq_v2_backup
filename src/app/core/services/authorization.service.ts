import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { apiPath } from '@shared/constants';
import { environment } from 'environments/environment';
import { ToastrService } from 'ngx-toastr';
import { catchError, Observable, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthorizationService {
  private currentUser: any | null = null;
  // private auth_url: string = environment.__API_URL__ + apiPath.__AUTH_PATH__;
  // private reg_url: string = environment.__API_URL__ + apiPath.__REG_PATH__;
  
  constructor(
    private http: HttpClient,
    private router: Router,
    private toast: ToastrService
  ) {}

  getUser(): Observable<any> {
    console.log('Calling getUser()');
    return this.http.get<any>(`${apiPath.__AUTH_PATH__}/user`).pipe(
      tap(data => this.currentUser = data.principal),
      catchError(error => throwError(() => error))
    );
  }

  logout(): void {
    this.http.get(`${apiPath.__AUTH_PATH__}/oauth/invalidate-token`).subscribe({
      next: () => {
        this.toast.success('Logout successfully!');
        localStorage.clear();
        window.location.href = `${apiPath.__AUTH_PATH__}/logout`;
      },
      error: (err) => {
        this.toast.error(err.message);
      }
    }).add(() => {
      localStorage.clear();
      window.location.href = `${apiPath.__AUTH_PATH__}/logout`;
    });
  }

  // OAuth flow
  authorize(code: string, redirectUrl: string): Observable<any> {
    const body = new HttpParams()
      .set('grant_type', 'authorization_code')
      .set('client_id', 'crss')
      .set('redirect_uri', redirectUrl)
      .set('code', code);

    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa('crss:crsssecret'),
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http.post<any>(
      `${apiPath.__AUTH_PATH__}/oauth/token`, 
      body.toString(), 
      { headers }
    ).pipe(
      tap(response => {
        localStorage.setItem('id_token', response.access_token);
        localStorage.setItem('refresh_token', response.refresh_token);
      }),
      catchError(error => throwError(() => error))
    );
  }

  //from ui-bsmd
  //TODO update this to without remounting id_token
  userInit(): Observable<any> {
    const token = localStorage.getItem('id_token');
    const params: any = {};
    
    if (token) {
      params.Authorization = `Bearer ${token}`;
    }
    
    return this.http.post(`${apiPath.__AUTH_PATH__}/user/init`, params).pipe(
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
    if (!this.currentUser || this.currentUser === 'anonymous') {
      return false;
    }

    let perms: string[];
    if (typeof permissions === 'string') {
      perms = permissions.split(',');
    } else {
      perms = permissions;
    }

    return perms.every(permission => 
      this.currentUser.privileges.includes(permission)
    );
  }
}
