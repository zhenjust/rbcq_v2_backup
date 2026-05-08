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
    return actions
      .filter(action => action.type === module || !action.type)
      .map(action => {
        const { value } = action;
        const { status, pipelines } = data;

        if (value === 'cancelRun') {
          action.show = status.startsWith('In-Progress');
          return action;
        }

        const hasFinalized = pipelines.some(
          p => (p.name === 'energyTradingAmounts-finalize' || p.name === 'reserveTradingAmounts-finalize') && p.status === 'Completed'
        );

        if (this.DISABLE_ON_FINALIZED.includes(value) && hasFinalized) {
          action.show = false;
          return action;
        }

        if (status.startsWith('In-Progress')) {
          action.show = false;
          return action;
        }

        if (value === 'publish') {
          action.show = !data.published;
        }

        if (value === 'generateInputWorkspace' || value === 'generateReserveInputWorkspace') {
          action = this.handleGenerateStatus(action, module, status as keyof typeof SettlementStatus);
        }

        return action;
      })
      .filter(action => action.show);
  }

  /** FLOW:
   *  Settlement Ready
   *  Generate Input Workspace
   *  Calc Trading Amount
   *  Generate Monthly Summary
   *  Generate Files
   */

  DISABLE_ON_FINALIZED = [
    'generateInputWorkspace',
    'generateReserveInputWorkspace',
    'calculateEnergyTradingAmount',
    'calculateReserveTradingAmount',
    'energyTradingAmounts-calculateMSummary',
    'reserveTradingAmounts-calculateMSummary',
    'reserveTradingAmounts-calculateGmrVat',
    'energyTradingAmounts-calculateGmrVat',
    'energyTradingAmounts-finalize',
    'reserveTradingAmounts-finalize'
  ];

  handleGenerateStatus(action: JobSelect, module: string, status: keyof typeof SettlementStatus): JobSelect {
    const isRta = module === 'reserveTradingAmounts' && action.value === 'generateReserveInputWorkspace';
    const isEta = module === 'energyTradingAmounts' && action.value === 'generateInputWorkspace';

    const statuses =  [
      SettlementStatus.IN_PROGRESS_GENERATE_INPUT_RESERVE_WORKSPACE,
      SettlementStatus.IN_PROGRESS_GENERATE_INPUT_ENERGY_WORKSPACE,
      SettlementStatus.COMPLETED_TAGGING,
      SettlementStatus.COMPLETED_FINALIZE
    ];

    action.permissions = [PHASE_TWO_AUTHORITIES.TA_GENERATE_IW];
    action.show = !statuses.includes(status) && (isRta || isEta) && this.checkPermissions(action.permissions);

    return action;
  }

  // handleCalculateTA(action: JobSelect, pipelines: any[], isSettlementModule = true): JobSelect {
  //   const isRtaPipeline = action.type === settlementSearchNames.RESERVE_TRADING_AMOUNTS && action.value === 'calculateReserveTradingAmount';
  //   const isEtaPipeline = action.type === settlementSearchNames.ENERGY_TRADING_AMOUNTS && action.value === 'calculateEnergyTradingAmount';

  //   action.permissions = isSettlementModule ? [PHASE_TWO_AUTHORITIES.TA_CALCULATE_TA] : [];
  //   action.show = this.checkPermissions(action.permissions) && (isRtaPipeline || isEtaPipeline) && pipelines.some(
  //     p => (p.name === 'energyTradingAmounts-generateInputWorkspace' || p.name === 'reserveTradingAmounts-generateInputWorkspace') && p.status === 'Completed'
  //   );

  //   return action;
  // }

  // handleGenerateMonthlySummary(action: JobSelect, pipelines: any[], isSettlementModule = true): JobSelect {
  //   const isRtaPipeline = action.type === settlementSearchNames.RESERVE_TRADING_AMOUNTS && action.value === 'reserveTradingAmounts-calculateMSummary';
  //   const isEtaPipeline = action.type === settlementSearchNames.ENERGY_TRADING_AMOUNTS && action.value === 'energyTradingAmounts-calculateMSummary';

  //   action.permissions = isSettlementModule ? [PHASE_TWO_AUTHORITIES.TA_GEN_MONTHLY_SUMMARY] : [];
  //   action.show = this.checkPermissions(action.permissions) && (isRtaPipeline || isEtaPipeline) && pipelines.some(
  //     p => (p.name === 'energyTradingAmounts-calculateTradingAmount' || p.name === 'reserveTradingAmounts-calculateTradingAmount') && p.status === 'Completed'
  //   );

  //   return action;

  // }

  // handleGenerateFiles(action: JobSelect, isSettlementModule = true, pipelines: pipeline[], module: string): JobSelect {
  //   const isRta = module === 'reserveTradingAmounts' && action.value === 'generate_reserve_files';
  //   const isEta = module === 'energyTradingAmounts' && action.value === 'generate_energy_files';

  //   const permissions = [
  //     ...(isRta ? [PHASE_TWO_AUTHORITIES.TA_GENERATE_RESERVE_FILE] : []),
  //     ...(isEta ? [PHASE_TWO_AUTHORITIES.TA_GENERATE_ENERGY_FILE] : []),
  //   ];

  //   action.permissions = isSettlementModule ? permissions : [];
  //   action.show = this.checkPermissions(action.permissions) && pipelines.some(
  //     p => (p.name === 'energyTradingAmounts-finalize' || p.name === 'reserveTradingAmounts-finalize') && p.status === 'Completed'
  //   );

  //   return action;
  // }

  // handleCalcGmrVat(action: JobSelect, pipelines: any[], isSettlementModule = true): JobSelect {
  //   const isRtaPipeline = action.type === settlementSearchNames.RESERVE_TRADING_AMOUNTS && action.value === 'reserveTradingAmounts-calculateGmrVat';
  //   const isEtaPipeline = action.type === settlementSearchNames.ENERGY_TRADING_AMOUNTS && action.value === 'energyTradingAmounts-calculateGmrVat';

  //   action.permissions = isSettlementModule ? [PHASE_TWO_AUTHORITIES.TA_CALCULATE_GMRVAT] : [];

  //   action.show = this.checkPermissions(action.permissions) && (isRtaPipeline || isEtaPipeline) && pipelines.some(
  //     p => (p.name === 'reserveTradingAmounts-calculateMSummary' || p.name === 'energyTradingAmounts-calculateMSummary') && p.status === 'Completed'
  //   );

  //   return action;

  // }

  // handleFinalizeSettlement(action: JobSelect, isSettlementModule = true, status: keyof typeof SettlementStatus): JobSelect {
  //   const isRtaPipeline = action.type === settlementSearchNames.RESERVE_TRADING_AMOUNTS && action.value === 'reserveTradingAmounts-finalize';
  //   const isEtaPipeline = action.type === settlementSearchNames.ENERGY_TRADING_AMOUNTS && action.value === 'energyTradingAmounts-finalize';

  //   const statuses = [
  //     SettlementStatus.CANCELLED_GENERATE_MONTHLY_SUMMARY,
  //     SettlementStatus.FAILED_GENERATE_MONTHLY_SUMMARY,

  //     SettlementStatus.COMPLETED_GENERATE_RESERVE_FILES,
  //     SettlementStatus.CANCELLED_GENERATE_RESERVE_FILES,
  //     SettlementStatus.FAILED_GENERATE_RESERVE_FILES,

  //     ...this.GEN_IWS_STATUSES,
  //     ...this.CALC_TA_STATUSES,
  //   ];

  //   action.permissions = isSettlementModule ? [PHASE_TWO_AUTHORITIES.TA_FINALIZE_LR] : [];
  //   action.show = !statuses.includes(status as keyof typeof SettlementStatus) && (isRtaPipeline || isEtaPipeline) && this.checkPermissions(action.permissions);

  //   return action;
  // }

  // handleCalcTransAlloc(action: JobSelect, isSettlementModule = true, pipelines: any[]): JobSelect {
  //   const isRtaPipeline = action.type === settlementSearchNames.RESERVE_TRADING_AMOUNTS && action.value === 'reserveTradingAmounts-calculateTransAlloc';
  //   const isEtaPipeline = action.type === settlementSearchNames.ENERGY_TRADING_AMOUNTS && action.value === 'energyTradingAmounts-calculateTransAlloc';

  //   action.permissions = isSettlementModule ? [PHASE_TWO_AUTHORITIES.TA_CALCULATE_GMRVAT] : [];

  //   action.show = this.checkPermissions(action.permissions) && (isRtaPipeline || isEtaPipeline) && pipelines.some(
  //     p => (p.name === 'energyTradingAmounts-finalize' || p.name === 'reserveTradingAmounts-finalize') && p.status === 'Completed'
  //   );

  //   return action;
  // }


  checkPermissions(permissions: string[]): boolean {
    const auths = this.ps.currentUser()?.principal?.privileges || [];
    return auths?.some(auth => permissions.includes(auth));
  }
}
