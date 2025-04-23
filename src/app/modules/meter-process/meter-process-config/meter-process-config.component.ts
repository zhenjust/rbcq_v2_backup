import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MeterProcessTypes, RegionGroup } from '@shared/enums';
import { meterProcessPayload, meterProcessOptions } from '@shared/interfaces';
import { debounceTime } from 'rxjs/operators';
import { METER_PROCESS_TYPE_OPTION } from '@shared/constants';

@Component({
  selector: 'app-meter-process-config',
  standalone: false,
  templateUrl: './meter-process-config.component.html',
  styleUrl: './meter-process-config.component.scss'
})
export class MeterProcessConfigComponent implements OnInit {
  meterProcessTypeOptions: meterProcessOptions[] = METER_PROCESS_TYPE_OPTION;
  meterProcessRegionGroup: {label: string, value: RegionGroup}[] = [];
  meterProcessForm!: FormGroup;
  MeterProcessTypes = MeterProcessTypes;
  
  constructor(private fb: FormBuilder) {}
  
  //TODO update active form updates to observable object for dynamic get functionality on the table component
  ngOnInit(): void {
    this.meterProcessForm = this.fb.group({
      processType: [MeterProcessTypes.DAILY, Validators.required],
      tradingDate: [''],
      billingPeriod: [''],
      startDate: [''],
      endDate: [''],
      regionGroup: [''],
      adjustmentNumber: ['']
    });
    
    this.meterProcessRegionGroup = Object.entries(RegionGroup).map(([key, value]) => ({
      label: key,
      value: value
    }));
    
    this.meterProcessForm.valueChanges
      .pipe(debounceTime(300)) // debounce for UX
      .subscribe(formValue => {
        this.saveChanges(formValue as meterProcessPayload);
      });
    
    this.meterProcessForm.get('processType')?.valueChanges.subscribe(value => {
      this.handleProcessTypeChange(value);
    });
  }
  
  saveChanges(formValue: meterProcessPayload): void {
    this.onProcessTypeChange(formValue.processType);
  }
  
  onProcessTypeChange(value: string): void {
  }

  handleProcessTypeChange(value: string): void {
    //disabling fields just in case
    if (value !== MeterProcessTypes.DAILY) {
      this.meterProcessForm.get('billingPeriod')?.enable();
      this.meterProcessForm.get('startDate')?.enable();
      this.meterProcessForm.get('endDate')?.enable();
    } else {
      this.meterProcessForm.get('billingPeriod')?.disable();
      this.meterProcessForm.get('startDate')?.disable();
      this.meterProcessForm.get('endDate')?.disable();
    }
  }
}