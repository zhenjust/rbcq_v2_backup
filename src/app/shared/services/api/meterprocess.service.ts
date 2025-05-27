import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { meterProcessParams, meterProcessRunJobPayload, meterProcessSearch } from '@shared/interfaces';
import { Observable } from 'rxjs';
import { ParamsUtilService } from '../utils';

@Injectable({
  providedIn: 'root'
})
export class MeterprocessService {

  protected API_URL:string = '/mtr-data-pipeline/job';

  constructor(
    private http: HttpClient,
    private paramUtil: ParamsUtilService
  ) { }

  public search(data: meterProcessParams): Observable<meterProcessSearch>{
    const params = this.paramUtil.buildParams(data);
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
}
