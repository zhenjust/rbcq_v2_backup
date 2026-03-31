import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettlementRoutingModule } from './settlement-routing.module';
import { WesmPenaltyComponent } from './wesm-penalty/wesm-penalty.component';
import { SharedModule } from '@shared/shared.module';


@NgModule({
  declarations: [
    WesmPenaltyComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    SettlementRoutingModule
  ]
})
export class SettlementModule { }
