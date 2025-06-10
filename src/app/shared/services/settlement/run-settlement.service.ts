import { Injectable } from '@angular/core';
import { settlementPipeline } from '@shared/interfaces';

@Injectable({
  providedIn: 'root'
})
export class RunSettlementService {
  runSummary(data: settlementPipeline): void {
    console.log('Full row data for view:', data);
  }

  generateFiles(data: settlementPipeline): void {
    console.log('Full row data for edit:', data);
  }

  publishTransactionReports(data: settlementPipeline): void {
    console.log('Full row data for download:', data);
  }
}
