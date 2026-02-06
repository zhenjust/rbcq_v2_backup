import {inject, Pipe, PipeTransform} from '@angular/core';
import {AuthorizationService} from '@core/services/authorization.service';
import {PHASE_TWO_AUTHORITIES, SettlementStatus} from '@shared/constants';
import {JobSelect, settlementPipeline} from '@shared/interfaces';

@Pipe({
  name: 'stlActions',
  standalone: false
})
export class SettlementActionsPipe implements PipeTransform {

  private readonly ps = inject(AuthorizationService);

  stlStatus = SettlementStatus;
  settlementModules = ['reserveTradingAmounts', 'energyTradingAmounts'];


  transform(actions: JobSelect[], data: settlementPipeline, module: string): JobSelect[] {
    return actions
      .map(action => {
        const { value } = action;
        const { status } = data;
        const isSettlementModules = this.settlementModules.includes(module);

        if (value === 'publish') {
          action.show = !data.published;
        }

        if (value === 'generateInputWorkspace') {
          action = this.handleGenerateStatus(action, module, status as SettlementStatus);
        }

        if (value === 'cancelRun') {
          action.show = status.startsWith('In-Progress');
        }

        if (value === 'calculateEnergyTradingAmount') {
          action = this.handleCalculateTA(action, isSettlementModules, status as SettlementStatus);
        }

        if (value === 'generateMonthlySummary') {
          action.show = status === SettlementStatus.COMPLETED_SETTLEMENT_COMPLETE
        }

        return action;
      })
      .filter(action => action.show);
  }

  handleCalculateTA(action: JobSelect, isSettlementModule = true, status: SettlementStatus): JobSelect {
    const statuses = [
      SettlementStatus.COMPLETED_GENERATE_INPUT_WORKSPACE,
      SettlementStatus.FAILED_SETTLEMENT_CALCULATION,
      SettlementStatus.CANCELLED_SETTLEMENT_CALCULATION
    ];

    action.permissions = isSettlementModule ? [PHASE_TWO_AUTHORITIES.TA_CALCULATE_TA] : [];
    action.show = statuses.includes(status as SettlementStatus) && this.checkPermissions(action.permissions);

    return action;
  }

  handleGenerateStatus(action: JobSelect, module: string, status: SettlementStatus): JobSelect {
    const generateStatuses = [
      SettlementStatus.COMPLETED_SETTLEMENT_READY,
      SettlementStatus.COMPLETED_GENERATE_INPUT_WORKSPACE,
      SettlementStatus.CANCELLED_GENERATE_INPUT_WORKSPACE,
      SettlementStatus.FAILED_GENERATE_INPUT_WORKSPACE,
      SettlementStatus.COMPLETED_SETTLEMENT_CALCULATION,
      SettlementStatus.FAILED_GENERATE_INPUT_RESERVE_WORKSPACE,
      SettlementStatus.CANCELLED_GENERATE_INPUT_RESERVE_WORKSPACE
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
