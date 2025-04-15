import { Injectable } from '@angular/core';
import { apiPath } from '@shared/constants';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BcqService {
  protected baseEndpoint = environment.__API_URL__ + apiPath.__METERPROCESS_PATH__;

  constructor() { }
}
