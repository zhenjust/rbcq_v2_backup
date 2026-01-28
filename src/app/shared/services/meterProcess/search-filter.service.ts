import { inject, Injectable, signal } from '@angular/core';
import { meterProcessJobSearchGroupParams, meterProcessTable } from '@shared/interfaces';
import { MeterprocessService } from '../api';

@Injectable({
  providedIn: 'root'
})
export class SearchFilterService {
  private mpa = inject(MeterprocessService);

  // signals
  isLoading = signal<boolean>(false);
  jobs = signal<meterProcessTable | null>(null);
  error = signal<string | null>(null);

  refreshJobs(params: Partial<meterProcessJobSearchGroupParams>): void {
    this.isLoading.set(true);
    this.error.set(null); // Clear any previous errors

    this.mpa.search(params).subscribe({
      next: (data) => {
        this.jobs.set(data);
        this.error.set(null);
      },
      error: (err) => {
        console.error(err);
        this.jobs.set(null);
        this.error.set(err.message || 'Failed to load jobs');
      }
    }).add(() => {
      this.isLoading.set(false);
    });
  }
}