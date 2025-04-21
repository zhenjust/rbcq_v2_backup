import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NEW_ROUTES } from '@shared/constants';
import { BaseComponent } from './base/base.component';

const routes: Routes = [
  {
    path: NEW_ROUTES.ENERGY_MARKET_FEE_CALCULATION,
    component: BaseComponent,
    data: {
      pageTitle: 'Energy Market Fee Calculation'
    }
  },
  {
    path: NEW_ROUTES.RESERVE_MARKET_FEE_CALCULATION,
    component: BaseComponent,
    data: {
      pageTitle: 'Reserve Market Fee Calculation'
    }
  },
  {
    path: NEW_ROUTES.RESERVE_TRADING_AMOUNTS_CALCULATION,
    component: BaseComponent,
    data: {
      pageTitle: 'Reserve Trading Amounts Calculation'
    }
  },
  {
    path: NEW_ROUTES.TRADING_AMOUNTS_CALCULATION,
    component: BaseComponent,
    data: {
      pageTitle: 'Trading Amounts Calculation'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CalculateSettlementAmountsRoutingModule { }
