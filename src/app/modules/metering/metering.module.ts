import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MeteringRoutingModule } from './metering-routing.module';
import { MqUploaderComponent } from './mq-uploader/mq-uploader.component';
import { MqUploaderFilterComponent } from './mq-uploader/import/mq-uploader-filter.component';
import { SharedModule } from '@shared/shared.module';
import { MqHistoryFiltersComponent } from './mq-uploader/filters/mq-history-filters.component';
import { MeteringMasterfileComponent } from './metering-masterfile/metering-masterfile.component';
import { GenerateMmfComponent } from './metering-masterfile/generate-mmf/generate-mmf.component';
import { NzModalFooterDirective } from "ng-zorro-antd/modal";
import { MeterDataValidationComponent } from './meter-data-validation/meter-data-validation.component';
import { GenerateMdvComponent } from './meter-data-validation/generate-mdv/generate-mdv.component';


@NgModule({
  declarations: [
    MqUploaderComponent,
    MqUploaderFilterComponent,
    MqHistoryFiltersComponent,
    MeteringMasterfileComponent,
    GenerateMmfComponent,
    MeterDataValidationComponent,
    GenerateMdvComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    MeteringRoutingModule,
    NzModalFooterDirective
]
})
export class MeteringModule { }
