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

  generateInputWorkspace(data: settlementPipeline): void {
    console.log('Generate Input Workspace - Full row data:', data);
  }

  finalizeTradingAmounts(data: settlementPipeline): void {
    console.log('Finalize Trading Amounts - Full row data:', data);
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
}
