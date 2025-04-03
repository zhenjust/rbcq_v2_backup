import { Injectable } from '@angular/core';
import { apiPath } from '@shared/constants';

@Injectable({
  providedIn: 'root'
})
export class BcqService {
  protected baseEndpoint = apiPath.__METERPROCESS_PATH__

  constructor() { }
}
