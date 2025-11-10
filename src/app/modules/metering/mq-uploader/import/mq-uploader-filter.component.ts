import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { AuthorizationService } from '@core/services/authorization.service';
import { MQ_UPLOAD_CATEGORY } from '@shared/constants';
import { LABELS } from '@shared/constants/labels.const';
import { MESSAGES } from '@shared/constants/messages.const';
import { MqUploaderService } from '@shared/services/api';
import { SystemUtilService } from '@shared/services/utils';
import { addDays, addMonths, differenceInCalendarMonths, format, set, startOfDay } from 'date-fns';
import { differenceInCalendarDays } from 'date-fns';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectOptionInterface } from 'ng-zorro-antd/select';
import { NzUploadChangeParam } from 'ng-zorro-antd/upload';
import { distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-mq-uploader-filter',
  standalone: false,
  templateUrl: './mq-uploader-filter.component.html',
  styleUrl: './mq-uploader-filter.component.scss'
})
export class MqUploaderFilterComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly modal = inject(NzModalService);
  private readonly sysUtil = inject(SystemUtilService);
  private readonly mqs = inject(MqUploaderService);
  private readonly as = inject(AuthorizationService);

  LABELS = LABELS;
  form: FormGroup;
  categoryOpts: NzSelectOptionInterface[];
  conversionOpts: NzSelectOptionInterface[];
  fileList: File[] = [];
  mspOpts: NzSelectOptionInterface[];
  recordMq: Record<string, string> = {}

  ngOnInit(): void {
    this.buildForm();
    this.getReferences();
    this.getMqList();

    console.log(this.as.currentUser())
  }

  buildForm(): void {
    this.form = this.fb.group({
      category: [null],
      mspShortName: [null],
      convertToFiveMin: [false],
      tradingDay: [null],
      tradingMonth: [null],
      interval: [null],
    });

    this.handleCategoryChange();
    this.handleTradingDayChange();
    this.handleTradingMonthChange();
  }

  handleCategoryChange(): void {
    this.category?.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(() => {
        this.tradingDay?.reset();
        this.tradingMonth?.reset();
        this.interval?.reset();
      });
  }

  handleTradingDayChange(): void {
    this.tradingDay?.valueChanges
      .subscribe(day => {
        if (!day) {
          return;
        }

        const startInterval = startOfDay(day).setMinutes(5);
        const endInterval = startOfDay(addDays(day, 1)).setMinutes(0);
        this.interval?.setValue([startInterval, endInterval]);
      });
  }

  handleTradingMonthChange(): void {
    this.tradingMonth?.valueChanges
      .subscribe((month: Date) => {
        if (!month) {
          return;
        }

        const startInterval = set(month, { date: 26, hours: 0, minutes: 5 });
        const endInterval = set(addMonths(month, 1), { date: 26, hours: 0, minutes: 5 });
        this.interval?.setValue([startInterval, endInterval]);
      });

  }

  getReferences(): void {
    this.categoryOpts = this.sysUtil.nzOptionsFormatter(MQ_UPLOAD_CATEGORY, true);
    this.conversionOpts = [
      { label: LABELS.UPLOAD_DATA_AS_IS, value: false },
      { label: LABELS.CONVERT_TO_5_MIN, value: true }
    ];
  }

  getMqList(): void {
    this.mqs.getMspList()
      .subscribe(mspList => {
        this.mspOpts = mspList.map(item => ({
          label: `${item.participantName} (${item.shortName})`, value: item.shortName})) as NzSelectOptionInterface[];
        });
  }

  beforeUpload = (file: any) => {
    // add file validations;
    console.log({file})
    // this.fileList.push(file);
    return true;
  }

  handleFileChange(uploadEvent: NzUploadChangeParam): void {
    if (uploadEvent.type === 'error') {
      this.fileList.push(uploadEvent.file.originFileObj!);
    }
  }

  clearFiles(): void {
    this.modal.confirm({
      nzIconType: 'danger',
      nzContent: MESSAGES.CLEAR_ALL_FILES,
      nzTitle: `${LABELS.CLEAR} ${LABELS.SELECTED_FILES}`,
      nzCentered: true,
      nzOnOk: () => this.fileList = []
    }, 'warning')
  }

  import(): void {
    const formValue = this.form.getRawValue();
    const formData = new FormData();
    const isDaily = this.isDaily || this.isCorrectedDaily;
    const isMonthly = this.isMonthly || this.isCorrectedMonthly;

    const payload = {
      ...formValue,
      convertToFiveMin: formValue.convertToFiveMin.toString(),
      tradingDate: isDaily ? (formValue?.tradingDay && format(formValue.tradingDay, 'yyyy-MM-dd')) : '',
      tradingMonth: isMonthly ? (formValue?.tradingMonth && format(formValue.tradingMonth, 'MM yyyy')) : '',
      startInterval: format(formValue.interval[0], 'yyyy-MM-dd HH:mm'),
      endInterval: format(formValue.interval[1], 'yyyy-MM-dd HH:mm'),
    }

    delete payload.interval;
    delete payload.tradingDay;
    // isDaily && delete payload.tradingMonth;
    // isMonthly && delete payload.tradingDate;

    Object.keys(payload).forEach(key => {
      formData.append(key, payload[key].toString());
    });

    this.fileList.forEach(file => {
      formData.append('file', file);
    });

    console.log({payload, formData});

    this.mqs.uploadMq(formData)
      .subscribe(res => console.log({res}));
  }


  disabledPrevDay = (currentDate: Date) => this.isDaily ? differenceInCalendarDays(currentDate, new Date()) !== -1 : differenceInCalendarDays(currentDate, new Date()) > -1;
  disabledPrevMonth = (currentDate: Date) => this.isMonthly ? differenceInCalendarMonths(currentDate, new Date()) !== -1 : differenceInCalendarMonths(currentDate, new Date()) > -1;
  disabledInterval = () => true;

  get category(): AbstractControl | null { return this.form.get('category'); }
  get tradingDay(): AbstractControl | null { return this.form.get('tradingDay'); }
  get tradingMonth(): AbstractControl | null { return this.form.get('tradingMonth'); }
  get interval(): AbstractControl | null { return this.form.get('interval'); }

  get isDaily(): boolean { return this.category?.value === MQ_UPLOAD_CATEGORY.DAILY; }
  get isCorrectedDaily(): boolean { return this.category?.value === MQ_UPLOAD_CATEGORY.CORRECTED_METER_DATA_DAILY; }
  get isMonthly(): boolean { return this.category?.value === MQ_UPLOAD_CATEGORY.MONTHLY; }
  get isCorrectedMonthly(): boolean { return this.category?.value === MQ_UPLOAD_CATEGORY.CORRECTED_METER_DATA_MONTHLY; }

  get acceptedFile(): string { return (this.isDaily || this.isMonthly) ? '.mdef, .mde, .csv' : '.csv'; }

}
