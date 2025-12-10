import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MqUploaderComponent } from './mq-uploader/mq-uploader.component';
import { ngxPermissionsGuard } from 'ngx-permissions';
import { PHASE_TWO_AUTHORITIES } from '@shared/constants';


const routes: Routes = [
  {
    path: '',
    component: MqUploaderComponent,
  },
  {
    path: 'mq-uploader',
    component: MqUploaderComponent,
    canActivate: [ngxPermissionsGuard],
    data: {
      permissions: {
        only: [ PHASE_TWO_AUTHORITIES.RUN_MQ_UPLOADER ],
      }
    }

  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MeteringRoutingModule { }
