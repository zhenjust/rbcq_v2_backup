import { Component, OnInit } from '@angular/core';
import { MeterProcessTypes, RegionGroup } from '@shared/enums';
import { meterProcessTableData } from '@shared/interfaces';

@Component({
  selector: 'app-table',
  standalone: false,
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
})
export class TableComponent implements OnInit {

  //mock data
  mockMeterProcessData: meterProcessTableData[] = [
    {
      date: '2025-04-01',
      processType: MeterProcessTypes.ADJUSTMENT,
      regionGroup: RegionGroup.ALL,
      adjNo: 'ADJ-2025-001',
      billingPeriod: 2505,
      billingPeriodName: 'April 2025',
      taskExecutionDtoList: []
    },
    {
      date: '2025-03-15',
      processType: MeterProcessTypes.FINAL,
      regionGroup: RegionGroup.LUZON,
      adjNo: null,
      billingPeriod: 2503,
      billingPeriodName: 'March 2025',
      taskExecutionDtoList: []
    },
    {
      date: '2025-03-01',
      processType: MeterProcessTypes.PRELIMINARY,
      regionGroup: RegionGroup.VISAYAS,
      adjNo: null,
      billingPeriod: 2503,
      billingPeriodName: 'March 2025',
      taskExecutionDtoList: []
    },
    {
      date: '2025-02-25',
      processType: MeterProcessTypes.DAILY,
      regionGroup: RegionGroup.MINDANAO,
      adjNo: null,
      billingPeriod: 2502,
      billingPeriodName: 'February 2025',
      taskExecutionDtoList: []
    },
    {
      date: '2025-02-15',
      processType: MeterProcessTypes.ADJUSTMENT,
      regionGroup: RegionGroup.ALL,
      adjNo: 'ADJ-2025-002',
      billingPeriod: 2502,
      billingPeriodName: 'February 2025',
      taskExecutionDtoList: []
    },
    {
      date: '2025-02-01',
      processType: MeterProcessTypes.FINAL,
      regionGroup: RegionGroup.LUZON,
      adjNo: null,
      billingPeriod: 2501,
      billingPeriodName: 'January 2025',
      taskExecutionDtoList: []
    },
    {
      date: '2025-01-20',
      processType: MeterProcessTypes.PRELIMINARY,
      regionGroup: RegionGroup.MINDANAO,
      adjNo: null,
      billingPeriod: 2501,
      billingPeriodName: 'January 2025',
      taskExecutionDtoList: []
    },
    {
      date: '2025-01-10',
      processType: MeterProcessTypes.DAILY,
      regionGroup: RegionGroup.VISAYAS,
      adjNo: null,
      billingPeriod: 2501,
      billingPeriodName: 'January 2025',
      taskExecutionDtoList: []
    },
    {
      date: '2024-12-15',
      processType: MeterProcessTypes.ADJUSTMENT,
      regionGroup: RegionGroup.ALL,
      adjNo: 'ADJ-2024-125',
      billingPeriod: 2412,
      billingPeriodName: 'December 2024',
      taskExecutionDtoList: []
    },
    {
      date: '2024-12-01',
      processType: MeterProcessTypes.FINAL,
      regionGroup: RegionGroup.MINDANAO,
      adjNo: null,
      billingPeriod: 2411,
      billingPeriodName: 'November 2024',
      taskExecutionDtoList: []
    }
  ];

  expandSet = new Set<number>();

  onExpandChange(id: number, checked: boolean): void {
    if (checked) {
      this.expandSet.add(id);
    } else {
      this.expandSet.delete(id);
    }
  }

  trackByBillingPeriod(index: number, item: meterProcessTableData): number {
    return item.billingPeriod;
  }

  constructor() {}

  ngOnInit(): void {
    this.mockMeterProcessData;
  }
}