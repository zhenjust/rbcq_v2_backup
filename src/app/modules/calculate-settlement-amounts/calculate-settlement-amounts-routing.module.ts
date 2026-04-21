import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NEW_ROUTES } from '@shared/constants';
import { BaseComponent } from './base/base.component';
import { settlementPageTitles, settlementSearchNames } from '@shared/enums';

const routes: Routes = [
  {
    path: NEW_ROUTES.ENERGY_MARKET_FEE_CALCULATION,
    component: BaseComponent,
    data: {
      pageTitle: settlementPageTitles.ENERGY_MARKET_FEE_CALCULATION,
      isLineRentalStatus: false,
      searchName: settlementSearchNames.ENERGY_MARKET_FEE
    }
  },
  {
    path: NEW_ROUTES.RESERVE_MARKET_FEE_CALCULATION,
    component: BaseComponent,
    data: {
      pageTitle: settlementPageTitles.RESERVE_MARKET_FEE_CALCULATION,
      isLineRentalStatus: false,
      searchName: settlementSearchNames.RESERVE_MARKET_FEE
    }
  },
  {
    path: NEW_ROUTES.RESERVE_TRADING_AMOUNTS_CALCULATION,
    component: BaseComponent,
    data: {
      pageTitle: settlementPageTitles.RESERVE_TRADING_AMOUNTS_CALCULATION,
      isLineRentalStatus: false,
      searchName: settlementSearchNames.RESERVE_TRADING_AMOUNTS
    }
  },
  {
    path: NEW_ROUTES.TRADING_AMOUNTS_CALCULATION,
    component: BaseComponent,
    data: {
      pageTitle: settlementPageTitles.TRADING_AMOUNTS_CALCULATION,
      isLineRentalStatus: true,
      searchName: settlementSearchNames.ENERGY_TRADING_AMOUNTS
    }
  },
  // {
  //   path: NEW_ROUTES.ADDITIONAL_COMPENSATION_LIST,
  //   component: AdditionalCompensationComponent,
  //   data: {
  //     pageTitle: settlementPageTitles.TRADING_AMOUNTS_CALCULATION,
  //     isLineRentalStatus: true,
  //     searchName: settlementSearchNames.ENERGY_TRADING_AMOUNTS
  //   }
  // }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CalculateSettlementAmountsRoutingModule { }
