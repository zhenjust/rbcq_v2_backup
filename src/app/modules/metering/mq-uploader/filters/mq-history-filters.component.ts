import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { MQ_UPLOAD_CATEGORY, MQ_UPLOADER_STATUS } from '@shared/constants';
import { LABELS } from '@shared/constants/labels.const';
import { MqUploadFilters } from '@shared/interfaces';
import { SystemUtilService } from '@shared/services/utils';
import { format } from 'date-fns';
import { NzSelectOptionInterface } from 'ng-zorro-antd/select';
import { distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-mq-history-filters',
  standalone: false,
  templateUrl: './mq-history-filters.component.html',
})
export class MqHistoryFiltersComponent implements OnInit {

  @Output() emitFiltersEvent = new EventEmitter<MqUploadFilters>();

  private readonly fb = inject(FormBuilder);
  private readonly sysUtil = inject(SystemUtilService);

  LABELS = LABELS;
  form: FormGroup;
  categoryOpts: NzSelectOptionInterface[];
  statusOpts: NzSelectOptionInterface[];

  ngOnInit(): void {
    this.buildForm();
    this.getReferences();
    this.emitSearchFilters();
  }

  buildForm(): void {
    const required = RxwebValidators.required();

    this.form = this.fb.group({
      category: [null],
      tradingDay: [new Date(), required],
      status: [null]
    });

    this.handleCategoryChange();
  }

  handleCategoryChange(): void {
    this.category?.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(() => {
        this.tradingDay?.reset();
      });
  }

  getReferences(): void {
    this.categoryOpts = this.sysUtil.nzOptionsFormatter(MQ_UPLOAD_CATEGORY, true);
    this.statusOpts = this.sysUtil.nzOptionsFormatter(MQ_UPLOADER_STATUS, false);
  }

  emitSearchFilters(): void {
    const formValue = this.form.getRawValue();

    const payload = {
      ...formValue,
      tradingDate: (formValue?.tradingDay && format(formValue?.tradingDay, 'yyyy-MM-dd')) || null,
    }

    delete payload.tradingDay;
    console.debug({payload})
    this.emitFiltersEvent.emit(payload);
  }

  clearFilters(): void {
    this.form.reset();
  }

  get category(): AbstractControl | null { return this.form.get('category'); }
  get tradingDay(): AbstractControl | null { return this.form.get('tradingDay'); }

}
