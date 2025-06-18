import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ParamsUtilService } from '../utils';
import { settlementParams, settlementTableDate } from '@shared/interfaces';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettlementService {

  protected API_URL: string = '/stl-data-pipeline/job';
  protected BILLING_ID: string = '/settlement/addtl-comp/billing-id-list';
  protected ADD_COMP: string = '/data-flow/task-executions/additional-compensation/multi';


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
}
