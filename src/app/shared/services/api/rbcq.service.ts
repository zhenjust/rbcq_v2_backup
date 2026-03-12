import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiPath } from '@shared/constants';
import { DateFormatterUtilService } from '../utils';

@Injectable({
  providedIn: 'root'
})
export class RbcqService {

  private readonly BASE_URL = apiPath._RBCQ_PATH_ ;

  constructor(private http: HttpClient
  ) {}


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
  endDatetime: string
): Observable<string> {
  const payload = {
    processType,
    startDatetime,
    endDatetime
  };

  return this.http.post(`${this.BASE_URL}/${processType.toLowerCase()}`, payload, {
    responseType: 'text' as const 
  });
}



  getInitializationProgress(jobId: string): Observable<number> {
  return this.http.get<number>(`${this.BASE_URL}/initialize/progress/${jobId}`);
}

}
