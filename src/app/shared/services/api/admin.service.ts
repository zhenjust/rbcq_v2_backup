import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { apiPath } from '@shared/constants';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  protected baseEndpoint = environment.__API_URL__ + apiPath.__ADMIN_PATH__;
  private readonly http = inject(HttpClient);

  constructor() { }

  public getNavbarInfo(): Observable<any> {
    return this.http.get<any>(`${environment.__API_URL__}/reg/participant/0/info/navbar`);
  }

  public getConfigurations(key: string): Observable<string> {
    return this.http.get<string>(`${this.baseEndpoint}/admin/config/${key}/value`);
  }
}
