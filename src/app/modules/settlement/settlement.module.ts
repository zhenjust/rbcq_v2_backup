import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettlementRoutingModule } from './settlement-routing.module';
import { WesmPenaltyComponent } from './wesm-penalty/wesm-penalty.component';
import { SharedModule } from '@shared/shared.module';
import { AdditionalCompensationComponent } from './additional-compensation/additional-compensation.component';
import { FileAClaimComponent } from './additional-compensation/file-a-claim/file-a-claim.component';
import { PenaltyGenerateIwsComponent } from './wesm-penalty/penalty-generate-iws/penalty-generate-iws.component';
import { AmsComponent } from './shared/ams/ams.component';
import { MarketFeeComponent } from './market-fee/market-fee.component';
import { RunMarketFeeComponent } from './market-fee/run-market-fee/run-market-fee.component';


@NgModule({
  declarations: [
    WesmPenaltyComponent,
    AdditionalCompensationComponent,
    FileAClaimComponent,
    PenaltyGenerateIwsComponent,
    AmsComponent,
    MarketFeeComponent,
    RunMarketFeeComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    SettlementRoutingModule
  ]
})
export class SettlementModule { }
