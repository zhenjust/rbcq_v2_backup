import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { meterProcessBillingPeriod, meterProcessParams, meterProcessRunJobPayload, meterProcessSearch } from '@shared/interfaces';
import { Observable } from 'rxjs';
import { ParamsUtilService } from '../utils';

@Injectable({
  providedIn: 'root'
})
export class MeterprocessService {

  protected API_URL: string = '/mtr-data-pipeline/job';
  protected METER_PROCESS: string = '/meter-process/billing-period/find-all';

  constructor(
    private http: HttpClient,
    private paramUtil: ParamsUtilService
  ) { }

  public search(data: meterProcessParams): Observable<meterProcessSearch>{
    //hardcoding meterprocess job list
    const withName = {
      ...data,
      name: 'runWESM'
    }
    const params = this.paramUtil.buildParams(withName);
    return this.http.get<meterProcessSearch>(`${this.API_URL}/search`, { params });
  }

  public runJob(data: meterProcessParams): Observable<meterProcessParams>{
    //hardcoding body params
    const bodyParams: meterProcessRunJobPayload = {
      pipelineName: 'runWESM',
      refId: 25,
      parameters: data
    }
    return this.http.post<meterProcessParams>(this.API_URL, bodyParams);
  }

  public getBillingPeriod(): Observable<meterProcessBillingPeriod[]> {
    return this.http.get<meterProcessBillingPeriod[]>(this.METER_PROCESS);
  }
}
