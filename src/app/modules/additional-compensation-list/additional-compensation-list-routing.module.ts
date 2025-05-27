import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NEW_ROUTES } from '@shared/constants';
import { BaseComponent } from './base/base.component';
import { settlementSearchNames } from '@shared/enums';

const routes: Routes = [
  {
    path: NEW_ROUTES.ADDITIONAL_COMPENSATION_LIST,
    component: BaseComponent,
    data: {
      pageTitle: 'Additional Compensation',
      searchName: settlementSearchNames.MANAGE_ADD_COM_CLAIMS
    }
  },
  {
    path: NEW_ROUTES.ADDITIONAL_COMPENSATION_INVOICE,
    component: BaseComponent,
    data: {
      pageTitle: 'Update Additional Compensation Invoice',
      searchName: settlementSearchNames.UPDATE_ADD_COM_INVOICE
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdditionalCompensationListRoutingModule { }
