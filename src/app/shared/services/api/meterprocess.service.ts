import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { meterProcessBillingPeriod, meterProcessJobSearchGroupParams, meterProcessParams, meterProcessRunJobPayload, meterProcessTable, mtnList } from '@shared/interfaces';
import { Observable } from 'rxjs';
import { ParamsUtilService } from '../utils';

@Injectable({
  providedIn: 'root'
})
export class MeterprocessService {

  protected API_URL: string = '/mtr-data-pipeline/job';
  protected METER_PROCESS: string = '/meter-process/billing-period/find-all';
  protected MTN_LIST: string = '/reg/mtn/list/v2';

  constructor(
    private http: HttpClient,
    private paramUtil: ParamsUtilService
  ) { }

  public search(data: meterProcessJobSearchGroupParams): Observable<meterProcessTable>{
    //hardcoding meterprocess job list
    const withName = {
      ...data,
      name: 'runWESM'
    }
    const params = this.paramUtil.buildParams(withName);
    return this.http.get<meterProcessTable>(`${this.API_URL}/search-group`, { params });
  }

  public runJob(data: meterProcessParams): Observable<meterProcessParams>{
    //hardcoding body params
    const bodyParams: meterProcessRunJobPayload = {
      pipelineName: 'runWESM',
      refId: 25,
      isGroup: true,
      parameters: data
    }
    return this.http.post<meterProcessParams>(this.API_URL, bodyParams);
  }

  public getBillingPeriod(): Observable<meterProcessBillingPeriod[]> {
    return this.http.get<meterProcessBillingPeriod[]>(this.METER_PROCESS);
  }
  
  public getMtnList(): Observable<any> {
    // manually adding parameters 
    const payload = {
          "pageNo": 0,
          "pageSize": 1255,
          "mapParams": {},
          "orderList": [
              {
                  "sortColumn": "name",
                  "sortDirection": "ASC"
              }
          ]
      }
    return this.http.post(this.MTN_LIST, payload);
  }
}
