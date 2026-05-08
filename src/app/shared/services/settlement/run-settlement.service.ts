import {inject, Injectable} from '@angular/core';
import {BaseResponse, EnergyTradingAmounts, settlementPipeline} from '@shared/interfaces';
import {MeterProcessTypes} from '@shared/enums';
import {SettlementService} from '../api';
import {ToastrService} from 'ngx-toastr';
import {DateFormatterUtilService} from '../utils';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RunSettlementService {
  private stlApi = inject(SettlementService);
  private dateFormatter = inject(DateFormatterUtilService);
  public toast = inject(ToastrService);

  runSummary(data: settlementPipeline): void {
    console.log('Full row data for view:', data);
  }

  generateFiles(data: settlementPipeline): void {
    console.log('Full row data for edit:', data);
  }

  publishTransactionReports(data: settlementPipeline): void {
    console.log('Full row data for download:', data);
  }

  etaStlJobs(data: settlementPipeline, jobName: string, isGroupUrl = false): Observable<BaseResponse> {
    const payload = this.buildPayload(data, jobName);
    return this.stlApi.etaJobs(payload, isGroupUrl)
  }

  viewCalculations(data: settlementPipeline): void {
    console.log('View Calculations - Full row data:', data);
  }

  validateInput(data: settlementPipeline): void {
    console.log('Validate Input - Full row data:', data);
  }

  viewValidations(data: settlementPipeline): void {
    console.log('View Validations - Full row data:', data);
  }

  // helper functions
  private buildPayload(data: settlementPipeline, pipelineName: string ): EnergyTradingAmounts {
    const [start, end] = this.getDateRangeForProcessType(data);
    return {
      pipelineName,
      refId: data?.id,
      isGroup: true,
      parameters: {
        billingStartDate: start ? this.dateFormatter.formatDateOnly(start) : null,
        billingEndDate: end ? this.dateFormatter.formatDateOnly(end) : null,
        processType: data.processType,
        meteringWorkspaceId: 'energyTradingAmounts-generateInputWorkspace' == pipelineName ? data?.workspaceId : null
      }
    };
  }

  private getDateRangeForProcessType(rowData: settlementPipeline): [string, string] {
    const isDaily = rowData.processType === MeterProcessTypes.DAILY;

    if (isDaily) {
      return [rowData.tradingDate, rowData.tradingDate];
    }

    return [
      rowData.billingStartDate,
      rowData.billingEndDate
    ];
  }
}
