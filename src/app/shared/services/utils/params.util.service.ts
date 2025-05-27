import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ParamsUtilService {
  public buildParams(data: Record<string, any>): HttpParams {
      let params = new HttpParams();
      
      Object.entries(data).forEach(([key, value]) => {
        if (this.isValidValue(value)) {
          if (Array.isArray(value)) {
            // Handle arrays
            value.forEach(item => params = params.append(key, item.toString()));
          } else {
            params = params.set(key, value.toString());
          }
        }
      });
      
      return params;
    }

    private isValidValue(value: any): boolean {
      return value !== undefined && 
            value !== null && 
            value !== '' && 
            (!Array.isArray(value) || value.length > 0);
    }
}
