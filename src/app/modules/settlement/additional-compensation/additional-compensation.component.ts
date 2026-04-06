import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PaginatedTableComponent } from '@shared/components/paginated-table/paginated-table.component';
import { WESM_PENALTY_STATUS, WESM_PENALTY_TYPE } from '@shared/constants';
import { LABELS } from '@shared/constants/labels.const';
import { meterProcessBillingPeriod, TPL_TABLE_COLUMN } from '@shared/interfaces';
import { SettlementService } from '@shared/services/api';
import { NzSelectOptionInterface } from 'ng-zorro-antd/select';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-additional-compensation',
  standalone: false,
  templateUrl: './additional-compensation.component.html',
  styleUrl: './additional-compensation.component.scss'
})
export class AdditionalCompensationComponent implements OnInit {

  @ViewChild('paginatedTable') paginatedTable!: PaginatedTableComponent<any>;
  @ViewChild('bpTpl', { static: true }) bpTpl!: TemplateRef<HTMLElement>;
  @ViewChild('rateTpl', { static: true }) rateTpl!: TemplateRef<HTMLElement>;
  @ViewChild('mtnTpl', { static: true }) mtnTpl!: TemplateRef<HTMLElement>;
  @ViewChild('billingIdTpl', { static: true }) billingIdTpl!: TemplateRef<HTMLElement>;

  private readonly formBuilder = inject(FormBuilder);
  private readonly settlementService = inject(SettlementService);

  LABELS = LABELS;
  tableColumns: TPL_TABLE_COLUMN[] = [];
  form: FormGroup;
  showForm = false;
  expandedTableCols: TPL_TABLE_COLUMN[];
  billingPeriods: meterProcessBillingPeriod[] = [];
  billingPeriodOpts: { label: any; value: any; }[] = [];
  statusOptions: NzSelectOptionInterface[] = [];
  typeOptions: NzSelectOptionInterface[] = [];


  ngOnInit(): void {
    this.statusOptions = WESM_PENALTY_STATUS.map(opt => ({ label: opt, value: opt}));
    this.typeOptions = Object.keys(WESM_PENALTY_TYPE)
      .map(key => ({ label: WESM_PENALTY_TYPE[key as keyof typeof WESM_PENALTY_TYPE], value: key}))

    this.buildForm();
    this.formatTableColumns();
    this.getBillingPeriods();
  }

  buildForm(): void {
    this.form = this.formBuilder.group({
      billingPeriod: [null],
      status: [null],
      type: [null]
    });
  }

  formatTableColumns(): void {
    tableColumns[LABELS.TRADING_DATE].template = this.bpTpl;
    expandedTableCols[LABELS.APPROVED_RATE].template = this.rateTpl;
    expandedTableCols[LABELS.MTN].template = this.mtnTpl;
    expandedTableCols[LABELS.BILLING_ID].template = this.billingIdTpl;

    // tableColumns[LABELS.STATUS].template = this.tagTpl;

    this.tableColumns = Object.values(tableColumns);
    this.expandedTableCols = Object.values(expandedTableCols);
  }

  getUrl(): Observable<any> {
    if (!this.paginatedTable) {
      return of([]);
    }

    return this.settlementService.search({}, 'additionalCompensation', this.paginatedTable?.tableParams);
  }

  getBillingPeriods(): void {
    // this.meteringService.getBillingPeriod()
    //   .subscribe({
    //     next: options => {
    //       this.billingPeriods = options as meterProcessBillingPeriod[];
    //       this.billingPeriodOpts = (options as meterProcessBillingPeriod[])
    //         .map(bp => ({ label: bp.supplyMonth, value: bp.billingPeriod }));
    //     }
    //   })
  }

  applyFilter(): void {
    // if (this.filterSettlementForm.valid) {
    //   const { processType, billingPeriod, date }: settlementParams = this.filterSettlementForm.getRawValue();

    //   const formattedValues: Partial<settlementParams> = {
    //     processType,
    //     billingPeriod: this.notDaily ? billingPeriod : undefined,
    //     tradingStartDate: this.isDaily && date?.length ? this.fdp.transformDate(date[0]) : undefined,
    //     tradingEndDate: this.isDaily && date?.length ? this.fdp.transformDate(date[1]) : undefined,
    //   };

    //   this.filtersEvent.emit(formattedValues);
    // }
  }

  resetFilters(): void {
    this.form.reset();
    this.showForm = false;
  }

}

const tableColumns: Record<string, TPL_TABLE_COLUMN> = {
  [LABELS.TRADING_DATE]: { label: LABELS.TRADING_DATE, propName: 'billingStartDate', width: '150px', type: 'template' },
  [LABELS.WORKSPACE_ID]: { label: LABELS.WORKSPACE_ID, propName: 'id', width: '100px' },
  [LABELS.PRICING_CONDITION]: { label: LABELS.PRICING_CONDITION, propName: 'lastModifiedDatetime', width: '100px', align: 'center', type: 'date' },
  [LABELS.STATUS]: { label: LABELS.STATUS, propName: 'status', width: '200px', align: 'center' },
  [LABELS.PROGRESS]: { label: LABELS.PROGRESS, propName: 'status', width: '100px', align: 'center', type: 'template' },
}

const expandedTableCols: Record<string, TPL_TABLE_COLUMN> = {
  [LABELS.NAME]: { label: LABELS.NAME, propName: 'name', width: '180px' },
  [LABELS.BILLING_ID]: { label: LABELS.BILLING_ID, propName: 'mtn', width: '150px', type: 'template' },
  [LABELS.MTN]: { label: LABELS.MTN, propName: 'mtn', width: '150px', type: 'template' },
  [LABELS.APPROVED_RATE]: { label: LABELS.APPROVED_RATE, propName: 'fileName', width: '250px', type: 'template' },
  [LABELS.STATUS]: { label: LABELS.STATUS, propName: 'status', width: '250px' },
  [LABELS.PROGRESS]: { label: LABELS.PROGRESS, propName: 'fileName', width: '250px', type: 'template' },
}
