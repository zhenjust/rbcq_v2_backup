import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NEW_ROUTES } from '@shared/constants';

const routes: Routes = [
  {
    path: NEW_ROUTES.TRADING_AMOUNTS_CALCULATION,
    loadChildren: () => import('./trading-amounts-calculation/trading-amounts-calculation.module').then(m => m.TradingAmountsCalculationModule)
  },
  {
    path: NEW_ROUTES.RESERVE_TRADING_AMOUNTS_CALCULATION,
    loadChildren: () => import('./reserve-trading-amounts-calculation/reserve-trading-amounts-calculation.module').then(m => m.ReserveTradingAmountsCalculationModule)
  },
  {
    path: NEW_ROUTES.ENERGY_MARKET_FEE_CALCULATION,
    loadChildren: () => import('./energy-market-fee-calculation/energy-market-fee-calculation.module').then(m => m.EnergyMarketFeeCalculationModule)
  },
  {
    path: NEW_ROUTES.RESERVE_MARKET_FEE_CALCULATION,
    loadChildren: () => import('./reserve-market-fee-calculation/reserve-market-fee-calculation.module').then(m => m.ReserveMarketFeeCalculationModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CalculateSettlementAmountsRoutingModule { }
