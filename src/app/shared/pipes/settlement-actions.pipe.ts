import {inject, Pipe, PipeTransform} from '@angular/core';
import {AuthorizationService} from '@core/services/authorization.service';
import {PHASE_TWO_AUTHORITIES, SettlementStatus} from '@shared/constants';
import {MeterProcessTypes, settlementSearchNames} from '@shared/enums';
import {JobSelect, pipeline, settlementPipeline} from '@shared/interfaces';

@Pipe({
  name: 'stlActions',
  standalone: false
})
export class SettlementActionsPipe implements PipeTransform {

  private readonly ps = inject(AuthorizationService);

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

        const hasFinalized = pipelines.some(
          p => (p.name === 'energyTradingAmounts-finalize' || p.name === 'reserveTradingAmounts-finalize') && this.completedStatus.includes(p.status)
        );
        if (this.DISABLE_ON_FINALIZED.includes(value) && hasFinalized) {
          action.show = false;
          return action;
        }

        /**
         * Show actions when status is inprogress (for Gen IWS and Calc TA)
         */

        if (status.startsWith('In-Progress') && this.GEN_IWS_CALC_TA_STATUSES.every(stat => !status.includes(stat))) {
          action.show = false;
          return action;
        }

        if (status.startsWith('In-Progress') && this.GEN_IWS_CALC_TA_STATUSES.some(stat => status.includes(stat)) && this.GEN_IWS_CALC_TA_NAMES.includes(value) ) {
          action.show = true;
          return action;
        }

        if (status.startsWith('In-Progress')) {
          action.show = false;
          return action;
        }

        if (value === 'sendNotification') {
          action.show = data.published;
          return action;
        }

        if (value === 'energyTradingAmounts-publish' || value === 'reserveTradingAmounts-publish') {
          const canPublished = pipelines.some(
            p => (p.name === 'energyTradingAmounts-generateTransactionReport' || p.name === 'reserveTradingAmounts-generateTransactionReport') && this.completedStatus.includes(p.status)
          );
          action.show = canPublished && !data.published;
        }

        if (value === 'energyTradingAmounts-generateInputWorkspace' || value === 'reserveTradingAmounts-generateInputWorkspace') {
          action = this.handleGenerateStatus(action, status as keyof typeof SettlementStatus);
        }

        if (value === 'energyTradingAmounts-calculateTradingAmount' || value === 'reserveTradingAmounts-calculateTradingAmount') {
          action = this.handleCalculateTA(action, pipelines, isSettlementModules);
        }

        if (value === 'energyTradingAmounts-calculateMSummary' || value === 'reserveTradingAmounts-calculateMSummary') {
          action = this.handleGenerateMonthlySummary(action, pipelines, isSettlementModules);
          action.show = action.show && processType !== MeterProcessTypes.DAILY;
        }

        if (value === 'energyTradingAmounts-calculateGmrVat' || value === 'reserveTradingAmounts-calculateGmrVat') {
          action = this.handleCalcGmrVat(action, pipelines, isSettlementModules);
          action.show = action.show && processType !== MeterProcessTypes.DAILY;
        }

        if (value === 'energyTradingAmounts-finalize' || value === 'reserveTradingAmounts-finalize') {
          action = this.handleFinalizeSettlement(action, pipelines, isSettlementModules);
        }

        if (value === 'energyTradingAmounts-calculateTransAlloc' || value === 'reserveTradingAmounts-calculateTransAlloc') {
          action = this.handleCalcTransAlloc(action, isSettlementModules, pipelines);
          action.show = action.show && !data.published;
        }

        if (value === 'energyTradingAmounts-generateTransactionReport' || value === 'reserveTradingAmounts-generateTransactionReport') {
          action = this.handleGenerateTransactionReport(action, pipelines, isSettlementModules);
          action.show = action.show && !data.published;
        }

        if (value === 'energyTradingAmounts-generateFiles' || value === 'reserveTradingAmounts-generateFiles') {
          action = this.handleGenerateFiles(action, pipelines, isSettlementModules);
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
    'energyTradingAmounts-generateInputWorkspace',
    'reserveTradingAmounts-generateInputWorkspace',
    'energyTradingAmounts-calculateTradingAmount',
    'reserveTradingAmounts-calculateTradingAmount',
    'energyTradingAmounts-calculateMSummary',
    'reserveTradingAmounts-calculateMSummary',
    'energyTradingAmounts-calculateGmrVat',
    'reserveTradingAmounts-calculateGmrVat',
    'energyTradingAmounts-finalize',
    'reserveTradingAmounts-finalize'
  ];

  GEN_IWS_CALC_TA_NAMES = [
    'energyTradingAmounts-generateInputWorkspace',
    'reserveTradingAmounts-generateInputWorkspace',
    'energyTradingAmounts-calculateTradingAmount',
    'reserveTradingAmounts-calculateTradingAmount'
  ];

  GEN_IWS_CALC_TA_STATUSES = [
    'Generate Input Workspace',
    'Generate Reserve Input Workspace',
    'Settlement Calculation',
    'Reserve Settlement Calculation'
  ];

