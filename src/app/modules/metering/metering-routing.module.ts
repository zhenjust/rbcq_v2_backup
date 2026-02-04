import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MqUploaderComponent } from './mq-uploader/mq-uploader.component';
import { ngxPermissionsGuard } from 'ngx-permissions';
import { externalRoutes, PHASE_TWO_AUTHORITIES } from '@shared/constants';
import { MeteringMasterfileComponent } from './metering-masterfile/metering-masterfile.component';
import { MeterDataValidationComponent } from './meter-data-validation/meter-data-validation.component';


const routes: Routes = [
  {
    path: 'mq-uploader',
    component: MqUploaderComponent,
    canActivate: [ngxPermissionsGuard],
    data: {
      permissions: {
        only: [PHASE_TWO_AUTHORITIES.RUN_MQ_UPLOADER],
        redirectTo: externalRoutes.HOME
      }
    },
  },
  {
    path: 'metering-masterfile',
    component: MeteringMasterfileComponent,
    canActivate: [ngxPermissionsGuard],
    data: {
      permissions: {
        only: [PHASE_TWO_AUTHORITIES.RUN_MQ_UPLOADER],
        redirectTo: externalRoutes.HOME
      }
    },
  },
  {
    path: 'meter-data-validation',
    component: MeterDataValidationComponent,
    canActivate: [ngxPermissionsGuard],
    data: {
      permissions: {
        only: [PHASE_TWO_AUTHORITIES.RUN_MQ_UPLOADER],
        redirectTo: externalRoutes.HOME
      }
    },
  }


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MeteringRoutingModule { }
