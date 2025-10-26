import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemplateTableComponent } from './components/template-table/template-table.component';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NZ_CONFIG, NzConfig } from 'ng-zorro-antd/core/config';
import { ConfirmWithDescComponent } from './components/confirm-with-desc/confirm-with-desc.component';
import { NzModalFooterDirective } from "ng-zorro-antd/modal";
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NgxPermissionsModule } from 'ngx-permissions';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { SettlementTableFormatterPipe } from './pipes/table-data-formatter.pipe';
import { SettlementPipelineFormatterPipe } from './pipes';
import { NzTagModule } from 'ng-zorro-antd/tag';

const ngZorroConfig: NzConfig = {
  notification: { nzDuration: 300, nzMaxStack: 3, nzTop: '150px' }
};

const NgZorroModules = [
  NzTableModule,
  NzEmptyModule,
  NzAlertModule,
  NzDescriptionsModule,
  NzButtonModule,
  NzProgressModule,
  NzFormModule,
  NzDropDownModule,
  NzIconModule,
  NzTagModule,
];

const Pipes = [
  SettlementTableFormatterPipe,
  SettlementPipelineFormatterPipe,
];

@NgModule({
  declarations: [
    ...Pipes,
    TemplateTableComponent,
    ConfirmWithDescComponent
  ],
  imports: [
    CommonModule,
    NgZorroModules,
    NzModalFooterDirective,
    NgxPermissionsModule
],
  exports: [
    ...Pipes,
    TemplateTableComponent,
    NgZorroModules,
    ConfirmWithDescComponent
  ],
  providers: [
    { provide: NZ_CONFIG, useValue: ngZorroConfig }
  ]
})
export class SharedModule { }
