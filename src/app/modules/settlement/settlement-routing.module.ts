import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WesmPenaltyComponent } from './wesm-penalty/wesm-penalty.component';
import { ngxPermissionsGuard } from 'ngx-permissions';
import { externalRoutes, PHASE_TWO_AUTHORITIES } from '@shared/constants';
import { AdditionalCompensationComponent } from './additional-compensation/additional-compensation.component';
import { MarketFeeComponent } from './market-fee/market-fee.component';

const routes: Routes = [
    {
      path: 'wesm-penalty',
      component: WesmPenaltyComponent,
      canActivate: [ngxPermissionsGuard],
      data: {
        permissions: {
          only: [PHASE_TWO_AUTHORITIES.VIEW_STL_PROCESS],
          redirectTo: externalRoutes.HOME
        }
      },
    },
    {
      path: 'additional-compensation',
      component: AdditionalCompensationComponent,
      canActivate: [ngxPermissionsGuard],
      data: {
        permissions: {
          only: [PHASE_TWO_AUTHORITIES.VIEW_ADDTL_COMP],
          redirectTo: externalRoutes.HOME
        }
      },
    },
    {
      path: 'energy-market-fee',
      component: MarketFeeComponent,
      canActivate: [ngxPermissionsGuard],
      data: {
        isEnergy: true,
        permissions: {
          only: [
            PHASE_TWO_AUTHORITIES.VIEW_STL_PROCESS,
            PHASE_TWO_AUTHORITIES.EMF_GENERATE_IW,
            PHASE_TWO_AUTHORITIES.EMF_CALCULATE,
            PHASE_TWO_AUTHORITIES.EMF_FINALIZE,
            PHASE_TWO_AUTHORITIES.EMF_GENERATE_EMF_FILE,
            PHASE_TWO_AUTHORITIES.UPLOAD_BILLING_STATEMENT,
          ],
          redirectTo: externalRoutes.HOME
        }
      },
    },
    {
      path: 'reserve-market-fee',
      component: MarketFeeComponent,
      canActivate: [ngxPermissionsGuard],
      data: {
        isEnergy: false,
        permissions: {
          only: [PHASE_TWO_AUTHORITIES.VIEW_STL_PROCESS],
          redirectTo: externalRoutes.HOME
        }
      },
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettlementRoutingModule { }
