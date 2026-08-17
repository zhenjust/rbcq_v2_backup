import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CalendarOutline, ClockCircleOutline, CloseCircleOutline, DeleteOutline, DownOutline, EyeInvisibleOutline, EyeOutline, MinusSquareOutline, PlusSquareOutline, ReloadOutline, UploadOutline } from '@ant-design/icons-angular/icons';
import { NgbTimepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NZ_CONFIG, NzConfig } from 'ng-zorro-antd/core/config';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzFloatButtonModule } from 'ng-zorro-antd/float-button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzModalFooterDirective } from "ng-zorro-antd/modal";
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NgxPermissionsModule } from 'ngx-permissions';
import { QuillModule } from 'ngx-quill';

import { ConfirmWithContentComponent } from './components/confirm-with-content/confirm-with-content.component';
import { ConfirmWithDescComponent } from './components/confirm-with-desc/confirm-with-desc.component';
import { DateRangePickerComponent } from './components/date-range-picker/date-range-picker.component';
import { DateTimePickerComponent } from './components/date-time-picker/date-time-picker.component';
import { PaginatedTableComponent } from './components/paginated-table/paginated-table.component';
import { PipelineTableComponent } from './components/pipeline-table/pipeline-table.component';
import { PollingTimerComponent } from './components/polling-timer/polling-timer.component';
import { ProgressBarComponent } from './components/progress-bar/progress-bar.component';
import { ReloginComponent } from './components/relogin/relogin.component';
import { SendNotificationComponent } from './components/send-notification/send-notification.component';
import { TemplateTableComponent } from './components/template-table/template-table.component';
import { UploadBillingStatementComponent } from './components/upload-billing-statement/upload-billing-statement.component';
import { UploadSummaryComponent } from './components/upload-billing-statement/upload-summary.component';
import { EnumsToLabelsPipe, FileSizeFormatterPipe, FormErrorHandler, HasCompletedStatusPipe, HasFinalizedPipelinePipe, HasInprogressPipe, IsRowInProgressPipe, SettlementActionsPipe, SettlementPipelineFormatterPipe } from './pipes';
import { SettlementTableFormatterPipe } from './pipes/table-data-formatter.pipe';

const ngZorroConfig: NzConfig = {
  notification: { nzDuration: 300, nzMaxStack: 3, nzTop: '150px' }
};

const NgZorroModules = [
  NzInputNumberModule,
  NzTableModule,
  NzEmptyModule,
  NzAlertModule,
  NzDescriptionsModule,
  NzButtonModule,
  NzProgressModule,
  NzFormModule,
  NzDropDownModule,
  NzIconModule.forChild([
    ReloadOutline,
    PlusSquareOutline,
    MinusSquareOutline,
    DownOutline,
    DeleteOutline,
    CalendarOutline,
    ClockCircleOutline,
    CloseCircleOutline,
    EyeInvisibleOutline,
    EyeOutline,
    UploadOutline
  ]),
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
  FormErrorHandler,
  HasCompletedStatusPipe,
  HasFinalizedPipelinePipe,
  IsRowInProgressPipe,
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
    DateTimePickerComponent,
    PipelineTableComponent,
    PollingTimerComponent,
    UploadBillingStatementComponent,
    UploadSummaryComponent,
    SendNotificationComponent,
    ProgressBarComponent
  ],
  imports: [
    CommonModule,
    NgZorroModules,
    NzModalFooterDirective,
    NgxPermissionsModule,
    ReactiveFormsModule,
    RxReactiveFormsModule,
    FormsModule,
    FroalaEditorModule,
    FroalaViewModule,
    QuillModule.forRoot()
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
    FroalaEditorModule,
    FroalaViewModule,
    DateRangePickerComponent,
    DateTimePickerComponent,
    PipelineTableComponent,
    PollingTimerComponent,
    ProgressBarComponent,
    QuillModule
  ],
  providers: [
    { provide: NZ_CONFIG, useValue: ngZorroConfig }
  ]
})
export class SharedModule { }
