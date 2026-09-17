import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { RBCQ_PROCESS_TYPE } from '@shared/constants/rbcq.const';
import { rbcqProcessOptions } from '@shared/interfaces/rbcq.interface';
import { RbcqRegion, RbcqProcessType } from '@shared/enums/rbcq.enum';
import { RbcqService } from '@shared/services/api/rbcq.service';
import { ToastrService } from 'ngx-toastr';
import { DateFormatterUtilService } from '@shared/services/utils';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

interface FlaggedRow {
  dispatch_interval: string;
  region: string;
  flag: string;
}

@Component({
  selector: 'app-rbcq-config',
  standalone: false,
  templateUrl: './rbcq-config.component.html',
  styleUrl: './rbcq-config.component.scss'
})
export class RbcqConfigComponent implements OnInit {

  // ==================== RBCQ CONFIGURATION ====================

  public readonly rbcqProcessType: rbcqProcessOptions[] = RBCQ_PROCESS_TYPE;
  public readonly RbcqRegion = RbcqRegion;

  public readonly rbcqRegions = [
    { id: RbcqRegion.ALL, label: 'ALL', value: RbcqRegion.ALL },
    { id: RbcqRegion.LUZON, label: 'LUZON', value: RbcqRegion.LUZON },
    { id: RbcqRegion.VISAYAS, label: 'VISAYAS', value: RbcqRegion.VISAYAS },
    { id: RbcqRegion.MINDANAO, label: 'MINDANAO', value: RbcqRegion.MINDANAO },
  ];

  modalConfig = {
  nzOkText: 'Yes',
  nzCancelText: 'Cancel',
  nzCentered: true
  };

  processType: string = '';
  startDatetime: Date;
  endDatetime: Date;
  isProcessing = false;
  showFilters = false;

  selectedRegion = '';
  selectedFlag = '';

  public rbcqProcessForm!: FormGroup;

  // ==================== TABLE / PAGINATION ====================

  rows: FlaggedRow[] = [];
  allRows: FlaggedRow[] = [];
  filteredRows: FlaggedRow[] = [];
  loading = false;
  selectedRows: FlaggedRow[] = [];
  selectAll = false;

  currentPage = 1;
  pageSize = 10;
  pageSizeOptions = [10, 20, 50, 100, 500, 1000];
  totalItems = 0;