  handleGenerateStatus(action: JobSelect, status: keyof typeof SettlementStatus): JobSelect {
    const statuses =  [
      SettlementStatus.IN_PROGRESS_GENERATE_INPUT_RESERVE_WORKSPACE,
      SettlementStatus.IN_PROGRESS_GENERATE_INPUT_ENERGY_WORKSPACE,
      SettlementStatus.COMPLETED_TAGGING,
      SettlementStatus.COMPLETED_FINALIZE
    ];

    action.permissions = [PHASE_TWO_AUTHORITIES.TA_GENERATE_IW];
    action.show = !statuses.includes(status) && this.checkPermissions(action.permissions);

    return action;
  }

  handleCalculateTA(action: JobSelect, pipelines: any[], isSettlementModule = true): JobSelect {
    action.permissions = isSettlementModule ? [PHASE_TWO_AUTHORITIES.TA_CALCULATE_TA] : [];
    action.show = this.checkPermissions(action.permissions) && pipelines.some(
      p => (p.name === 'energyTradingAmounts-generateInputWorkspace' || p.name === 'reserveTradingAmounts-generateInputWorkspace') && this.completedStatus.includes(p.status)
    );

    return action;
  }

  handleGenerateMonthlySummary(action: JobSelect, pipelines: any[], isSettlementModule = true): JobSelect {
    action.permissions = isSettlementModule ? [PHASE_TWO_AUTHORITIES.TA_GEN_MONTHLY_SUMMARY] : [];
    action.show = this.checkPermissions(action.permissions) && pipelines.some(
      p => (p.name === 'energyTradingAmounts-calculateTradingAmount' || p.name === 'reserveTradingAmounts-calculateTradingAmount') && this.completedStatus.includes(p.status)
    );

    return action;
  }

  handleCalcGmrVat(action: JobSelect, pipelines: any[], isSettlementModule = true): JobSelect {
    action.permissions = isSettlementModule ? [PHASE_TWO_AUTHORITIES.TA_CALCULATE_GMRVAT] : [];
    action.show = this.checkPermissions(action.permissions) && pipelines.some(
      p => (p.name === 'reserveTradingAmounts-calculateMSummary' || p.name === 'energyTradingAmounts-calculateMSummary') && this.completedStatus.includes(p.status)
    );

    return action;
  }

  handleFinalizeSettlement(action: JobSelect, pipelines: any[], isSettlementModule = true): JobSelect {
    action.permissions = isSettlementModule ? [PHASE_TWO_AUTHORITIES.TA_FINALIZE] : [];
    action.show = this.checkPermissions(action.permissions) && pipelines.some(
      p => (p.name === 'reserveTradingAmounts-calculateGmrVat' || p.name === 'energyTradingAmounts-calculateGmrVat') && this.completedStatus.includes(p.status)
    );

    return action;
  }

  handleCalcTransAlloc(action: JobSelect, isSettlementModule = true, pipelines: any[]): JobSelect {
    action.permissions = isSettlementModule ? [PHASE_TWO_AUTHORITIES.TA_CALCULATE_GMRVAT] : [];
    action.show = this.checkPermissions(action.permissions) && pipelines.some(
      p => (p.name === 'energyTradingAmounts-finalize' || p.name === 'reserveTradingAmounts-finalize') && this.completedStatus.includes(p.status)
    );

    return action;
  }

  handleGenerateTransactionReport(action: JobSelect, pipelines: pipeline[], isSettlementModule = true): JobSelect {
    const permissions = [
      ...(action.type === settlementSearchNames.RESERVE_TRADING_AMOUNTS ? [PHASE_TWO_AUTHORITIES.TA_GENERATE_RESERVE_FILE] : []),
      ...(action.type === settlementSearchNames.ENERGY_TRADING_AMOUNTS ? [PHASE_TWO_AUTHORITIES.TA_GENERATE_ENERGY_FILE] : []),
    ];

    action.permissions = isSettlementModule ? permissions : [];
    action.show = this.checkPermissions(action.permissions) && pipelines.some(
      p => (p.name === 'energyTradingAmounts-calculateTransAlloc' || p.name === 'reserveTradingAmounts-calculateTransAlloc') && this.completedStatus.includes(p.status)
    );

    return action;
  }

  handleGenerateFiles(action: JobSelect, pipelines: pipeline[], isSettlementModule = true): JobSelect {
    const permissions = [
      ...(action.type === settlementSearchNames.RESERVE_TRADING_AMOUNTS ? [PHASE_TWO_AUTHORITIES.TA_GENERATE_RESERVE_FILE] : []),
      ...(action.type === settlementSearchNames.ENERGY_TRADING_AMOUNTS ? [PHASE_TWO_AUTHORITIES.TA_GENERATE_ENERGY_FILE] : []),
    ];

    action.permissions = isSettlementModule ? permissions : [];
    action.show = this.checkPermissions(action.permissions) && pipelines.some(
      p => (p.name === 'energyTradingAmounts-finalize' || p.name === 'reserveTradingAmounts-finalize') && this.completedStatus.includes(p.status)
    );

    return action;
  }

  checkPermissions(permissions: string[]): boolean {
    const auths = this.ps.currentUser()?.principal?.privileges || [];
    return auths?.some(auth => permissions.includes(auth));
  }

  get completedStatus(): string[] { return ['Completed', 'Succeeded']; }
}
