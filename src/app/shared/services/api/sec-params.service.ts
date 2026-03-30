import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { apiPath } from '@shared/constants';
import { SecParameters, TableDataResult, TableParams } from '@shared/interfaces';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { ParamsUtilService } from '../utils';

@Injectable({
  providedIn: 'root'
})
export class SecParamsService {

  protected settlementEndpoint = environment.__API_URL__ + apiPath.__SETTLEMENT_PATH__;

  private readonly http = inject(HttpClient);
  private readonly psUtil = inject(ParamsUtilService);

  constructor() { }

  public listSecParameters(filters: any, tableParams?: TableParams): Observable<TableDataResult<SecParameters[]>> {
    let params = this.psUtil.buildParams(filters, tableParams);

    if (!params.get('fuelType')) {
      params = params.append('fuelType', '');
    }

    if (params.get('fuelType') && params.get('fuelType')?.toLowerCase() === 'all') {
      params = params.delete('fuelType');
      params = params.append('allFuelType', 'true');
    }

    return this.http.get<TableDataResult<SecParameters[]>>(`${this.settlementEndpoint}/sec-maintenance/list`, { params });
  }

  public createSecParameters(payload: SecParameters): Observable<SecParameters> {
    const endpoint = payload.groupId ? 'update' : 'add'
    return this.http.post<SecParameters>(`${this.settlementEndpoint}/sec-maintenance/${endpoint}`, payload);
  }

  public deleteSecParams(id: number): Observable<null> {
    return this.http.delete<null>(`${this.settlementEndpoint}/sec-maintenance/remove/${id}`);
  }


}
