import { inject, Injectable } from '@angular/core';
import { SettlementService } from '../api';
import { BehaviorSubject } from 'rxjs';
import { settlementParams, settlementTableDate } from '@shared/interfaces';

@Injectable({
  providedIn: 'root'
})
export class SearchFilterService {
  isLoading: boolean = false;
  private jobsSubject = new BehaviorSubject<settlementTableDate | null>(null);
  public jobs$ = this.jobsSubject.asObservable();
  private sts = inject(SettlementService);

  fetchJobs(searchParams: settlementParams ,searchName: string): void {
    this.isLoading = true;
    this.sts.search(searchParams, searchName).subscribe({
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
