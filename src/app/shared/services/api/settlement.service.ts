import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ParamsUtilService } from '../utils';
import { meterProcessParams, meterProcessSearch, settlementParams, settlementTableDate } from '@shared/interfaces';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettlementService {

  protected API_URL: string = '/stl-data-pipeline/job';

  private paramUtil = inject(ParamsUtilService);

  constructor(
    private http: HttpClient
  ) { }

  public search(data: settlementParams, searchName: string): Observable<settlementTableDate>{
    //hardcoding meterprocess job list
    const withName = {
      ...data,
      name: searchName
    }
    const params = this.paramUtil.buildParams(withName);
    return this.http.get<settlementTableDate>(`${this.API_URL}/search`, { params });
  }
}
