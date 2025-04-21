import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthorizeGuard } from '@core/guards/authorize.guard';
import { NEW_ROUTES } from '@shared/constants';
import { BaseComponent } from '@shared/modules/layout/base/base.component';

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
