import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FULL_SETTLEMENT_OPTIONS, MARKET_FEE_SETTLEMENT_OPTIONS } from '@shared/constants';
import { settlementJobInstanceOptions } from '@shared/interfaces';

@Component({
  selector: 'app-filter-search',
  standalone: false,
  templateUrl: './filter-search.component.html',
  styleUrl: './filter-search.component.scss'
})
export class FilterSearchComponent implements OnInit {
  settlementForm!: FormGroup;
  settlementOptions: settlementJobInstanceOptions[] = [];
  
  constructor(private fb: FormBuilder) {}
  
  ngOnInit(): void {
    this.settlementForm = this.fb.group({
      settlementType: [FULL_SETTLEMENT_OPTIONS[1]]
    });
    this.settlementOptions = FULL_SETTLEMENT_OPTIONS;
  }
  
  toggleOptionSet(useMarketFeeOnly: boolean): void {
    this.settlementOptions = useMarketFeeOnly ? 
      MARKET_FEE_SETTLEMENT_OPTIONS : 
      FULL_SETTLEMENT_OPTIONS;
  }
  
  onSubmit(): void {
    if (this.settlementForm.valid) {
      const selectedType = this.settlementForm.get('settlementType')?.value;
      console.log('Selected settlement type:', selectedType);
      // Further processing...
    }
  }
}
