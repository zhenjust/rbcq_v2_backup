import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MeteringRoutingModule } from './metering-routing.module';
import { MqUploaderComponent } from './mq-uploader/mq-uploader.component';
import { MqUploaderFilterComponent } from './mq-uploader/import/mq-uploader-filter.component';
import { SharedModule } from '@shared/shared.module';


@NgModule({
  declarations: [
    MqUploaderComponent,
    MqUploaderFilterComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    MeteringRoutingModule
  ]
})
export class MeteringModule { }
