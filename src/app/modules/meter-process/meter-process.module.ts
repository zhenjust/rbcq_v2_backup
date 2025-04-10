import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MeterProcessRoutingModule } from './meter-process-routing.module';
import { BaseComponent } from './base/base.component';


@NgModule({
  declarations: [
    BaseComponent
  ],
  imports: [
    CommonModule,
    MeterProcessRoutingModule
  ]
})
export class MeterProcessModule { }