  // ==================== SERVICES ====================

  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastrService);
  private readonly rbcqService = inject(RbcqService);
  private readonly dateFormatter = inject(DateFormatterUtilService);

  // ==================== INITIALIZATION ====================

  ngOnInit(): void {
    this.rbcqProcessForm = this.fb.group(
      {
        regions: [[]],
        processType: [null, Validators.required],
        startDatetime: [null, Validators.required],
        endDatetime: [null, Validators.required],
      },
      {
        validators: [
          this.dateRangeValidator.bind(this),
          this.minuteIntervalValidator
        ]
      }
    );

    this.rbcqProcessForm.get('startDatetime')?.valueChanges.subscribe(() => {
      this.resetFlagTable();
    });

    this.rbcqProcessForm.get('endDatetime')?.valueChanges.subscribe(() => {
      this.resetFlagTable();
    });

    this.rbcqProcessForm.get('processType')?.valueChanges.subscribe((val) => {
      const regionCtrl = this.rbcqProcessForm.get('regions');

      if (val === RbcqProcessType.AP_FLAG) {
        regionCtrl?.setValidators([this.regionRequiredValidator]);
      } else {
        regionCtrl?.clearValidators();
        regionCtrl?.setValue([]);
      }

      regionCtrl?.updateValueAndValidity();
    });

    this.setDefaults();
  }

  // ==================== FORM VALIDATION ====================

  regionRequiredValidator = (control: any): ValidationErrors | null => {
    return control.value?.length > 0 ? null : { required: true };
  };

  dateRangeValidator(group: FormGroup): ValidationErrors | null {
    const startValue = group.get('startDatetime')?.value;
    const endValue = group.get('endDatetime')?.value;

    const toTimestamp = (value: any): number | null => {
      if (value == null) {
        return null;
      }

      if (value instanceof Date) {
        return value.getTime();
      }

      if (typeof value === 'string') {
        const parsed = new Date(value.replace(' ', 'T'));
        return isNaN(parsed.getTime()) ? null : parsed.getTime();
      }

      if (typeof value === 'number') {
        return value;
      }

      return null;
    };

    const normalize = (value: any): number | null => {
      const ts = toTimestamp(value);

      if (ts == null) {
        return null;
      }

      const d = new Date(ts);
      d.setSeconds(0);
      d.setMilliseconds(0);

      return d.getTime();
    };

    const start = normalize(startValue);
    const end = normalize(endValue);

    // Allow same datetime, only reject if end is earlier
    if (start != null && end != null && end < start) {
      return { invalidDateRange: true };
    }

    return null;
  }

  // Ensure minutes are multiples of 5 for both start and end
  minuteIntervalValidator = (group: FormGroup): ValidationErrors | null => {
    const start: Date | null = group.get('startDatetime')?.value;
    const end: Date | null = group.get('endDatetime')?.value;

    const check = (d: any) => {
      if (!d) return true;

      const date = new Date(d);

      if (isNaN(date.getTime())) return false;

      return date.getMinutes() % 5 === 0;
    };

    if (start && !check(start)) {
      return { invalidMinuteInterval: true };
    }

    if (end && !check(end)) {
      return { invalidMinuteInterval: true };
    }

    return null;
  };

  // ==================== PROCESS TYPE ====================

  isApFlagSelected(): boolean {
    return this.rbcqProcessForm.get('processType')?.value === RbcqProcessType.AP_FLAG;
  }

  isReserveAPSelected(): boolean {
    const selected = this.rbcqProcessForm.get('processType')?.value;

    if (selected === RbcqProcessType.ASIE_RESERVE_AP) {
      this.selectedFlag = 'Y';
    }

    return selected === RbcqProcessType.ASIE_RESERVE_AP;
  }

  // ==================== REGION SELECTION ====================

  onRegionChange(region: RbcqRegion, checked: boolean): void {
    const control = this.rbcqProcessForm.get('regions');
    let regions: RbcqRegion[] = [...(control?.value || [])];

    const allRegions = [
      RbcqRegion.LUZON,
      RbcqRegion.VISAYAS,
      RbcqRegion.MINDANAO
    ];

    if (region === RbcqRegion.ALL) {
      regions = checked ? [...allRegions] : [];
    } else {
      if (checked) {
        if (!regions.includes(region)) {
          regions.push(region);
        }
      } else {
        regions = regions.filter(r => r !== region);
      }
    }

    control?.setValue(regions);
    control?.markAsTouched();
    control?.updateValueAndValidity();
  }

  // ==================== RBCQ PROCESS ====================

 onSubmitRbcqProcess(): void {
  if (this.rbcqProcessForm.invalid) {
    this.toast.error('Please fill all required fields.');
    return;
  }

  if (this.isReserveAPSelected()) {
    const selectedCount = this.selectedRows.length;
    const remainingCount = this.filteredRows.length - selectedCount;

   

    this.modal.confirm({
      ...this.modalConfig,
      nzTitle: 'Confirm Process',
      nzContent: `
        <div>
          <p><strong>Selected Intervals:</strong> ${selectedCount}</p>
          <p><strong>Remaining Intervals:</strong> ${remainingCount}</p>
          <p>Are you sure you want to proceed?</p>
        </div>
      `,
      nzOnOk: () => {
        this.processRbcq();
      }
    });

    return;
  }

  this.processRbcq();
}

private processRbcq(): void {
  const {
    processType,
    regions,
    startDatetime,
    endDatetime
  } = this.rbcqProcessForm.value;

  this.isProcessing = true;

  this.rbcqService.submitRbcqProcess(
    processType,
    this.dateFormatter.formatDateTime(startDatetime),
    this.dateFormatter.formatDateTime(endDatetime),
    regions,
    this.isReserveAPSelected() ? this.selectedRows : []
  ).subscribe({
    next: (response) => {
      this.isProcessing = false;
      this.toast.success(response);
    },
    error: (err) => {
      console.error('Processing error:', err);

      const errorMsg =
        err?.error?.message ||
        err?.error ||
        'Failed to process RBCQ.';

      this.toast.error(errorMsg);
      this.isProcessing = false;
    }
  });
}

  private getSelectedReserveAPRows(): FlaggedRow[] {
  return this.selectedRows;
}

  // ==================== FLAG TABLE ====================

  viewFlag(): void {
    this.selectedRegion = '';
    this.selectedFlag = this.isReserveAPSelected() ? 'Y' : '';
    this.showFilters = false;

    this.loadAPFlag();
  }

  resetFlagTable(): void {
    this.allRows = [];
    this.filteredRows = [];
    this.rows = [];

    this.selectedRows = [];
    this.selectAll = false;

    this.totalItems = 0;
    this.currentPage = 1;
  }

  loadAPFlag(): void {
    if (
      !this.isFiveMinuteInterval(this.startDatetime) ||
      !this.isFiveMinuteInterval(this.endDatetime)
    ) {
      this.toast.error('Start and End minutes must be a 5-minute interval');
      return;
    }

    if (this.startDatetime > this.endDatetime) {
      this.toast.error('Start date must be before End date');
      return;
    }

    this.loading = true;

    const s = this.formatLocal(this.startDatetime);
    const e = this.formatLocal(this.endDatetime);

    this.rbcqService.getRbcqFlagged(s, e).subscribe({
      next: data => {
        this.allRows = data || [];

        console.log('API DATA:', this.allRows);
        console.log('REGIONS:', this.allRows.map(x => x.region));
        console.log('FLAGS:', this.allRows.map(x => x.flag));

        // Apply current filters
        this.applyFilters();

        this.loading = false;
      },

      error: () => {
        this.loading = false;
      }
    });
  }

  downloadASIE() {
  const startDatetime = this.rbcqProcessForm.get('startDatetime')?.value;
  const endDatetime = this.rbcqProcessForm.get('endDatetime')?.value;

  const s = this.formatLocal(startDatetime);
  const e = this.formatLocal(endDatetime);

  this.rbcqService.downloadASIE(s, e)
    .subscribe(response => {

      const blob = new Blob(
        [response.body!],
        { type: 'text/csv' }
      );

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `ASIE_${s.substring(0, 10)}_${e.substring(0, 10)}.csv`;

      a.click();

      window.URL.revokeObjectURL(url);
    });
}

  // ==================== TABLE FILTERS ====================

  applyFilters(): void {
    let filtered = this.allRows;

    if (this.selectedRegion) {
      filtered = filtered.filter(row =>
        row.region === this.selectedRegion
      );
    }

    if (this.selectedFlag) {
      filtered = filtered.filter(row =>
        row.flag === this.selectedFlag
      );
    }

    this.filteredRows = filtered;
    this.totalItems = filtered.length;
    this.currentPage = 1;

    this.updatePaginatedRows();
  }

  clearFilters(): void {
    this.selectedRegion = '';
    this.selectedFlag = '';

    this.filteredRows = [...this.allRows];

    this.totalItems = this.filteredRows.length;
    this.currentPage = 1;

    this.updatePaginatedRows();
  }

  // ==================== PAGINATION ====================

  private updatePaginatedRows(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    this.rows = this.filteredRows.slice(startIndex, endIndex);

    this.updateSelectAllState();
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

  // ==================== ROW SELECTION ====================

  toggleRowSelection(row: FlaggedRow, checked: boolean): void {
    if (checked) {
      if (!this.selectedRows.includes(row)) {
        this.selectedRows.push(row);
      }
    } else {
      this.selectedRows = this.selectedRows.filter(x => x !== row);
    }

    this.updateSelectAllState();
  }

  toggleSelectAll(checked: boolean): void {
    if (checked) {
      this.rows.forEach(row => {
        if (!this.selectedRows.includes(row)) {
          this.selectedRows.push(row);
        }
      });
    } else {
      this.selectedRows = this.selectedRows.filter(
        selected => !this.rows.includes(selected)
      );
    }

    this.updateSelectAllState();
  }

  private updateSelectAllState(): void {
    this.selectAll =
      this.rows.length > 0 &&
      this.rows.every(row => this.selectedRows.includes(row));
  }

  // ==================== DATE / DEFAULTS ====================

  private setDefaults(): void {
    const now = new Date();
    const yesterday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 1
    );

    const start = new Date(
      yesterday.getFullYear(),
      yesterday.getMonth(),
      yesterday.getDate(),
      0,
      5,
      0
    );

    const end = new Date(
      yesterday.getFullYear(),
      yesterday.getMonth(),
      yesterday.getDate() + 1,
      0,
      0,
      0
    );

    this.startDatetime = start;
    this.endDatetime = end;

    this.rbcqProcessForm.patchValue({
      startDatetime: start,
      endDatetime: end
    });
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

  private isFiveMinuteInterval(d: Date | undefined | null): boolean {
    if (!d) return false;

    const m = d.getMinutes();
    return m % 5 === 0;
  }

  // ==================== CLEAR ====================

  clear(): void {
    this.setDefaults();

    this.allRows = [];
    this.filteredRows = [];
    this.rows = [];

    this.selectedRegion = '';
    this.selectedFlag = '';
    this.showFilters = false;

    this.currentPage = 1;
    this.totalItems = 0;
  }

  // ==================== UTILITY ====================

  
// ==================== UTILITY ====================

private readonly modal = inject(NzModalService);

confirmAction(action: string, message?: string): NzModalRef {
  return this.modal.confirm({
    ...this.modalConfig,
    nzTitle: action,
    nzContent: message || 'Are you sure you want to continue?'
  });
}

}
