import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { apiPath } from '@shared/constants';
import { AuthorizationService } from '@core/services/authorization.service';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RbcqService {

  private readonly BASE_URL = apiPath._RBCQ_PATH_ ;
  // private readonly BASE_URL = 'http://localhost:8080/rbcq';

  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthorizationService);


  uploadCsv(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(this.BASE_URL + '/import', formData, {
      responseType: 'text'
    });
  }
  
  submitRbcqProcess(
  processType: string,
  startDatetime: string,
  endDatetime: string,
  regions?: string
): Observable<string> {
  const current = (this.auth as any).currentUser ? (this.auth as any).currentUser() : this.auth.identity();
  const payload: any = {
    processType,
    startDatetime,
    endDatetime
  };

  if (regions != null) {
    payload.regions = regions;
  }

  if (current?.principal?.username) {
    payload.requestedBy = current.principal.username;
  }

  return this.http.post(`${this.BASE_URL}/${processType.toLowerCase()}`, payload, {
    responseType: 'text' as const 
  });
}



  getInitializationProgress(jobId: string): Observable<number> {
  return this.http.get<number>(`${this.BASE_URL}/initialize/progress/${jobId}`);
}

  /**
   * Fetch paginated rows from the rbcq_final table (backend endpoint assumed at /final)
   * Returns an object matching TableDataResult<T>
   */



  getFinalized(startDate: string, endDate: string): Observable<any[]> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);


    return this.http.get<any[]>(`${this.BASE_URL}/finalized`, { params });
  }

}
