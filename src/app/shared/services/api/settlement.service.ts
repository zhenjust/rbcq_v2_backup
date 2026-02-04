import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ParamsUtilService } from '../utils';
import { BaseResponse, EnergyTradingAmounts, PublishSettlement, SettlementJob, SettlementJobParams, settlementParams, settlementTableDate, TableParams } from '@shared/interfaces';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettlementService {

  private API_URL: string = '/stl-data-pipeline/job';
  private BILLING_ID: string = '/settlement/addtl-comp/billing-id-list';
  private ADD_COMP: string = '/data-flow/task-executions/additional-compensation/multi';
  private REG = `/reg/stl-meter-file`;
  private GRP_API_URL: string = '/stl-data-pipeline/job/group';

  private paramUtil = inject(ParamsUtilService);
  private http = inject(HttpClient);

  public search(data: Partial<settlementParams>, searchName: string, tableParams?: TableParams): Observable<settlementTableDate>{
    const withName = {
      ...data,
      name: searchName
    }
    const params = this.paramUtil.buildParams(withName, tableParams);
    return this.http.get<settlementTableDate>(`${this.API_URL}/search-group`, { params });
  }

  public getBillingId(acPc: string, startDate: string, endDate: string): Observable<[]>{
    //hardcoding empty search - this is from previous apis
    const withSearch = {search: ' ', acPc, startDate, endDate};
    const params = this.paramUtil.buildParams(withSearch);
    return this.http.get<[]>(this.BILLING_ID, { params });
  }

  public getPricingConditionsBasedMtn(billId: string, acPc: string, startDate: string, endDate: string): Observable<[]>{
    const params = this.paramUtil.buildParams({billId, acPc, startDate, endDate})
    return this.http.get<[]>(this.BILLING_ID, { params });
  }

  //update type after testings
  public addtnlCompensationClaim(payload: any): Observable<any>{
    return this.http.post<any>(this.ADD_COMP, payload);
  }

  public publish(payload: PublishSettlement): Observable<BaseResponse> {
    return this.http.post<BaseResponse>(`${this.REG}/publish`, payload);
  }

  public etaJobs(payload: EnergyTradingAmounts, isGroupUrl = false): Observable<BaseResponse>{
    const endpoint = isGroupUrl ? this.GRP_API_URL : this.API_URL;
    return this.http.post<BaseResponse>(endpoint, payload);
  }

  public runJob(data: SettlementJobParams, pipelineName: string, isGroup = false, appendGroupUrl = false): Observable<null>{
    const bodyParams: Partial<SettlementJob> = {
      pipelineName,
      isGroup
    };

    if (data && Object.keys(data).length > 0) {
      bodyParams.parameters = data;
    }

    const groupUrl = appendGroupUrl ? '/group' : '';

    return this.http.post<null>(`${this.API_URL}${groupUrl}`, bodyParams);
  }

  public cancelRun(workspaceId: number): Observable<null> {
    return this.http.post<null>(`${this.API_URL}/cancel/${workspaceId}`, {});
  }

}
