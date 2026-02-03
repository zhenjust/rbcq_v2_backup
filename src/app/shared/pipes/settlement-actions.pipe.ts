import { inject, Pipe, PipeTransform } from '@angular/core';
import { AuthorizationService } from '@core/services/authorization.service';
import { PHASE_TWO_AUTHORITIES, SettlementStatus } from '@shared/constants';
import { JobSelect, settlementPipeline } from '@shared/interfaces';

@Pipe({
  name: 'stlActions',
  standalone: false
})
export class SettlementActionsPipe implements PipeTransform {

  private readonly ps = inject(AuthorizationService);

  transform(actions: JobSelect[], data: settlementPipeline, module: string): JobSelect[] {
    const filteredActions = actions
      .map(action => {
        const { value } = action;
        const { status } = data;
        const isSettlementModules = ['reserveTradingAmounts', 'energyTradingAmounts'].includes(module);

        if (value === 'publish') {
          action.show = !data.published;
        }

        if (value === 'generate') {
          action = this.handleGenerateStatus(action, module, status as SettlementStatus);
        }

        if (value === 'cancelRun') {
          action.show = status.startsWith('In-Progress');
        }

        if (value === 'calculateEnergyTradingAmount') {
          action.permissions = isSettlementModules ? [PHASE_TWO_AUTHORITIES.TA_CALCULATE_TA] : [];
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

  handleGenerateStatus(action: JobSelect, module: string, status: SettlementStatus): JobSelect {
    const stlStatus = SettlementStatus;

    const generateStatuses = [
      stlStatus.COMPLETED_SETTLEMENT_READY,
      stlStatus.COMPLETED_GENERATE_INPUT_WORKSPACE,
      stlStatus.CANCELLED_GENERATE_INPUT_WORKSPACE,
      stlStatus.FAILED_GENERATE_INPUT_WORKSPACE,
      stlStatus.COMPLETED_SETTLEMENT_CALCULATION
    ];

    const hasPermissions = ['reserveTradingAmounts', 'energyTradingAmounts'].includes(module);

    action.permissions = hasPermissions ? [PHASE_TWO_AUTHORITIES.TA_GENERATE_IW] : [];
    action.show = generateStatuses.includes(status) && this.checkPermissions(action.permissions);

    return action;
  }

  checkPermissions(permissions: string[]): boolean {
    const auths = this.ps.currentUser()?.principal?.privileges || [];
    return auths?.some(auth => permissions.includes(auth));
  }
}
