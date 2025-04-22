import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdditionalCompensationListRoutingModule } from './additional-compensation-list-routing.module';
import { BaseComponent } from './base/base.component';
import { TableComponent } from './table/table.component';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTableModule } from 'ng-zorro-antd/table';


@NgModule({
  declarations: [
    BaseComponent,
    TableComponent
  ],
  imports: [
    CommonModule,
    AdditionalCompensationListRoutingModule,
    NzCardModule,
    NzTableModule
  ]
})
export class AdditionalCompensationListModule { }
