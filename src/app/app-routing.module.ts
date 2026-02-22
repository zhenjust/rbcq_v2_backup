import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthorizeGuard } from '@core/guards/authorize.guard';
import { MqUploaderComponent } from '@modules/metering/mq-uploader/mq-uploader.component';
import { NEW_ROUTES } from '@shared/constants';
import { BaseComponent } from '@shared/modules/layout/base/base.component';

const routes: Routes = [
  {
    path: '',
    component: BaseComponent,
    children: [
      {
        path: '',
        canActivateChild: [AuthorizeGuard],
        loadChildren: () =>
            import('./modules/calculate-settlement-amounts/calculate-settlement-amounts.module').then(m => m.CalculateSettlementAmountsModule)
      },
      {
        path: NEW_ROUTES.METER_PROCESS,
        canActivateChild: [AuthorizeGuard],
        loadChildren: () =>
          import('./modules/meter-process/meter-process.module').then(m => m.MeterProcessModule)
      },
      {
        path: '',
        canActivateChild: [AuthorizeGuard],
        loadChildren: () =>
          import('./modules/additional-compensation-list/additional-compensation-list.module').then(m => m.AdditionalCompensationListModule)
      },
      {
        path: 'metering',
        canActivateChild: [AuthorizeGuard],
        loadChildren: () =>
          import('./modules/metering/metering.module').then(m => m.MeteringModule)
      },
      {
        path: 'msp-mq-uploader',
        canActivateChild: [AuthorizeGuard],
        component: MqUploaderComponent,
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    useHash: true
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
