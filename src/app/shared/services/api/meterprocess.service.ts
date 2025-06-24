import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { meterProcessBillingPeriod, meterProcessJobSearchGroupParams, meterProcessParams, meterProcessRunJobPayload, meterProcessTable, mtnListPage } from '@shared/interfaces';
import { Observable } from 'rxjs';
import { ParamsUtilService } from '../utils';

@Injectable({
  providedIn: 'root'
})
export class MeterprocessService {

  private API_URL: string = '/mtr-data-pipeline/job';
  private METER_PROCESS: string = '/meter-process/billing-period/find-all';
  private MTN_LIST: string = '/reg/mtn/list/region';
  private PIPELINE_NAME: string = 'runMeterDataInitialize';

  private paramUtil = inject(ParamsUtilService);
  private http = inject(HttpClient);

  public search(data: Partial<meterProcessJobSearchGroupParams>): Observable<meterProcessTable>{
    //hardcoding meterprocess job list
    const withName = {
      ...data,
      name: this.PIPELINE_NAME
    }
    const params = this.paramUtil.buildParams(withName);
    return this.http.get<meterProcessTable>(`${this.API_URL}/search-group`, { params });
  }

  public runJob(data: Partial<meterProcessParams>): Observable<meterProcessParams>{
    //hardcoding body params
    const bodyParams: meterProcessRunJobPayload = {
      pipelineName: this.PIPELINE_NAME,
      refId: 25,
      isGroup: true,
      parameters: data
    }
    return this.http.post<meterProcessParams>(this.API_URL, bodyParams);
  }

  public getBillingPeriod(): Observable<meterProcessBillingPeriod[]> {
    return this.http.get<meterProcessBillingPeriod[]>(this.METER_PROCESS);
  }

  public getMtnList(pageNumber?: number, search?: string, region?: string): Observable<mtnListPage> {
    // manually adding parameters
    const payload = {
          "pageNo": pageNumber ? pageNumber : 0,
          "pageSize": 10,
          "mapParams": {
            "name": search ? search : '',
            "region": region ? region : ''
          }
      }
    return this.http.post<mtnListPage>(this.MTN_LIST, payload);
  }
}
