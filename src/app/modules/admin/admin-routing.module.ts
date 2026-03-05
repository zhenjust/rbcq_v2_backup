import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManageSecComponent } from './manage-sec/manage-sec.component';
import { ngxPermissionsGuard } from 'ngx-permissions';
import { externalRoutes, PHASE_TWO_AUTHORITIES } from '@shared/constants';

const routes: Routes = [
  {
    path: 'sec',
    component: ManageSecComponent,
    canActivate: [ngxPermissionsGuard],
    data: {
      permissions: {
        only: [PHASE_TWO_AUTHORITIES.RUN_MQ_UPLOADER],
        redirectTo: externalRoutes.HOME
      }
    },
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
