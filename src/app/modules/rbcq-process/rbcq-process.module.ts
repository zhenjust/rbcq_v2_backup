import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RbcqProcessRoutingModule } from './rbcq-process-routing.module';
import { BaseComponent } from './base/base.component';
import { NzCardModule } from 'ng-zorro-antd/card';
import { RbcqConfigComponent } from './rbcq-config/rbcq-config.component';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';


@NgModule({
  declarations: [
    BaseComponent,
    RbcqConfigComponent,
    
  ],
  imports: [
    CommonModule,
    RbcqProcessRoutingModule,
    NzCardModule,
    NzFlexModule,
    NzSpaceModule,
    NzDatePickerModule,
    NzSelectModule,
    NzButtonModule,
    FormsModule,
    ReactiveFormsModule,
    NzProgressModule,
    NzCheckboxModule,
    NzTableModule,
    NzPaginationModule
    
  ]
})
export class RbcqProcessModule { }
