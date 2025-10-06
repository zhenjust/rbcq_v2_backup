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
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTooltipDirective } from "ng-zorro-antd/tooltip";
import { ConsolidateComponent } from './consolidate/consolidate.component';
import { NzModalFooterDirective } from "ng-zorro-antd/modal";

@NgModule({
  declarations: [
    BaseComponent,
    TableComponent,
    MeterProcessConfigComponent,
    RunJobSearchComponent,
    ConsolidateComponent
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
    NzResultModule,
    NzTagModule,
    NzProgressModule,
    NzDividerModule,
    NzTimePickerModule,
    NzSpinModule,
    NzTableModule,
    NzTooltipDirective,
    NzModalFooterDirective
],
  providers: [
    RunJobService,
    SearchFilterService,
  ]
})
export class MeterProcessModule { }
