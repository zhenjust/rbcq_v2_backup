import { Component, inject, OnInit, signal } from '@angular/core';
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
import { addDays, addMonths, differenceInCalendarMonths, format, getHours, getMinutes, getTime, isAfter, isBefore, isSameDay, isSameHour, isToday, isWithinInterval, set, setHours, setMinutes, startOfDay, subMonths } from 'date-fns';
import { differenceInCalendarDays } from 'date-fns';
import { DisabledTimeFn } from 'ng-zorro-antd/date-picker';
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
  regCategory: string;
  timeLimit: string;
  isAllowedImport: boolean;

  maxInterval = signal<Date | null>(null);

  ngOnInit(): void {
    this.currentUser = this.as.currentUser();
    this.getNavbarInfo();
    this.buildForm();
    this.getMqList();
  }

  buildForm(): void {
    const required = RxwebValidators.required();
    this.form = this.fb.group({
      category: [null, required],
      mspShortName: [null, RxwebValidators.required({ conditionalExpression: () => !this.isMspUser })],
      convertToFiveMin: [false],
      tradingDay: [null, RxwebValidators.required({ conditionalExpression: () => this.isDaily || this.isCorrectedDaily })],
      tradingMonth: [null, RxwebValidators.required({ conditionalExpression: () => this.isMonthly || this.isCorrectedMonthly })],
      // interval: [{value: null, disabled: true}, [required, RxwebValidators.minLength({ value: 1 })]],
      correctedRemarks: [null],
      intervalFrom: [{value: null, disabled: true}, RxwebValidators.required()],
      intervalTo: [{value: null, disabled: true}, RxwebValidators.required()],
    });

    this.handleCategoryChange();
    this.handleTradingDayChange();
    this.handleTradingMonthChange();
  }

  getTime(): void {
    this.admin.getConfigurations('MQ_GATE_CLOSURE_TIME')
      .subscribe(value => {
        const timeSplit = value?.split(':');
        if (timeSplit?.length) {
          const newHour = setHours(new Date(), +timeSplit[0]);
          const newMins = setMinutes(newHour, +timeSplit[1]);
          this.timeLimit = format(newMins, 'p');
          this.isAllowedImport = (new Date()) < newMins;

          const disableDaily = !this.isAllowedImport && this.isMspUser;

          this.categoryOpts = this.sysUtil.nzOptionsFormatter(MQ_UPLOAD_CATEGORY, true)
            .map(option => ({
              ...option,
              disabled: (option.value === 'DAILY' && disableDaily)
            }));
        }
      });
  }

  getNavbarInfo(): void {
    this.admin.getNavbarInfo()
      .subscribe(res => {
        if (res) {
          this.regCategory = res?.registrationCategory;
          this.mspShortName?.updateValueAndValidity();
        }

        this.getReferences();
      });
  }


  handleCategoryChange(): void {
    this.category?.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(() => {
        this.tradingDay?.reset();
        this.tradingMonth?.reset();
        this.intervalFrom?.reset();
        this.intervalTo?.reset();
      });
  }

  handleTradingDayChange(): void {
    this.tradingDay?.valueChanges
      .subscribe(day => {
        if (!day) {
          this.intervalFrom?.disable();
          this.intervalTo?.disable();
          return;
        }

        const startInterval = startOfDay(day).setMinutes(5);
        const endInterval = startOfDay(addDays(day, 1)).setMinutes(0);

        this.intervalFrom?.setValue(new Date(startInterval));
        this.intervalTo?.setValue(new Date(endInterval));
        this.intervalFrom?.enable();
        this.intervalTo?.enable();
        // this.interval?.setValue([startInterval, endInterval]);
        // this.interval?.enable();
      });
  }

  handleTradingMonthChange(): void {
    this.tradingMonth?.valueChanges
      .subscribe((month: Date) => {
        if (!month) {
          this.intervalFrom?.disable();
          this.intervalTo?.disable();
          return;
        }

        const startInterval = set(subMonths(month, 1), { date: 26, hours: 0, minutes: 5 });
        const endInterval = set(month, { date: 26, hours: 0, minutes: 0 });
        this.maxInterval.set(endInterval);
        this.intervalFrom?.setValue(startInterval);
        this.intervalTo?.setValue(endInterval);
        this.intervalFrom?.enable();
        this.intervalTo?.enable();

        // this.interval?.setValue([startInterval, endInterval]);
        // this.interval?.enable();
      });

  }

  getReferences(): void {
    this.getTime();
    this.getMqDays();

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
    });
  }

  beforeUpload = (file: NzUploadFile) => {
    const fileType = file.name.split('.').pop();
    const acceptedTypesArr = this.acceptedFile
      .split(',')
      .map(fileType => fileType.trim())

    if (file.name?.length > 100) {
      this.ts.error(MESSAGES.LONG_FILE_NAME);
      return false;
    }

    if (!acceptedTypesArr.includes(`.${fileType}`)) {
      this.ts.error(MESSAGES.INVALID_FILE_TYPE_MQ);
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
      startInterval: format(formValue.intervalFrom, 'yyyy-MM-dd HH:mm'),
      endInterval: format(formValue.intervalTo, 'yyyy-MM-dd HH:mm'),
      correctedRemarks: formValue.correctedRemarks ?? '',
      tradingDateFrom: format(formValue.intervalFrom, 'yyyy-MM-dd'),
      tradingDateTo: format(formValue.intervalTo, 'yyyy-MM-dd'),
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

  disabledStartTime: DisabledTimeFn = (_value) => {
    const time = +format(getTime(_value as Date), 'H');
    return {
      nzDisabledHours: () => [],
      nzDisabledMinutes: () => !time ? [0] : [],
      nzDisabledSeconds: () => []
    };
  }

  disabledEndTime: DisabledTimeFn = (_value) => {
    const _isSameDay = isSameDay(_value as Date, this.intervalFrom?.value);
    const startHour = getHours(this.intervalFrom?.value);
    const endHourArr = Array.from({ length: startHour }, (_, i) => (i * 1));
    const _isSameHour = isSameHour(this.intervalFrom?.value, _value as Date);
    const isAfterHour = isAfter(_value as Date, this.intervalFrom?.value);
    const startMin = getMinutes(this.intervalFrom?.value);
    const minsArr = Array.from({ length: 12 }, (_, i) => (i) * 5);
    const indexStartMin = minsArr.indexOf(startMin);
    const allHours = Array.from({ length: 12 }, (_, i) => (i + 1) * 5);
    const isBeforeEndDay = isBefore(_value as Date, this.maxInterval() as Date);

    return {
      nzDisabledHours: () => isBeforeEndDay ? [] : (_isSameDay ? endHourArr : Array.from({ length: 23 }, (_, i) => i + 1)),
      nzDisabledMinutes: () => isBeforeEndDay ? [] : (_isSameDay ? (_isSameHour ? minsArr.slice(0, indexStartMin + 1) : (isAfterHour ? [] : allHours)) : Array.from({ length: 11 }, (_, i) => (i + 1) * 5)),
      nzDisabledSeconds: () => [] as number[]
    }
  }

  disabledPrevDay = (currentDate: Date) => this.isDaily ? (differenceInCalendarDays(currentDate, new Date()) <= -this.dateDeduction || isAfter(currentDate, new Date()) ||  isToday(currentDate)) : differenceInCalendarDays(currentDate, new Date()) > -1;

  disabledPrevMonth = (currentDate: Date) => {

    const date = new Date();
    // const date = set(new Date('2026-01-27'), {hours: 0, minutes: 0, seconds: 0});
    const _currentDate = set(currentDate, {date: 1, hours: 0, minutes: 0, seconds: 0});

    const prevMonthInterval = {
      start: set(subMonths(date, 2), { date: 27, hours: 0, minutes: 0, seconds: 0 }),
      end: set(subMonths(date, 1), { date: 28, hours: 23, minutes: 59, seconds: 59 })
    };

    const currentMonthInterval = {
      start: set(subMonths(date, 1), { date: 27, hours: 0, minutes: 0, seconds: 0 }),
      end: set(date, { date: 28, hours: 23, minutes: 59, seconds: 59 })
    };

    const nextMonthInterval = {
      start: set(date, { date: 27, hours: 0, minutes: 0, seconds: 0 }),
      end: set(addMonths(date, 1), { date: 28, hours: 23, minutes: 59, seconds: 59 })
    };

    const dateIsWithinNextMonthInterval = isWithinInterval(date, nextMonthInterval);
    const dateIsWithinPrevMonthInterval = isWithinInterval(date, prevMonthInterval);
    const dateIsWithinCurrentMonthInterval = isWithinInterval(date, currentMonthInterval);

    console.log({ date, prevMonthInterval, currentMonthInterval, nextMonthInterval, dateIsWithinNextMonthInterval, dateIsWithinPrevMonthInterval, dateIsWithinCurrentMonthInterval})

    const getValidMonth = () => {
      return [
        ...dateIsWithinPrevMonthInterval ? [prevMonthInterval] : [],
        ...dateIsWithinCurrentMonthInterval ? [currentMonthInterval] : [],
        ...dateIsWithinNextMonthInterval ? [nextMonthInterval] : []
      ]
    };


    if (this.isMspUser) {
      return !getValidMonth().some(interval => isWithinInterval(_currentDate, interval));
    }

    return differenceInCalendarMonths(currentDate, date) > 0;
  };

  disabledMonthlyInterval = (currentDate: Date) => this.intervalFrom?.value && this.intervalTo?.value && !isWithinInterval(currentDate, { start: this.intervalFrom?.value, end: this.maxInterval() as Date });
  disabledDailyInterval = (currentDate: Date) => !isSameDay(this.tradingDay?.value, currentDate) && !isSameDay(addDays(this.tradingDay?.value, 1), currentDate);
  disabledInterval = (currentDate: Date) => this.isMonthly ? this.disabledMonthlyInterval(currentDate) : this.disabledDailyInterval(currentDate);

  get category(): AbstractControl | null { return this.form.get('category'); }
  get tradingDay(): AbstractControl | null { return this.form.get('tradingDay'); }
  get tradingMonth(): AbstractControl | null { return this.form.get('tradingMonth'); }
  // get interval(): AbstractControl | null { return this.form.get('interval'); }
  get intervalFrom(): AbstractControl | null { return this.form.get('intervalFrom'); }
  get intervalTo(): AbstractControl | null { return this.form.get('intervalTo'); }
  get mspShortName(): AbstractControl | null { return this.form.get('mspShortName'); }

  get isDaily(): boolean { return this.category?.value === MQ_UPLOAD_CATEGORY.DAILY; }
  get isCorrectedDaily(): boolean { return this.category?.value === MQ_UPLOAD_CATEGORY.CORRECTED_DAILY; }
  get isMonthly(): boolean { return this.category?.value === MQ_UPLOAD_CATEGORY.MONTHLY; }
  get isCorrectedMonthly(): boolean { return this.category?.value === MQ_UPLOAD_CATEGORY.CORRECTED_MONTHLY; }

  get acceptedFile(): string { return '.mdef, .mde, .mdf, .csv, .MDE, .MDF'; }
  get isMspUser(): boolean { return this.currentUser?.principal?.department === 'MSP' || this.regCategory === 'MSP'; }

}
