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

const ngZorroConfig: NzConfig = {
  notification: { nzDuration: 300, nzMaxStack: 3, nzTop: '150px' }
};

const ngZorroModules = [
  NzTableModule,
  NzEmptyModule,
  NzAlertModule,
  NzDescriptionsModule,
  NzButtonModule,
  NzProgressModule
];

@NgModule({
  declarations: [
    TemplateTableComponent,
    ConfirmWithDescComponent
  ],
  imports: [
    CommonModule,
    ngZorroModules,
    NzModalFooterDirective
],
  exports: [
    TemplateTableComponent,
    ngZorroModules,
    ConfirmWithDescComponent
  ],
  providers: [
    { provide: NZ_CONFIG, useValue: ngZorroConfig }
  ]
})
export class SharedModule { }
