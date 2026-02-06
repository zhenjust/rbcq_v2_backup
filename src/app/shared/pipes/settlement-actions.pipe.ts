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

        if (value === 'calculateEnergyTradingAmount' || value === 'calculateReserveTradingAmount') {
          action = this.handleCalculateTA(action, isSettlementModules, status as SettlementStatus, module);
        }

        if (value === 'generateMonthlySummary') {
          action.show = status === SettlementStatus.COMPLETED_SETTLEMENT_COMPLETE
        }

        if (value === 'generate_energy_files' || value === 'generate_reserve_files') {
          action = this.handleGenerateFiles(action, isSettlementModules, status as SettlementStatus, module);
        }

        return action;
      })
      .filter(action => action.show);
  }

  handleCalculateTA(action: JobSelect, isSettlementModule = true, status: SettlementStatus, module: string): JobSelect {
    const isRta = module === 'reserveTradingAmounts' && action.value === 'calculateReserveTradingAmount';
    const isEta = module === 'energyTradingAmounts' && action.value === 'calculateEnergyTradingAmount';

    const statuses = [
      ...(isRta ? [
        SettlementStatus.COMPLETED_GENERATE_RESERVE_INPUT_WORKSPACE,
        SettlementStatus.CANCELLED_RESERVE_SETTLEMENT_CALCULATION,
        SettlementStatus.FAILED_RESERVE_SETTLEMENT_CALCULATION
      ] : []),
      ...(isEta ? [
        SettlementStatus.COMPLETED_GENERATE_INPUT_WORKSPACE,
        SettlementStatus.FAILED_SETTLEMENT_CALCULATION,
        SettlementStatus.CANCELLED_SETTLEMENT_CALCULATION
      ] : []),
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

  handleGenerateFiles(action: JobSelect, isSettlementModule = true, status: SettlementStatus, module: string): JobSelect {
    const isRta = module === 'reserveTradingAmounts' && action.value === 'generate_reserve_files';
    const isEta = module === 'energyTradingAmounts' && action.value === 'generate_energy_files';

    // const statuses = [
    //   ...(isRta ? [
    //     SettlementStatus.COMPLETED_RESERVE_SETTLEMENT_CALCULATION,
    //   ] : []),
    //   ...(isEta ? [
    //     SettlementStatus.COMPLETED_SETTLEMENT_CALCULATION,
    //   ] : []),
    // ];

    const permissions = [
      ...(isRta ? [PHASE_TWO_AUTHORITIES.TA_GENERATE_RESERVE_FILE] : []),
      ...(isEta ? [PHASE_TWO_AUTHORITIES.TA_GENERATE_ENERGY_FILE] : []),
    ];

    // statuses.includes(status as SettlementStatus) -> status condition temporarily removed
    action.permissions = isSettlementModule ? permissions : [];
    action.show = this.checkPermissions(action.permissions);

    return action;

  }

  checkPermissions(permissions: string[]): boolean {
    const auths = this.ps.currentUser()?.principal?.privileges || [];
    return auths?.some(auth => permissions.includes(auth));
  }
}
