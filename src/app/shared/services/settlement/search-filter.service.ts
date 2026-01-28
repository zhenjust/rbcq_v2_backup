import { inject, Injectable, signal } from '@angular/core';
import { SettlementService } from '../api';
import { settlementParams, settlementTableDate } from '@shared/interfaces';

@Injectable({
  providedIn: 'root'
})
export class SearchFilterService {
  private sts = inject(SettlementService);

  isLoading = signal<boolean>(false);
  jobs = signal<settlementTableDate | null>(null);
  error = signal<string | null>(null);

  fetchJobs(searchParams: Partial<settlementParams> ,searchName: string): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.sts.search(searchParams, searchName).subscribe({
      next: (data) => {
        this.jobs.set(data); // Emit to subscribers
        this.error.set(null);
      },
      error: (err) => {
        console.error(err);
        this.jobs.set(null);
        this.error.set(err.message || 'something happened');
      }
    }).add(() => { this.isLoading.set(false)});
  }
}
