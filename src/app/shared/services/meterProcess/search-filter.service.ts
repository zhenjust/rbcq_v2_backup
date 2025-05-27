import { Injectable } from '@angular/core';
import { meterProcessParams, meterProcessSearch } from '@shared/interfaces';
import { BehaviorSubject } from 'rxjs';
import { MeterprocessService } from '../api';

@Injectable({
  providedIn: 'root'
})
export class SearchFilterService {
  isLoading: boolean = false;
  private jobsSubject = new BehaviorSubject<meterProcessSearch | null>(null);
  public jobs$ = this.jobsSubject.asObservable();

  constructor(
    private mpa: MeterprocessService
  ) { }

  refreshJobs(params: meterProcessParams): void {
    this.mpa.search(params).subscribe();
  }
}
