import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MeteringRoutingModule } from './metering-routing.module';
import { MqUploaderComponent } from './mq-uploader/mq-uploader.component';
import { MqUploaderFilterComponent } from './mq-uploader/import/mq-uploader-filter.component';
import { SharedModule } from '@shared/shared.module';
import { MqHistoryFiltersComponent } from './mq-uploader/filters/mq-history-filters.component';


@NgModule({
  declarations: [
    MqUploaderComponent,
    MqUploaderFilterComponent,
    MqHistoryFiltersComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    MeteringRoutingModule
  ]
})
export class MeteringModule { }
