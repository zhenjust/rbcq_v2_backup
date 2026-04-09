import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettlementRoutingModule } from './settlement-routing.module';
import { WesmPenaltyComponent } from './wesm-penalty/wesm-penalty.component';
import { SharedModule } from '@shared/shared.module';
import { AdditionalCompensationComponent } from './additional-compensation/additional-compensation.component';
import { FileAClaimComponent } from './additional-compensation/file-a-claim/file-a-claim.component';


@NgModule({
  declarations: [
    WesmPenaltyComponent,
    AdditionalCompensationComponent,
    FileAClaimComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    SettlementRoutingModule
  ]
})
export class SettlementModule { }
