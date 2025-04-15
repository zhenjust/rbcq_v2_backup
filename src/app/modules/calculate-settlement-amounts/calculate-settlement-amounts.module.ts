import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CalculateSettlementAmountsRoutingModule } from './calculate-settlement-amounts-routing.module';
import { TradingAmountsCalculationModule } from './trading-amounts-calculation/trading-amounts-calculation.module';
import { ReserveTradingAmountsCalculationModule } from './reserve-trading-amounts-calculation/reserve-trading-amounts-calculation.module';
import { EnergyMarketFeeCalculationModule } from './energy-market-fee-calculation/energy-market-fee-calculation.module';
import { ReserveMarketFeeCalculationModule } from './reserve-market-fee-calculation/reserve-market-fee-calculation.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    CalculateSettlementAmountsRoutingModule,
    TradingAmountsCalculationModule,
    ReserveTradingAmountsCalculationModule,
    EnergyMarketFeeCalculationModule,
    ReserveMarketFeeCalculationModule
  ]
})
export class CalculateSettlementAmountsModule { }
