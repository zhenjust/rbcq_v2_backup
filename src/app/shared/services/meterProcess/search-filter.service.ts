import { inject, Injectable } from '@angular/core';
import { meterProcessJobSearchGroupParams, meterProcessTable } from '@shared/interfaces';
import { BehaviorSubject } from 'rxjs';
import { MeterprocessService } from '../api';

@Injectable({
  providedIn: 'root'
})
export class SearchFilterService {
  isLoading: boolean = false;
  private jobsSubject = new BehaviorSubject<meterProcessTable | null>(null);
  public jobs$ = this.jobsSubject.asObservable();
  private mpa = inject(MeterprocessService);

  refreshJobs(params: meterProcessJobSearchGroupParams): void {
    this.isLoading = true;
    this.mpa.search(params).subscribe({
      next: (data) => {
        this.jobsSubject.next(data); // Emit to subscribers
      },
      error: (err) => {
        console.error(err);
        this.jobsSubject.next(null); // Optional: clear data on error
      }
    }).add(() => {
      this.isLoading = false;
    });
  }
}
