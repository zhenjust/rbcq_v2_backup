import { Component, OnInit } from '@angular/core';
import { RbcqService } from '@shared/services/api/rbcq.service';

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
  loading = false;

  // default dates: today start/end
  startDate: Date;
  endDate: Date;

  constructor(private rbcqService: RbcqService) { }

  ngOnInit(): void {
    this.setDefaults();
    this.load();
  }

  load(): void {
    this.loading = true;
    const s = this.formatLocal(this.startDate);
    const e = this.formatLocal(this.endDate);

    this.rbcqService.getFinalized(s, e).subscribe({
      next: data => {
        this.rows = data || [];
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  clear(): void {
    this.setDefaults();
    this.rows = [];
  }

  private setDefaults(): void {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
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

 
