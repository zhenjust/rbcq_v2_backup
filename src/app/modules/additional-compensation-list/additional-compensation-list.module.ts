import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdditionalCompensationListRoutingModule } from './additional-compensation-list-routing.module';
import { BaseComponent } from './base/base.component';
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
import { FilterFileClaimComponent } from './filter-file-claim/filter-file-claim.component';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';
import { NzDividerModule } from 'ng-zorro-antd/divider';


@NgModule({
  declarations: [
    BaseComponent,
    TableComponent,
    FilterFileClaimComponent
  ],
  imports: [
    CommonModule,
    AdditionalCompensationListRoutingModule,
    NzCardModule,
    NzTableModule,
    NzFlexModule,
    ReactiveFormsModule,
    FormsModule,
    NzSelectModule,
    NzButtonModule,
    NzFormModule,
    NzSpaceModule,
    NzInputNumberModule,
    NzDatePickerModule,
    SharedModule,
    NzResultModule,
    NzInputModule,
    NzTimePickerModule,
    NzDividerModule
  ]
})
export class AdditionalCompensationListModule { }
