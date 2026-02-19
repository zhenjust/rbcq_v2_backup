import { inject, Pipe, PipeTransform } from '@angular/core';
import { AuthorizationService } from '@core/services/authorization.service';
import { EtaSettlementStatus, PHASE_TWO_AUTHORITIES, RtaSettlementStatus, SettlementStatus } from '@shared/constants';
import { MeterProcessTypes, settlementSearchNames } from '@shared/enums';
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
      .filter(action => action.type === module || !action.type)
      .map(action => {
        const { value } = action;
        const { status, processType } = data;
        const isSettlementModules = this.settlementModules.includes(module);

        if (value === 'publish') {
          action.show = !data.published;
        }

        if (value === 'generateInputWorkspace' || value === 'generateReserveInputWorkspace') {
          action = this.handleGenerateStatus(action, module, status as keyof typeof SettlementStatus);
        }

        if (value === 'cancelRun') {
          action.show = status.startsWith('In-Progress');
        }

        if (value === 'calculateEnergyTradingAmount' || value === 'calculateReserveTradingAmount') {
          action = this.handleCalculateTA(action, isSettlementModules, status as keyof typeof SettlementStatus, module);
        }

        if (value === 'generateMonthlySummary') {
          action.show = status === SettlementStatus.COMPLETED_SETTLEMENT_COMPLETE;
        }

        if (value === 'generate_energy_files' || value === 'generate_reserve_files') {
          action = this.handleGenerateFiles(action, isSettlementModules, status as keyof typeof SettlementStatus, module);
        }

        if (value === 'energyTradingAmounts-generateMonthlySummary' || value === 'reserveTradingAmounts-generateMonthlySummary') {
          action = this.handleGenerateMonthlySummary(action, isSettlementModules, status as keyof typeof SettlementStatus);
          action.show = action.show && processType !== MeterProcessTypes.DAILY;
        }

        if (value === 'reserveTradingAmounts-calculateGMRVAT') {
          action = this.handleCalcGmrVat(action, isSettlementModules, status as keyof typeof SettlementStatus);
          action.show = action.show && processType !== MeterProcessTypes.DAILY;
        }

        if (value === 'energyTradingAmounts-finalize' || value === 'reserveTradingAmounts-finalize') {
          action = this.handleFinalizeSettlement(action, isSettlementModules, status as keyof typeof SettlementStatus);

        }

        return action;
      })
      .filter(action => action.show);
  }

  handleCalculateTA(action: JobSelect, isSettlementModule = true, status: keyof typeof SettlementStatus, module: string): JobSelect {
    const isRta = module === 'reserveTradingAmounts' && action.value === 'calculateReserveTradingAmount';
    const isEta = module === 'energyTradingAmounts' && action.value === 'calculateEnergyTradingAmount';

    const statuses = [
      ...(isRta ? Object.values(EtaSettlementStatus) : []),
      ...(isEta ? Object.values(RtaSettlementStatus) : []),
      SettlementStatus.FAILED_GENERATE_INPUT_RESERVE_WORKSPACE,
      SettlementStatus.FAILED_GENERATE_INPUT_WORKSPACE,
      SettlementStatus.COMPLETED_SETTLEMENT_READY,
      SettlementStatus.COMPLETED_TAGGING,
    ];

    action.permissions = isSettlementModule ? [PHASE_TWO_AUTHORITIES.TA_CALCULATE_TA] : [];
    action.show = !statuses.includes(status as keyof typeof SettlementStatus) && (isRta || isEta) && this.checkPermissions(action.permissions);

    return action;
  }

  handleGenerateMonthlySummary(action: JobSelect, isSettlementModule = true, status: keyof typeof SettlementStatus): JobSelect {
    const isRtaPipeline = action.type === settlementSearchNames.RESERVE_TRADING_AMOUNTS && action.value === 'reserveTradingAmounts-generateMonthlySummary';
    const isEtaPipeline = action.type === settlementSearchNames.ENERGY_TRADING_AMOUNTS && action.value === 'energyTradingAmounts-generateMonthlySummary';

    const statuses = [
      SettlementStatus.IN_PROGRESS_GENERATE_MONTHLY_SUMMARY,
      SettlementStatus.FAILED_SETTLEMENT_CALCULATION,
      SettlementStatus.FAILED_RESERVE_SETTLEMENT_CALCULATION,
      SettlementStatus.FAILED_GENERATE_INPUT_RESERVE_WORKSPACE,
      SettlementStatus.FAILED_GENERATE_INPUT_WORKSPACE,
      SettlementStatus.COMPLETED_GENERATE_INPUT_WORKSPACE,
      SettlementStatus.COMPLETED_GENERATE_RESERVE_INPUT_WORKSPACE,
      SettlementStatus.COMPLETED_SETTLEMENT_READY,
      SettlementStatus.COMPLETED_TAGGING,
    ];

    action.permissions = isSettlementModule ? [PHASE_TWO_AUTHORITIES.TA_GEN_MONTHLY_SUMMARY] : [];
    action.show = !statuses.includes(status as keyof typeof SettlementStatus) && (isRtaPipeline || isEtaPipeline);

    return action;

  }

  handleGenerateStatus(action: JobSelect, module: string, status: keyof typeof SettlementStatus): JobSelect {
    const isRta = module === 'reserveTradingAmounts' && action.value === 'generateReserveInputWorkspace';
    const isEta = module === 'energyTradingAmounts' && action.value === 'generateInputWorkspace';

    const statuses =  [
      SettlementStatus.IN_PROGRESS_GENERATE_INPUT_RESERVE_WORKSPACE,
      SettlementStatus.IN_PROGRESS_GENERATE_INPUT_ENERGY_WORKSPACE,
      SettlementStatus.COMPLETED_TAGGING
    ];

    action.permissions = [PHASE_TWO_AUTHORITIES.TA_GENERATE_IW];
    action.show = !statuses.includes(status) && (isRta || isEta) && this.checkPermissions(action.permissions);

    return action;
  }

  handleGenerateFiles(action: JobSelect, isSettlementModule = true, status: keyof typeof SettlementStatus, module: string): JobSelect {
    const isRta = module === 'reserveTradingAmounts' && action.value === 'generate_reserve_files';
    const isEta = module === 'energyTradingAmounts' && action.value === 'generate_energy_files';

    const permissions = [
      ...(isRta ? [PHASE_TWO_AUTHORITIES.TA_GENERATE_RESERVE_FILE] : []),
      ...(isEta ? [PHASE_TWO_AUTHORITIES.TA_GENERATE_ENERGY_FILE] : []),
    ];

    action.permissions = isSettlementModule ? permissions : [];
    action.show = this.checkPermissions(action.permissions);

    return action;

  }

  handleCalcGmrVat(action: JobSelect, isSettlementModule = true, status: keyof typeof SettlementStatus): JobSelect {
    const isRtaPipeline = action.type === settlementSearchNames.RESERVE_TRADING_AMOUNTS && action.value === 'reserveTradingAmounts-calculateGMRVAT';

    const statuses = [
      SettlementStatus.IN_PROGRESS_CALCULATE_GMRVAT,

      SettlementStatus.IN_PROGRESS_GENERATE_MONTHLY_SUMMARY,
      SettlementStatus.CANCELLED_GENERATE_MONTHLY_SUMMARY,
      SettlementStatus.FAILED_GENERATE_MONTHLY_SUMMARY,

      SettlementStatus.FAILED_SETTLEMENT_CALCULATION,
      SettlementStatus.FAILED_RESERVE_SETTLEMENT_CALCULATION,
      SettlementStatus.FAILED_GENERATE_INPUT_RESERVE_WORKSPACE,
      SettlementStatus.FAILED_GENERATE_INPUT_WORKSPACE,

      // TODO: Add ETA Equivalents

      SettlementStatus.COMPLETED_GENERATE_RESERVE_FILES,
      SettlementStatus.IN_PROGRESS_GENERATE_RESERVE_FILES,
      SettlementStatus.CANCELLED_GENERATE_RESERVE_FILES,
      SettlementStatus.FAILED_GENERATE_RESERVE_FILES,

      SettlementStatus.COMPLETED_RESERVE_SETTLEMENT_CALCULATION,
      SettlementStatus.COMPLETED_SETTLEMENT_CALCULATION,
      SettlementStatus.COMPLETED_GENERATE_INPUT_WORKSPACE,
      SettlementStatus.COMPLETED_GENERATE_RESERVE_INPUT_WORKSPACE,

      SettlementStatus.COMPLETED_SETTLEMENT_READY,
      SettlementStatus.COMPLETED_TAGGING,
    ];

    action.permissions = isSettlementModule ? [PHASE_TWO_AUTHORITIES.TA_CALCULATE_GMRVAT] : [];
    action.show = !statuses.includes(status as keyof typeof SettlementStatus) && isRtaPipeline;

    return action;

  }

  handleFinalizeSettlement(action: JobSelect, isSettlementModule = true, status: keyof typeof SettlementStatus): JobSelect {
    const isRtaPipeline = action.type === settlementSearchNames.RESERVE_TRADING_AMOUNTS && action.value === 'reserveTradingAmounts-generateMonthlySummary';
    const isEtaPipeline = action.type === settlementSearchNames.ENERGY_TRADING_AMOUNTS && action.value === 'energyTradingAmounts-generateMonthlySummary';

    const statuses = [
      SettlementStatus.IN_PROGRESS_CALCULATE_GMRVAT,

      SettlementStatus.IN_PROGRESS_GENERATE_MONTHLY_SUMMARY,
      SettlementStatus.CANCELLED_GENERATE_MONTHLY_SUMMARY,
      SettlementStatus.FAILED_GENERATE_MONTHLY_SUMMARY,
      SettlementStatus.COMPLETED_GENERATE_MONTHLY_SUMMARY,

      SettlementStatus.FAILED_SETTLEMENT_CALCULATION,
      SettlementStatus.FAILED_RESERVE_SETTLEMENT_CALCULATION,
      SettlementStatus.FAILED_GENERATE_INPUT_RESERVE_WORKSPACE,
      SettlementStatus.FAILED_GENERATE_INPUT_WORKSPACE,

      // TODO: Add ETA Equivalents

      SettlementStatus.COMPLETED_GENERATE_RESERVE_FILES,
      SettlementStatus.IN_PROGRESS_GENERATE_RESERVE_FILES,
      SettlementStatus.CANCELLED_GENERATE_RESERVE_FILES,
      SettlementStatus.FAILED_GENERATE_RESERVE_FILES,

      SettlementStatus.COMPLETED_RESERVE_SETTLEMENT_CALCULATION,
      SettlementStatus.COMPLETED_SETTLEMENT_CALCULATION,
      SettlementStatus.COMPLETED_GENERATE_INPUT_WORKSPACE,
      SettlementStatus.COMPLETED_GENERATE_RESERVE_INPUT_WORKSPACE,

      SettlementStatus.COMPLETED_SETTLEMENT_READY,
      SettlementStatus.COMPLETED_TAGGING,
    ];

    action.permissions = isSettlementModule ? [PHASE_TWO_AUTHORITIES.TA_FINALIZE_LR] : [];
    action.show = !statuses.includes(status as keyof typeof SettlementStatus) && (isRtaPipeline || isEtaPipeline);

    return action;
  }

  /** FLOW:
   *  Settlement Ready
   *  Generate Input Workspace
   *
   */

  checkPermissions(permissions: string[]): boolean {
    const auths = this.ps.currentUser()?.principal?.privileges || [];
    return auths?.some(auth => permissions.includes(auth));
  }
}
