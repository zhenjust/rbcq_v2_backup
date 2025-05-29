import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ParamsUtilService } from '../utils';
import { meterProcessParams, meterProcessSearch, settlementParams, settlementSearch } from '@shared/interfaces';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettlementService {

  protected API_URL: string = '/stl-data-pipeline/job';

  constructor(
    private http: HttpClient,
    private paramUtil: ParamsUtilService
  ) { }

  public search(data: settlementParams, searchName: string): Observable<settlementSearch>{
    //hardcoding meterprocess job list
    const withName = {
      ...data,
      name: searchName
    }
    const params = this.paramUtil.buildParams(withName);
    return this.http.get<settlementSearch>(`${this.API_URL}/search`, { params });
  }
}
