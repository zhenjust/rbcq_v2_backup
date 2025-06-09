import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Data } from '@angular/router';
import { settlementSearchNames } from '@shared/enums';
import { meterProcessBillingPeriod } from '@shared/interfaces';
import { MeterprocessService } from '@shared/services/api';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-filter-file-claim',
  standalone: false,
  templateUrl: './filter-file-claim.component.html',
  styleUrl: './filter-file-claim.component.scss'
})
export class FilterFileClaimComponent implements OnInit, OnDestroy {
  searchName: string = '';
  fileClaimForm!: FormGroup;
  meterProcessBillingPeriod: meterProcessBillingPeriod[] = []; 
  private destroy$ = new Subject<void>();
  @ViewChild('fileClaim', { static: true }) fileClaim!: TemplateRef<void>;

  constructor(
    public modal: NzModalService,
    private router: ActivatedRoute,
    private mpa: MeterprocessService,
  ) {}

  get isFileClaimPage(): boolean {
    return this.searchName === settlementSearchNames.MANAGE_ADD_COM_CLAIMS;
  }

  private getBillingperiod(): void {
    this.mpa.getBillingPeriod().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.meterProcessBillingPeriod = Array.isArray(data) ? data : Object.values(data);
      },
      error: (err) => console.error(err)
    });
  }

  ngOnInit(): void{
    this.router.data.subscribe((data: Data) => {
      this.searchName = data['searchName'] as string;
    })
    this.isFileClaimPage;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fileClaimModal(): void {
    this.getBillingperiod();
    this.modal.create({
      nzWidth: 800,
      nzTitle: 'File a Claim',
      nzContent: this.fileClaim,
      nzOkText: 'Run Job',
      nzCancelText: 'Cancel',
    });
  }
}
