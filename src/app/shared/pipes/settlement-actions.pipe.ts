import { Pipe, PipeTransform } from '@angular/core';
import { SettlementStatus } from '@shared/constants';
import { JobSelect, settlementPipeline } from '@shared/interfaces';

@Pipe({
  name: 'stlActions',
  standalone: false
})
export class SettlementActionsPipe implements PipeTransform {


  transform(actions: JobSelect[], data: settlementPipeline): JobSelect[] {
    const stlStatus = SettlementStatus;

    const filteredActions = actions
      .map(action => {
        const { value } = action;
        const { status } = data;

        if (value === 'publish') {
          action.show = !data.published;
        }

        if (value === 'generate') {
          const generateStatuses = [
            stlStatus.COMPLETED_SETTLEMENT_READY,
            stlStatus.COMPLETED_GENERATE_INPUT_WORKSPACE,
            stlStatus.CANCELLED_GENERATE_INPUT_WORKSPACE,
            stlStatus.FAILED_GENERATE_INPUT_WORKSPACE,
            stlStatus.COMPLETED_SETTLEMENT_CALCULATION
          ];

          action.show = generateStatuses.includes(status as SettlementStatus);
        }

        if (value === 'cancelRun') {
          action.show = status.startsWith('In-Progress');
        }

        if (value === 'calculateEnergyTradingAmount') {
          action.show = status === SettlementStatus.COMPLETED_GENERATE_INPUT_WORKSPACE;
        }

        if (value === 'generateMonthlySummary') {
          action.show = status === SettlementStatus.COMPLETED_SETTLEMENT_COMPLETE
        }

        return action;
      })
      .filter(action => action.show);

    return filteredActions;
  }
}