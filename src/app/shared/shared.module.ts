import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemplateTableComponent } from './components/template-table/template-table.component';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NZ_CONFIG, NzConfig } from 'ng-zorro-antd/core/config';

const ngZorroConfig: NzConfig = {
  notification: { nzDuration: 300, nzMaxStack: 3, nzTop: '150px' }
};

const ngZorroModules = [
  NzTableModule,
  NzEmptyModule,
  NzAlertModule
];

@NgModule({
  declarations: [
    TemplateTableComponent
  ],
  imports: [
    CommonModule,
    ngZorroModules
  ],
  exports: [
    TemplateTableComponent,
    ngZorroModules
  ],
  providers: [
    { provide: NZ_CONFIG, useValue: ngZorroConfig }
  ]
})
export class SharedModule { }
