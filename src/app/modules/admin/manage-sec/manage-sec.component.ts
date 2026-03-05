import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PaginatedTableComponent } from '@shared/components/paginated-table/paginated-table.component';
import { FUEL_TYPE } from '@shared/constants/fuel-type.const';
import { LABELS } from '@shared/constants/labels.const';
import { TPL_TABLE_COLUMN, TableDataResult, TableAction, SecParameters } from '@shared/interfaces';
import { SecParamsService } from '@shared/services/api';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, Observable, of } from 'rxjs';
import { CreateSecParamComponent } from './create-sec-param/create-sec-param.component';

@Component({
  selector: 'app-manage-sec',
  standalone: false,
  templateUrl: './manage-sec.component.html',
})
export class ManageSecComponent implements OnInit {

  @ViewChild('paginatedTable', { static: false }) paginatedTable: PaginatedTableComponent<any>;

  private readonly secService = inject(SecParamsService);
  private readonly modalService = inject(NzModalService);
  private readonly toastrService = inject(ToastrService);
  private readonly formBuilder = inject(FormBuilder);

  tableColumns: TPL_TABLE_COLUMN[];
  LABELS = LABELS;
  FUEL_TYPE = FUEL_TYPE;
  form: FormGroup;
  paramForm: FormGroup;

  ngOnInit(): void {
    this.tableColumns = Object.values(tableColumns);
    this.buildForm();
  }

  buildForm(): void {
    this.form = this.formBuilder.group({
      fuelType: [null]
    });

    this.form.valueChanges
      .pipe(debounceTime(500))
      .subscribe(() => this.paginatedTable?.search());
  }

  add(): void {
    const modal = this.modalService.create({
      nzTitle: `${LABELS.ADD} ${LABELS.FUEL_TYPE}`,
      nzCentered: true,
      nzContent: CreateSecParamComponent,
      nzFooter: null
    });

    modal.afterClose.subscribe(() => this.paginatedTable.search());
  }

  listUrl(): Observable<TableDataResult<SecParameters[]> | null> {
    if (!this.paginatedTable) {
      return of();
    }
    const formValues = this.form.getRawValue();

    return this.secService.listSecParameters(formValues, this.paginatedTable?.tableParams);
  }


  get actionControls(): TableAction<any>[] {
    return [
      // { label: LABELS.DELETE, value: 'generate', click: (rowData: any) => this.delete(rowData), danger: true},
    ];
  }

}

const tableColumns: Record<string, TPL_TABLE_COLUMN> = {
  [LABELS.FUEL_TYPE]: { label: LABELS.FUEL_TYPE, propName: 'parameters', width: '150px', type: 'template' },
  [LABELS.EFFECTIVE_START_DATE]: { label: LABELS.EFFECTIVE_START_DATE, propName: 'parameters', secondPropName: 'processType',  width: '150PX' },
  [LABELS.EFFECTIVE_END_DATE]: { label: LABELS.EFFECTIVE_END_DATE, propName: 'lastModifiedDatetime', width: '100px', align: 'center', type: 'date' },
  [LABELS.STATUS]: { label: LABELS.STATUS, propName: 'status', width: '100px', align: 'center', type: 'template' },
}

