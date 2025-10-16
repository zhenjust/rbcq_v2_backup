import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  meterProcessBillingPeriod,
  meterProcessJobSearchGroupParams,
  meterProcessParams,
  meterProcessPipeline,
  meterProcessRunJobPayload,
  meterProcessTable,
  mtnListPage,
  ReportDownloadParams,
} from '@shared/interfaces';
import { Observable } from 'rxjs';
import { ParamsUtilService } from '../utils';
import { MeterDataPipelineName } from '@shared/constants';

@Injectable({
  providedIn: 'root'
})
export class MeterprocessService {

  private API_URL: string = '/mtr-data-pipeline/job';
  private METER_PROCESS: string = '/meter-process/billing-period/find-all';
  private MTN_LIST: string = '/reg/mtn/list/region';
  private PIPELINE_NAME: string = 'runMeterData';
  private baseUrl: string = 'meter-process';

  private paramUtil = inject(ParamsUtilService);
  private http = inject(HttpClient);

  public search(data: Partial<meterProcessJobSearchGroupParams>): Observable<meterProcessTable>{
    const withName = {
      ...data,
      name: this.PIPELINE_NAME
    }
    const params = this.paramUtil.buildParams(withName);
    return this.http.get<meterProcessTable>(`${this.API_URL}/search-group`, { params });
  }

  public runJob(data: Partial<meterProcessParams>, pipelineName?: MeterDataPipelineName, refId?: number): Observable<meterProcessParams>{
    const isRerun = pipelineName === MeterDataPipelineName.CONSOLIDATE;

    const bodyParams: Partial<meterProcessRunJobPayload> = {
      pipelineName: isRerun ? pipelineName : `${this.PIPELINE_NAME}-${pipelineName}`,
      refId: refId,
      isGroup: true
    };

    if (data && Object.keys(data).length > 0) {
      bodyParams.parameters = data;
    }
    return this.http.post<meterProcessParams>(this.API_URL, bodyParams);
  }

  public getBillingPeriod(): Observable<meterProcessBillingPeriod[]> {
    return this.http.get<meterProcessBillingPeriod[]>(this.METER_PROCESS);
  }

  public getMtnList(pageNumber?: number, search?: string, region?: string): Observable<mtnListPage> {
    const mapParams: Record<string, any> = {};
    if (search) mapParams['mtnName'] = search;
    if (region) mapParams['region'] = region;

    const payload = {
      pageNo: pageNumber ?? 0,
      pageSize: 10,
      mapParams,
    };

    return this.http.post<mtnListPage>(this.MTN_LIST, payload);
  }

  public getRerunList(workspaceId: number): Observable<meterProcessPipeline[]> {
    return this.http.get<meterProcessPipeline[]>(`${this.API_URL}/run-list/${workspaceId}`);
  }

  downloadReport(params: ReportDownloadParams) {
    const httpParams = this.paramUtil.buildParams(params);
    return this.http.get(`${window.location.origin}/${this.baseUrl}/reports/download/zip`, {
      params: httpParams,
      responseType: 'blob',
      observe: 'events',
      reportProgress: true,
    });
  }
}
