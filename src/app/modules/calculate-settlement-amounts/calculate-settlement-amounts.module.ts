import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CalculateSettlementAmountsRoutingModule } from './calculate-settlement-amounts-routing.module';
import { BaseComponent } from './base/base.component';
import { FilterSearchComponent } from './filter-search/filter-search.component';
import { TableComponent } from './table/table.component';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { SharedModule } from '@shared/shared.module';


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
    FormsModule,
    NzSelectModule,
    NzButtonModule,
    NzFormModule,
    NzButtonModule,
    NzSpaceModule,
    NzInputNumberModule,
    NzDatePickerModule,
    SharedModule
  ],
  exports:[
    FilterSearchComponent,
    TableComponent,
    BaseComponent
  ]
})
export class CalculateSettlementAmountsModule { }
