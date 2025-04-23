import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CalculateSettlementAmountsRoutingModule } from './calculate-settlement-amounts-routing.module';
import { BaseComponent } from './base/base.component';
import { FilterSearchComponent } from './filter-search/filter-search.component';
import { TableComponent } from './table/table.component';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { ReactiveFormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';


@NgModule({
  declarations: [
    BaseComponent,
    FilterSearchComponent,
    TableComponent
  ],
  imports: [
    CommonModule,
    CalculateSettlementAmountsRoutingModule,
    NzCardModule,
    NzTableModule,
    NzFlexModule,
    ReactiveFormsModule,
    NzSelectModule,
    NzButtonModule,
    NzFormModule
  ],
  exports:[
    FilterSearchComponent,
    TableComponent,
    BaseComponent
  ]
})
export class CalculateSettlementAmountsModule { }
