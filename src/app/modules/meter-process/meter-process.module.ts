import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MeterProcessRoutingModule } from './meter-process-routing.module';
import { MeterProcessConfigComponent } from './meter-process-config/meter-process-config.component';
import { BaseComponent } from './base/base.component';

import { NzCardModule } from 'ng-zorro-antd/card';
import { TableComponent } from './table/table.component';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';

import { SharedModule } from '@shared/shared.module';
import { RunJobSearchComponent } from './run-job-search/run-job-search.component';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { RunJobService, SearchFilterService } from '@shared/services/meterProcess';
import { NzResultModule } from 'ng-zorro-antd/result';


@NgModule({
  declarations: [
    BaseComponent,
    TableComponent,
    MeterProcessConfigComponent,
    RunJobSearchComponent
  ],
  imports: [
    CommonModule,
    MeterProcessRoutingModule,
    NzCardModule,
    NzTableModule,
    NzFlexModule,
    FormsModule, 
    NzSelectModule,
    ReactiveFormsModule,
    NzDatePickerModule,
    NzSpaceModule,
    NzInputNumberModule,
    SharedModule,
    NzButtonModule,
    NzInputModule,
    NzResultModule
  ],
  providers: [
    RunJobService,
    SearchFilterService
  ]
})
export class MeterProcessModule { }
