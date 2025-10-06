import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemplateTableComponent } from './components/template-table/template-table.component';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzAlertModule } from 'ng-zorro-antd/alert';

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
  ]
})
export class SharedModule { }
