import { Component, OnInit } from '@angular/core';
import { RbcqService } from '@shared/services/api/rbcq.service';
import { ToastrService } from 'ngx-toastr';

interface FinalizedRow {
  dispatch_interval: string;
  region: string;
  mtn: string;
  category: string;
  bcq: string;
}

@Component({
  selector: 'app-view-rbcq',
  standalone: false,
  templateUrl: './view-rbcq.component.html',
  styleUrls: ['./view-rbcq.component.scss'],
  
})
export class ViewRbcqComponent implements OnInit {
  rows: FinalizedRow[] = [];
  allRows: FinalizedRow[] = [];
  loading = false;

  // Pagination properties
  currentPage = 1;
  pageSize = 10;
  pageSizeOptions = [10, 20, 50, 100];
  totalItems = 0;

  // default dates: today start/end
  startDate: Date;
  endDate: Date;

  constructor(private rbcqService: RbcqService, private toast: ToastrService) { }

  ngOnInit(): void {
    this.setDefaults();
    this.load();
  }

  load(): void {
    // validate minute intervals
    if (!this.isFiveMinuteInterval(this.startDate) || !this.isFiveMinuteInterval(this.endDate)) {
      this.toast.error('Start and End minutes must be a 5-minute interval');
      return;
    }

    if (this.startDate >= this.endDate) {
      this.toast.error('Start date must be before End date');
      return;
    }

    this.loading = true;
    const s = this.formatLocal(this.startDate);
    const e = this.formatLocal(this.endDate);

    this.rbcqService.getFinalized(s, e).subscribe({
      next: data => {
        this.allRows = data || [];
        this.totalItems = this.allRows.length;
        this.currentPage = 1;
        this.updatePaginatedRows();
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  private isFiveMinuteInterval(d: Date | undefined | null): boolean {
    if (!d) return false;
    const m = d.getMinutes();
    return m % 5 === 0;
  }

  clear(): void {
    this.setDefaults();
    this.allRows = [];
    this.rows = [];
    this.currentPage = 1;
    this.totalItems = 0;
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updatePaginatedRows();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.updatePaginatedRows();
  }

  private updatePaginatedRows(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.rows = this.allRows.slice(startIndex, endIndex);
  }

  private setDefaults(): void {
    const now = new Date();
    // default to 00:05 and 23:55
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 5, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 55, 0);
    this.startDate = start;
    this.endDate = end;
  }

  private formatLocal(d: Date | undefined | null): string {
    if (!d) return '';
    const pad = (n: number) => n.toString().padStart(2, '0');
    const YYYY = d.getFullYear();
    const MM = pad(d.getMonth() + 1);
    const DD = pad(d.getDate());
    const hh = pad(d.getHours());
    const mm = pad(d.getMinutes());
    const ss = pad(d.getSeconds());
    return `${YYYY}-${MM}-${DD}T${hh}:${mm}:${ss}`;
  }

  private normalize(dt: string): string {
    if (!dt) return dt;
    // If browser datetime-local produces 'YYYY-MM-DDTHH:mm' add seconds
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(dt)) return dt + ':00';
    return dt;
  }

}

 
