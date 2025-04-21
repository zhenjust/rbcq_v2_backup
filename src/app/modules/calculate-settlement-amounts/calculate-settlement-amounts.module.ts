import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CalculateSettlementAmountsRoutingModule } from './calculate-settlement-amounts-routing.module';
import { BaseComponent } from './base/base.component';
import { FilterSearchComponent } from './filter-search/filter-search.component';
import { TableComponent } from './table/table.component';
import { NzCardModule } from 'ng-zorro-antd/card';


@NgModule({
  declarations: [
    BaseComponent,
    FilterSearchComponent,
    TableComponent
  ],
  imports: [
    CommonModule,
    CalculateSettlementAmountsRoutingModule,
    NzCardModule
  ],
  exports:[
    FilterSearchComponent,
    TableComponent,
    BaseComponent
  ]
})
export class CalculateSettlementAmountsModule { }
