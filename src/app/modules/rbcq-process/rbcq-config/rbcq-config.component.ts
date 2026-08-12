import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { RBCQ_PROCESS_TYPE } from '@shared/constants/rbcq.const'; 
import { rbcqProcessOptions } from '@shared/interfaces/rbcq.interface'; 
import { RbcqRegion, RbcqProcessType } from '@shared/enums/rbcq.enum';
import { RbcqService } from '@shared/services/api/rbcq.service'; 
import { ToastrService } from 'ngx-toastr';
import { DateFormatterUtilService } from '@shared/services/utils';

@Component({
  selector: 'app-rbcq-config',
  standalone: false,
  templateUrl: './rbcq-config.component.html',
  styleUrl: './rbcq-config.component.scss'
})
export class RbcqConfigComponent implements OnInit {

    public readonly rbcqProcessType: rbcqProcessOptions[] = RBCQ_PROCESS_TYPE;

    public readonly rbcqRegions = [
      { id: RbcqRegion.ALL, label: 'ALL', value: RbcqRegion.ALL },
      { id: RbcqRegion.LUZON, label: 'LUZON', value: RbcqRegion.LUZON },
      { id: RbcqRegion.VISAYAS, label: 'VISAYAS', value: RbcqRegion.VISAYAS },
      { id: RbcqRegion.MINDANAO, label: 'MINDANAO', value: RbcqRegion.MINDANAO },
    ];

  processType: string = '';
  startDatetime: Date | null = null;
  endDatetime: Date | null = null;
  isProcessing = false;


    public rbcqProcessForm!: FormGroup;

    constructor(private fb: FormBuilder,
                private toast: ToastrService,
                private rbcqService: RbcqService,
                private dateFormatter: DateFormatterUtilService
                
    ) {}

    ngOnInit(): void {
    this.rbcqProcessForm = this.fb.group(
      {
        processType: [null, Validators.required],
        region: [null],
        startDatetime: [null, Validators.required],
        endDatetime: [null, Validators.required],
      },
        { validators: [this.dateRangeValidator.bind(this), this.minuteIntervalValidator] } 
    );

    // show/require region when AP FLAG is selected
    this.rbcqProcessForm.get('processType')?.valueChanges.subscribe((val) => {
      const regionCtrl = this.rbcqProcessForm.get('region');
      if (val === RbcqProcessType.AP_FLAG) {
        regionCtrl?.setValidators([Validators.required]);
      } else {
        regionCtrl?.clearValidators();
        regionCtrl?.setValue(null);
      }
      regionCtrl?.updateValueAndValidity();
    });
  }

  isApFlagSelected(): boolean {
    return this.rbcqProcessForm.get('processType')?.value === RbcqProcessType.AP_FLAG;
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

  console.log('startValue:', startValue);
  console.log('endValue:', endValue);
  console.log('normalized start:', start);
  console.log('normalized end:', end);

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
    if (this.rbcqProcessForm.invalid) {
      this.toast.error('Please fill all required fields.');
      return;
    }

  const { processType, region, startDatetime, endDatetime } = this.rbcqProcessForm.value;

    this.isProcessing = true;

    this.rbcqService.submitRbcqProcess(
      processType,          
      this.dateFormatter.formatDateTime(startDatetime),
      this.dateFormatter.formatDateTime(endDatetime),
      region
    ).subscribe({
      next: (_response: string) => {
        // Request completed successfully (backend may return job id or message)
        this.isProcessing = false;
        this.toast.success('RBCQ process started.');
      },
      error: (err) => {
        console.error('Processing error:', err);
        const errorMsg = err?.error || 'Failed to process RBCQ.';
        this.toast.error(errorMsg);
        this.isProcessing = false;
      }
    });
  }


  // Removed polling-based progress tracking; replaced by simple request lifecycle loading state.







}
