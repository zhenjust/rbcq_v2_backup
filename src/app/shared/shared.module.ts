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
import { EnumsToLabelsPipe, FileSizeFormatterPipe, HasInprogressPipe, SettlementActionsPipe, SettlementPipelineFormatterPipe } from './pipes';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzCardModule } from 'ng-zorro-antd/card';
import { PaginatedTableComponent } from './components/paginated-table/paginated-table.component';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { NzFloatButtonModule } from 'ng-zorro-antd/float-button';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzInputModule } from 'ng-zorro-antd/input';
import { ConfirmWithContentComponent } from './components/confirm-with-content/confirm-with-content.component';
import { DateRangePickerComponent } from './components/date-range-picker/date-range-picker.component';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { ReloginComponent } from './components/relogin/relogin.component';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NgbTimepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { DateTimePickerComponent } from './components/date-time-picker/date-time-picker.component';

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
  NzCardModule,
  NzTagModule,
  NzTabsModule,
  NzSelectModule,
  NzRadioModule,
  NzUploadModule,
  NzSpaceModule,
  NzDatePickerModule,
  NzTimePickerModule,
  NzDividerModule,
  NzToolTipModule,
  NzPopoverModule,
  NzFloatButtonModule,
  NzIconModule,
  NzBadgeModule,
  NzSpinModule,
  NzInputModule,
  NzCheckboxModule,
  NzResultModule,

  NgbTimepickerModule
];

const Pipes = [
  SettlementTableFormatterPipe,
  SettlementPipelineFormatterPipe,
  SettlementActionsPipe,
  FileSizeFormatterPipe,
  EnumsToLabelsPipe,
  HasInprogressPipe,
];

@NgModule({
  declarations: [
    ...Pipes,
    TemplateTableComponent,
    ConfirmWithDescComponent,
    PaginatedTableComponent,
    ConfirmWithContentComponent,
    DateRangePickerComponent,
    ReloginComponent,
    DateTimePickerComponent
  ],
  imports: [
    CommonModule,
    NgZorroModules,
    NzModalFooterDirective,
    NgxPermissionsModule,
    ReactiveFormsModule,
    RxReactiveFormsModule,
    FormsModule,
],
  exports: [
    ...Pipes,
    TemplateTableComponent,
    NgZorroModules,
    ConfirmWithDescComponent,
    PaginatedTableComponent,
    ReactiveFormsModule,
    RxReactiveFormsModule,
    NgxPermissionsModule,
    FormsModule,
    DateRangePickerComponent,
    DateTimePickerComponent
  ],
  providers: [
    { provide: NZ_CONFIG, useValue: ngZorroConfig }
  ]
})
export class SharedModule { }
