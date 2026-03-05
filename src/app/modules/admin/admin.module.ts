import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { ManageSecComponent } from './manage-sec/manage-sec.component';
import { SharedModule } from '@shared/shared.module';
import { CreateSecParamComponent } from './manage-sec/create-sec-param/create-sec-param.component';
import { NzModalFooterDirective } from "ng-zorro-antd/modal";


@NgModule({
  declarations: [
    ManageSecComponent,
    CreateSecParamComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    SharedModule,
    NzModalFooterDirective
]
})
export class AdminModule { }
