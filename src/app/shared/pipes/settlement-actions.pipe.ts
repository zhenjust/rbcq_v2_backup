import { inject, Pipe, PipeTransform } from '@angular/core';
import { AuthorizationService } from '@core/services/authorization.service';
import { PHASE_TWO_AUTHORITIES, SettlementStatus } from '@shared/constants';
import { MeterProcessTypes, settlementSearchNames } from '@shared/enums';
import {JobSelect, pipeline, settlementPipeline} from '@shared/interfaces';

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
        const { status, processType, pipelines } = data;
        const isSettlementModules = this.settlementModules.includes(module);

        if (value === 'cancelRun') {
          action.show = status.startsWith('In-Progress');
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

        if (value === 'calculateEnergyTradingAmount' || value === 'calculateReserveTradingAmount') {
          action = this.handleCalculateTA(action, pipelines, isSettlementModules);
        }

        if (value === 'calculateMSummary') {
          action.show = status === SettlementStatus.COMPLETED_SETTLEMENT_COMPLETE;
        }

        if (value === 'generate_energy_files' || value === 'generate_reserve_files') {
          action = this.handleGenerateFiles(action, isSettlementModules, pipelines, module);
        }

        if (value === 'energyTradingAmounts-calculateMSummary' || value === 'reserveTradingAmounts-calculateMSummary') {
          action = this.handleGenerateMonthlySummary(action, pipelines, isSettlementModules);
          action.show = action.show && processType !== MeterProcessTypes.DAILY;
        }

        if (value === 'reserveTradingAmounts-calculateGmrVat' || value === 'energyTradingAmounts-calculateGmrVat') {
          action = this.handleCalcGmrVat(action, pipelines, isSettlementModules);
          action.show = action.show && processType !== MeterProcessTypes.DAILY;
        }

        if (value === 'energyTradingAmounts-finalize' || value === 'reserveTradingAmounts-finalize') {
          action = this.handleFinalizeSettlement(action, isSettlementModules, status as keyof typeof SettlementStatus);

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

  GEN_IWS_STATUSES = [
    SettlementStatus.COMPLETED_GENERATE_INPUT_WORKSPACE,
    SettlementStatus.COMPLETED_GENERATE_RESERVE_INPUT_WORKSPACE,
    SettlementStatus.FAILED_GENERATE_INPUT_RESERVE_WORKSPACE,
    SettlementStatus.FAILED_GENERATE_INPUT_WORKSPACE,
    SettlementStatus.CANCELLED_GENERATE_INPUT_RESERVE_WORKSPACE,
    SettlementStatus.CANCELLED_GENERATE_INPUT_WORKSPACE,

    SettlementStatus.COMPLETED_SETTLEMENT_READY,
    SettlementStatus.COMPLETED_TAGGING,
  ];

  CALC_TA_STATUSES = [
    SettlementStatus.COMPLETED_SETTLEMENT_CALCULATION,
    SettlementStatus.COMPLETED_RESERVE_SETTLEMENT_CALCULATION,
    SettlementStatus.FAILED_SETTLEMENT_CALCULATION,
    SettlementStatus.FAILED_RESERVE_SETTLEMENT_CALCULATION,
    SettlementStatus.CANCELLED_RESERVE_SETTLEMENT_CALCULATION,
    SettlementStatus.CANCELLED_SETTLEMENT_CALCULATION,
  ]

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

  handleCalculateTA(action: JobSelect, pipelines: any[], isSettlementModule = true): JobSelect {
    const isRtaPipeline = action.type === settlementSearchNames.RESERVE_TRADING_AMOUNTS && action.value === 'calculateReserveTradingAmount';
    const isEtaPipeline = action.type === settlementSearchNames.ENERGY_TRADING_AMOUNTS && action.value === 'calculateEnergyTradingAmount';

    action.permissions = isSettlementModule ? [PHASE_TWO_AUTHORITIES.TA_CALCULATE_TA] : [];
    action.show = this.checkPermissions(action.permissions) && (isRtaPipeline || isEtaPipeline) && pipelines.some(
      p => (p.name === 'energyTradingAmounts-generateInputWorkspace' || p.name === 'reserveTradingAmounts-generateInputWorkspace') && p.status === 'Completed'
    );

    return action;
  }

  handleGenerateMonthlySummary(action: JobSelect, pipelines: any[], isSettlementModule = true): JobSelect {
    const isRtaPipeline = action.type === settlementSearchNames.RESERVE_TRADING_AMOUNTS && action.value === 'reserveTradingAmounts-calculateMSummary';
    const isEtaPipeline = action.type === settlementSearchNames.ENERGY_TRADING_AMOUNTS && action.value === 'energyTradingAmounts-calculateMSummary';

    action.permissions = isSettlementModule ? [PHASE_TWO_AUTHORITIES.TA_GEN_MONTHLY_SUMMARY] : [];
    action.show = this.checkPermissions(action.permissions) && (isRtaPipeline || isEtaPipeline) && pipelines.some(
      p => (p.name === 'energyTradingAmounts-calculateTradingAmount' || p.name === 'reserveTradingAmounts-calculateTradingAmount') && p.status === 'Completed'
    );

    return action;

  }

  handleGenerateFiles(action: JobSelect, isSettlementModule = true, pipelines: pipeline[], module: string): JobSelect {
    const isRta = module === 'reserveTradingAmounts' && action.value === 'generate_reserve_files';
    const isEta = module === 'energyTradingAmounts' && action.value === 'generate_energy_files';

    const permissions = [
      ...(isRta ? [PHASE_TWO_AUTHORITIES.TA_GENERATE_RESERVE_FILE] : []),
      ...(isEta ? [PHASE_TWO_AUTHORITIES.TA_GENERATE_ENERGY_FILE] : []),
    ];

    action.permissions = isSettlementModule ? permissions : [];
    action.show = this.checkPermissions(action.permissions) && pipelines.some(
      p => (p.name === 'energyTradingAmounts-finalize' || p.name === 'reserveTradingAmounts-finalize') && p.status === 'Completed'
    );

    return action;
  }

  handleCalcGmrVat(action: JobSelect, pipelines: any[], isSettlementModule = true): JobSelect {
    const isRtaPipeline = action.type === settlementSearchNames.RESERVE_TRADING_AMOUNTS && action.value === 'reserveTradingAmounts-calculateGmrVat';
    const isEtaPipeline = action.type === settlementSearchNames.ENERGY_TRADING_AMOUNTS && action.value === 'energyTradingAmounts-calculateGmrVat';

    action.permissions = isSettlementModule ? [PHASE_TWO_AUTHORITIES.TA_CALCULATE_GMRVAT] : [];

    action.show = this.checkPermissions(action.permissions) && (isRtaPipeline || isEtaPipeline) && pipelines.some(
      p => (p.name === 'reserveTradingAmounts-calculateMSummary' || p.name === 'energyTradingAmounts-calculateMSummary') && p.status === 'Completed'
    );

    return action;

  }

  handleFinalizeSettlement(action: JobSelect, isSettlementModule = true, status: keyof typeof SettlementStatus): JobSelect {
    const isRtaPipeline = action.type === settlementSearchNames.RESERVE_TRADING_AMOUNTS && action.value === 'reserveTradingAmounts-finalize';
    const isEtaPipeline = action.type === settlementSearchNames.ENERGY_TRADING_AMOUNTS && action.value === 'energyTradingAmounts-finalize';

    const statuses = [
      SettlementStatus.CANCELLED_GENERATE_MONTHLY_SUMMARY,
      SettlementStatus.FAILED_GENERATE_MONTHLY_SUMMARY,

      SettlementStatus.COMPLETED_GENERATE_RESERVE_FILES,
      SettlementStatus.CANCELLED_GENERATE_RESERVE_FILES,
      SettlementStatus.FAILED_GENERATE_RESERVE_FILES,

      ...this.GEN_IWS_STATUSES,
      ...this.CALC_TA_STATUSES,
    ];

    action.permissions = isSettlementModule ? [PHASE_TWO_AUTHORITIES.TA_FINALIZE_LR] : [];
    action.show = !statuses.includes(status as keyof typeof SettlementStatus) && (isRtaPipeline || isEtaPipeline) && this.checkPermissions(action.permissions);

    return action;
  }

  checkPermissions(permissions: string[]): boolean {
    const auths = this.ps.currentUser()?.principal?.privileges || [];
    return auths?.some(auth => permissions.includes(auth));
  }
}
