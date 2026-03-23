import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { apiPath } from '@shared/constants';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { ParamsUtilService } from '../utils';
import { Reference, ReferenceResponse } from '@shared/interfaces';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  protected baseEndpoint = environment.__API_URL__ + apiPath.__ADMIN_PATH__;
  protected settlementEndpoint = environment.__API_URL__ + apiPath.__SETTLEMENT_PATH__;

  private readonly http = inject(HttpClient);
  private readonly psUtil = inject(ParamsUtilService);

  constructor() { }

  public getNavbarInfo(): Observable<any> {
    return this.http.get<any>(`${environment.__API_URL__}/reg/participant/0/info/navbar`);
  }

  public getConfigurations(key: string): Observable<string> {
    return this.http.get<string>(`${this.baseEndpoint}/admin/config/${key}/value`);
  }

  public getReferences(type: string): Observable<ReferenceResponse<Reference>> {
    const _filters = {
      pageNo: 0,
      pageSize: 10,
      mapParams: {
        type
      },
      orderList: [
        {
          sortColumn: 'type',
          sortDirection: 'DESC'
        }
      ]
    };

    return this.http.post<ReferenceResponse<Reference>>(`${this.baseEndpoint}/admin/ref/lov/view-all`, _filters);
  }

}
