import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RbcqRoutingModule } from './rbcq-routing.module';
import { SharedModule } from '@shared/shared.module';
import { BaseComponent } from './base/base.component';

import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RbcqUploadingComponent } from './rbcq-uploading/rbcq-uploading.component';
import { ViewRbcqComponent } from './view-rbcq/view-rbcq.component';


@NgModule({
  declarations: [
    BaseComponent,
    RbcqUploadingComponent,
    ViewRbcqComponent,
  ],
  imports: [
    CommonModule,
    RbcqRoutingModule,
    SharedModule,
    NzCardModule,
    NzTableModule,
    NzAlertModule,
    NzButtonModule,
    NzIconModule,
    NzUploadModule,
    NzPaginationModule,
    NzSelectModule,
    FontAwesomeModule
  ],
  providers: [
    NzMessageService
  ]
})
export class RbcqModule { }
