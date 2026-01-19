import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { AuthorizationService } from '@core/services/authorization.service';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { MQ_UPLOAD_CATEGORY } from '@shared/constants';
import { LABELS } from '@shared/constants/labels.const';
import { MESSAGES } from '@shared/constants/messages.const';
import { CurrentUser } from '@shared/interfaces';
import { MqUploaderService } from '@shared/services/api';
import { AdminService } from '@shared/services/api/admin.service';
import { SystemUtilService } from '@shared/services/utils';
import { addDays, addMonths, differenceInCalendarMonths, format, isAfter, isSameDay, isToday, isWithinInterval, set, startOfDay } from 'date-fns';
import { differenceInCalendarDays } from 'date-fns';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectOptionInterface } from 'ng-zorro-antd/select';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { ToastrService } from 'ngx-toastr';
import { distinctUntilChanged, Subscription } from 'rxjs';

@Component({
  selector: 'app-mq-uploader-filter',
  standalone: false,
  templateUrl: './mq-uploader-filter.component.html',
})
export class MqUploaderFilterComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly modal = inject(NzModalService);
  private readonly sysUtil = inject(SystemUtilService);
  private readonly admin = inject(AdminService);
  private readonly mqs = inject(MqUploaderService);
  private readonly as = inject(AuthorizationService);
  private readonly modalRef = inject(NzModalRef);
  private readonly ts = inject(ToastrService);

  LABELS = LABELS;
  form: FormGroup;
  categoryOpts: NzSelectOptionInterface[];
  conversionOpts: NzSelectOptionInterface[];
  fileList: NzUploadFile[] = [];
  mspOpts: NzSelectOptionInterface[] | null = null;
  recordMq: Record<string, string> = {}
  currentUser: CurrentUser | null;
  busy$: Subscription;
  dateDeduction: number;

  ngOnInit(): void {
    this.currentUser = this.as.currentUser();
    this.buildForm();
    this.getReferences();
    this.getMqList();
  }

  buildForm(): void {
    const required = RxwebValidators.required();
    this.form = this.fb.group({
      category: [null, required],
      mspShortName: [null, RxwebValidators.required({ conditionalExpression: () => !this.isMspUser })],
      convertToFiveMin: [false],
      tradingDay: [null, RxwebValidators.required({ conditionalExpression: () => this.isDaily })],
      tradingMonth: [null, RxwebValidators.required({ conditionalExpression: () => this.isMonthly })],
      interval: [null, [required, RxwebValidators.minLength({ value: 1 })]],
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
    this.getMqDays();
    this.categoryOpts = this.sysUtil.nzOptionsFormatter(MQ_UPLOAD_CATEGORY, true);
    this.conversionOpts = [
      { label: LABELS.UPLOAD_DATA_AS_IS, value: false },
      { label: LABELS.CONVERT_TO_5_MIN, value: true }
    ];
  }

  getMqDays(): void {
    this.admin.getConfigurations('MQ_ALLOWABLE_TRADING_DATE')
      .subscribe(value => this.dateDeduction = +value + 1 || 1);
  }

  getMqList(): void {
    this.mqs.getMspList()
      .subscribe(mspList => {
        this.mspOpts = mspList.map(item => ({
          label: `${item.participantName} (${item.shortName})`, value: item.shortName})) as NzSelectOptionInterface[];

        // const currentMsp = this.currentUser?.principal?.dn;
        // if (currentMsp && this.isMspUser && this.mspOpts.length) {
        //   const trimmedMspName = currentMsp.split('_');
        //   const index = this.mspOpts?.findIndex(opt => opt.value.toLowerCase() === trimmedMspName[0]);
        //   this.mspShortName?.setValue(this.mspOpts[index]?.value);
        //   this.mspShortName?.disable();
        // }

    });
  }

  beforeUpload = (file: NzUploadFile) => {
    const fileType = file.name.split('.').pop();
    const acceptedTypesArr = this.acceptedFile
      .split(',')
      .map(fileType => fileType.trim())

    if (!acceptedTypesArr.includes(`.${fileType}`)) {
      this.ts.error(MESSAGES.INVALID_FILE_TYPE);
      return false;
    }

    const hasDuplicate = this.fileList
      .filter(({ name, uid }) => name === file.name && uid !== file.uid);

    if (hasDuplicate?.length) {
      this.ts.error(MESSAGES.DUPLICATE_FILES);
      return false;
    }

    this.fileList.push(file);
    return false;
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

    const formDataGrp: FormData[] = [];
    const headerPayload = {...payload, fileCount: this.fileList.length};

    this.busy$ = this.mqs.uploadMqHeader(headerPayload)
      .subscribe(headerId => {
        this.fileList.forEach(file => {
          const formData = new FormData();
          const fileType = file.name.split('.').pop();
          const isMdef = ['MDE', 'MDF'].includes(fileType!) ? 'MDEF' : null;
          formData.append('file', file as any);
          formData.append('headerID', headerId);
          formData.append('fileType', isMdef || fileType!.toString().toUpperCase());

          Object.keys(payload).forEach(key => {
            formData.append(key, payload[key]?.toString());
          });

          formDataGrp.push(formData);
        });

        this.modalRef.destroy({ payload, formDataGrp, headerId });
      });
  }

  disabledPrevDay = (currentDate: Date) => this.isDaily ? (differenceInCalendarDays(currentDate, new Date()) <= -this.dateDeduction || isAfter(currentDate, new Date()) ||  isToday(currentDate)) : differenceInCalendarDays(currentDate, new Date()) > -1;
  disabledPrevMonth = (currentDate: Date) => this.isMonthly ? differenceInCalendarMonths(currentDate, new Date()) !== -1 : differenceInCalendarMonths(currentDate, new Date()) > -1;
  disabledMonthlyInterval = (currentDate: Date) => this.interval?.value?.length && !isWithinInterval(currentDate, { start: this.interval?.value[0], end: this.interval?.value[1]});
  disabledDailyInterval = (currentDate: Date) => !isSameDay(this.tradingDay?.value, currentDate) && !isSameDay(addDays(this.tradingDay?.value, 1), currentDate);
  disabledInterval = (currentDate: Date) => this.isMonthly ? this.disabledMonthlyInterval(currentDate) : this.disabledDailyInterval(currentDate);

  get category(): AbstractControl | null { return this.form.get('category'); }
  get tradingDay(): AbstractControl | null { return this.form.get('tradingDay'); }
  get tradingMonth(): AbstractControl | null { return this.form.get('tradingMonth'); }
  get interval(): AbstractControl | null { return this.form.get('interval'); }
  get mspShortName(): AbstractControl | null { return this.form.get('mspShortName'); }

  get isDaily(): boolean { return this.category?.value === MQ_UPLOAD_CATEGORY.DAILY; }
  get isCorrectedDaily(): boolean { return this.category?.value === MQ_UPLOAD_CATEGORY.CORRECTED_METER_DATA_DAILY; }
  get isMonthly(): boolean { return this.category?.value === MQ_UPLOAD_CATEGORY.MONTHLY; }
  get isCorrectedMonthly(): boolean { return this.category?.value === MQ_UPLOAD_CATEGORY.CORRECTED_METER_DATA_MONTHLY; }

  get acceptedFile(): string { return (this.isDaily || this.isMonthly) ? '.mdef, .mde, .mdf, .csv, .MDE, .MDF' : '.csv'; }
  get isMspUser(): boolean { return this.currentUser?.principal?.department === 'MSP'; }

}
