import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthorizeGuard } from '@core/guards/authorize.guard';
import { NEW_ROUTES } from '@shared/constants';
import { BaseComponent } from '@shared/modules/layout/base/base.component';

//TODO make other paths verbose
const routes: Routes = [
  {
    path: '',
    component: BaseComponent,
    canActivate: [AuthorizeGuard],
    canActivateChild: [AuthorizeGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./modules/calculate-settlement-amounts/calculate-settlement-amounts.module').then(m => m.CalculateSettlementAmountsModule)
      },
      {
        path: NEW_ROUTES.METER_PROCESS,
        loadChildren: () => import('./modules/meter-process/meter-process.module').then(m => m.MeterProcessModule)
      },
      {
        path: '',
        loadChildren: () => import('./modules/additional-compensation-list/additional-compensation-list.module').then(m => m.AdditionalCompensationListModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    useHash: false //disable hashing
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
