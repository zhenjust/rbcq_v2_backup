import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { RBCQ_PROCESS_TYPE } from '@shared/constants/rbcq.const'; 
import { rbcqProcessOptions } from '@shared/interfaces/rbcq.interface'; 
import { RbcqRegion, RbcqProcessType } from '@shared/enums/rbcq.enum';
import { RbcqService } from '@shared/services/api/rbcq.service'; 
import { ToastrService } from 'ngx-toastr';
import { DateFormatterUtilService } from '@shared/services/utils';

interface FlaggedRow {
  dispatch_interval: string;
  region: string;
  flagged: string;
}

@Component({
  selector: 'app-rbcq-config',
  standalone: false,
  templateUrl: './rbcq-config.component.html',
  styleUrl: './rbcq-config.component.scss'
})
export class RbcqConfigComponent implements OnInit {

    public readonly rbcqProcessType: rbcqProcessOptions[] = RBCQ_PROCESS_TYPE;
    public readonly RbcqRegion = RbcqRegion;

    public readonly rbcqRegions = [
      { id: RbcqRegion.ALL, label: 'ALL', value: RbcqRegion.ALL },
      { id: RbcqRegion.LUZON, label: 'LUZON', value: RbcqRegion.LUZON },
      { id: RbcqRegion.VISAYAS, label: 'VISAYAS', value: RbcqRegion.VISAYAS },
      { id: RbcqRegion.MINDANAO, label: 'MINDANAO', value: RbcqRegion.MINDANAO },
    ];

  processType: string = '';
  // startDatetime: Date | null = null;
  // endDatetime: Date | null = null;
  startDatetime: Date ;
  endDatetime: Date ;
  isProcessing = false;

  rows: FlaggedRow[] = [];
  allRows: FlaggedRow[] = [];
  loading = false;



  // Pagination properties
  currentPage = 1;
  pageSize = 10;
  pageSizeOptions = [10, 20, 50, 100];
  totalItems = 0;

    regionRequiredValidator = (control: any): ValidationErrors | null => {
    return control.value?.length > 0 ? null : { required: true };
  };

  


    public rbcqProcessForm!: FormGroup;

    private readonly fb = inject(FormBuilder);
    private readonly toast = inject(ToastrService);
    private readonly rbcqService = inject(RbcqService);
    private readonly dateFormatter = inject(DateFormatterUtilService);

    

    ngOnInit(): void {
  this.rbcqProcessForm = this.fb.group(
    {
      regions: [[]],
      processType: [null, Validators.required],
      startDatetime: [null, Validators.required],
      endDatetime: [null, Validators.required],
    },
    { validators: [this.dateRangeValidator.bind(this), this.minuteIntervalValidator] }
  );

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

  isApFlagSelected(): boolean {
    return this.rbcqProcessForm.get('processType')?.value === RbcqProcessType.AP_FLAG;
  }

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

dateRangeValidator(group: FormGroup): ValidationErrors | null {
  const startValue = group.get('startDatetime')?.value;
  const endValue = group.get('endDatetime')?.value;

  const toTimestamp = (value: any): number | null => {
    if (value == null) {
      return null;
    }

    // Already a Date object
    if (value instanceof Date) {
      return value.getTime();
    }

    // String datetime
    if (typeof value === 'string') {
      // Convert to ISO-safe format
      const parsed = new Date(value.replace(' ', 'T'));
      return isNaN(parsed.getTime()) ? null : parsed.getTime();
    }

    // Numeric timestamp
    if (typeof value === 'number') {
      return value;
    }

    return null;
  };

  // Normalize seconds/milliseconds
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
    }

    if (start && !check(start)) return { invalidMinuteInterval: true };
    if (end && !check(end)) return { invalidMinuteInterval: true };
    return null;
  }

  onSubmitRbcqProcess(): void {
  // Check if form is invalid
  if (this.rbcqProcessForm.invalid) {
    this.toast.error('Please fill all required fields.');
    return;
  }

  // Get values from the form
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
    regions
  ).subscribe({
    next: (response) => {
      console.log('RBCQ process response:', response);

      this.isProcessing = false;
      this.toast.success('RBCQ process started.');
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

//flagged table methods

loadAPFlag(): void {
    // validate minute intervals
    if (!this.isFiveMinuteInterval(this.startDatetime) || !this.isFiveMinuteInterval(this.endDatetime)) {
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
        this.totalItems = this.allRows.length;
        this.currentPage = 1;
        this.updatePaginatedRows();
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

    private updatePaginatedRows(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.rows = this.allRows.slice(startIndex, endIndex);
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


  onPageChange(page: number): void {
    this.currentPage = page;
    this.updatePaginatedRows();
  }

    onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.updatePaginatedRows();
  }
   clear(): void {
    this.setDefaults();
    this.allRows = [];
    this.rows = [];
    this.currentPage = 1;
    this.totalItems = 0;
  }

  //flagged table methods

  

  // Removed polling-based progress tracking; replaced by simple request lifecycle loading state.

private setDefaults(): void {
  const now = new Date();
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const start = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 5, 0);
  const end = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate() + 1, 0, 0, 0);

  this.startDatetime = start;
  this.endDatetime = end;

  this.rbcqProcessForm.patchValue({
    startDatetime: start,
    endDatetime: end
  });
}





}
