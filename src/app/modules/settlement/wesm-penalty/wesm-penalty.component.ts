import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PaginatedTableComponent } from '@shared/components/paginated-table/paginated-table.component';
import { WESM_PENALTY_STATUS, WESM_PENALTY_TYPE } from '@shared/constants';
import { LABELS } from '@shared/constants/labels.const';
import { meterProcessBillingPeriod, TPL_TABLE_COLUMN } from '@shared/interfaces';
import { MeterprocessService } from '@shared/services/api';
import { NzSelectOptionInterface } from 'ng-zorro-antd/select';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-wesm-penalty',
  standalone: false,
  templateUrl: './wesm-penalty.component.html'
})
export class WesmPenaltyComponent implements OnInit {

  @ViewChild('paginatedTable') paginatedTable!: PaginatedTableComponent<any>;

  private readonly formBuilder = inject(FormBuilder);
  private readonly meteringService = inject(MeterprocessService);

  LABELS = LABELS;
  tableColumns: TPL_TABLE_COLUMN[];
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
    // tableColumns[LABELS.BILLING_PERIOD_TRADING_DATE].template = this.bpTpl;
    // expandedTableCols[LABELS.FILE].template = this.fileTpl;
    // expandedTableCols[LABELS.STATUS].template = this.tagTpl;
    // tableColumns[LABELS.STATUS].template = this.tagTpl;

    this.tableColumns = Object.values(tableColumns);
    this.expandedTableCols = Object.values(expandedTableCols);
  }

  getUrl(): Observable<any> {
    return of();
  }

  getBillingPeriods(): void {
    this.meteringService.getBillingPeriod()
      .subscribe({
        next: options => {
          this.billingPeriods = options as meterProcessBillingPeriod[];
          this.billingPeriodOpts = (options as meterProcessBillingPeriod[])
            .map(bp => ({ label: bp.supplyMonth, value: bp.billingPeriod }));
        }
      })
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
  [LABELS.BILLING_PERIOD_TRADING_DATE]: { label: LABELS.BILLING_PERIOD_TRADING_DATE, propName: 'parameters', width: '150px', type: 'template' },
  [LABELS.WORKSPACE_ID]: { label: LABELS.WORKSPACE_ID, propName: 'parameters', secondPropName: 'processType', width: '150PX' },
  [LABELS.BILLING_ID]: { label: LABELS.BILLING_ID, propName: 'lastModifiedDatetime', width: '100px', align: 'center', type: 'date' },
  [LABELS.TYPE]: { label: LABELS.TYPE, propName: 'lastModifiedBy', width: '140px', align: 'center' },
  [LABELS.PENALTY_AMOUNT]: { label: LABELS.PENALTY_AMOUNT, propName: 'status', width: '100px', align: 'center', type: 'template' },
  [LABELS.STATUS]: { label: LABELS.STATUS, propName: 'status', width: '100px', align: 'center', type: 'template' },
}

const expandedTableCols: Record<string, TPL_TABLE_COLUMN> = {
  [LABELS.DOCUMENT_NUMBER]: { label: LABELS.DOCUMENT_NUMBER, propName: 'description', width: '180px' },
  [LABELS.DATE]: { label: LABELS.DATE, propName: 'runStart', type: 'date', width: '140px', align: 'center' },
  [LABELS.RESOURCE_ID]: { label: LABELS.RESOURCE_ID, propName: 'runEnd', type: 'date', width: '140px', align: 'center' },
  [LABELS.PENALTY_OR_REFUND]: { label: LABELS.PENALTY_OR_REFUND, propName: 'fileName', width: '250px', type: 'template' },
}
