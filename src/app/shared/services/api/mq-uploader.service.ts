import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { apiPath } from '@shared/constants';
import { MqList, MspList, TableDataResult, TableParams } from '@shared/interfaces';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { ParamsUtilService } from '../utils';

@Injectable({
  providedIn: 'root'
})
export class MqUploaderService {

  protected regEndpoint = environment.__API_URL__ + apiPath.__REG_PATH__;
  protected meteringEndpoint = environment.__API_URL__ + apiPath.__METERING_PATH__;
  protected meteringCloudEndpoint = environment.__CLOUD_API_URL__ + apiPath.__METERING_PATH__;

  private readonly http = inject(HttpClient);
  private readonly psUtil = inject(ParamsUtilService);

  public getMspList(): Observable<MspList[]> {
    return this.http.get<MspList[]>(`${this.regEndpoint}/participants/category/msp`);
  }

  public getList(filters: any, tableParams: TableParams): Observable<TableDataResult<MqList[]>> {
    const params = this.psUtil.buildParams(filters, tableParams);
    return this.http.get<TableDataResult<MqList[]>>(`${this.meteringCloudEndpoint}/mq/mqfilter`, { params });
  }

  public uploadMq(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.meteringCloudEndpoint}/uploadData`, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }

  public uploadMqHeader(payload: any): Observable<any> {
    return this.http.post<any>(`${this.meteringCloudEndpoint}/uploadHeader`, payload);
  }

}
