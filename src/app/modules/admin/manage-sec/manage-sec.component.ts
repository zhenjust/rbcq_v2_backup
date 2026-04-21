import { Component, DestroyRef, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PaginatedTableComponent } from '@shared/components/paginated-table/paginated-table.component';
import { FUEL_TYPE } from '@shared/constants/fuel-type.const';
import { LABELS } from '@shared/constants/labels.const';
import { TPL_TABLE_COLUMN, TableDataResult, TableAction, SecParameters } from '@shared/interfaces';
import { AdminService, SecParamsService } from '@shared/services/api';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, Observable, of } from 'rxjs';
import { CreateSecParamComponent } from './create-sec-param/create-sec-param.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MESSAGES } from '@shared/constants/messages.const';
import { NzSelectOptionInterface } from 'ng-zorro-antd/select';
import { NgxPermissionsService } from 'ngx-permissions';
import { PHASE_ONE_AUTHORITIES } from '@shared/constants';

@Component({
  selector: 'app-manage-sec',
  standalone: false,
  templateUrl: './manage-sec.component.html',
})
export class ManageSecComponent implements OnInit {

  @ViewChild('paginatedTable', { static: false }) paginatedTable: PaginatedTableComponent<any>;
  @ViewChild('tagTpl', { static: true }) tagTpl: TemplateRef<HTMLElement>;
  @ViewChild('fuelTypeTpl', { static: true }) fuelTypeTpl: TemplateRef<HTMLElement>;

  private readonly secService = inject(SecParamsService);
  private readonly modalService = inject(NzModalService);
  private readonly toastrService = inject(ToastrService);
  private readonly adminService = inject(AdminService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly permissionsService = inject(NgxPermissionsService);
  private readonly destroyRef$ = inject(DestroyRef);

  tableColumns: TPL_TABLE_COLUMN[];
  LABELS = LABELS;
  FUEL_TYPE = FUEL_TYPE;
  form: FormGroup;
  paramForm: FormGroup;
  // fuelTypeOpts: Record<string, string>;
  fuelTypeOpts: NzSelectOptionInterface[] = [];
  fuelTypeRecords: Record<string, string>;
  hasManagePerm: boolean;

  ngOnInit(): void {
    this.getFuelTypes();

    tableColumns[LABELS.STATUS].template = this.tagTpl;
    tableColumns[LABELS.FUEL_TYPE].template = this.fuelTypeTpl;

    this.tableColumns = Object.values(tableColumns);
    this.buildForm();

    this.permissionsService.hasPermission([ PHASE_ONE_AUTHORITIES.MANAGE_SEC ])
      .then(hasPerm => this.hasManagePerm = hasPerm );
  }

  buildForm(): void {
    this.form = this.formBuilder.group({
      fuelType: [null]
    });

    this.form.valueChanges
      .pipe(debounceTime(500))
      .subscribe(() => this.paginatedTable?.search());
  }

  getFuelTypes(): void {
    this.adminService.getReferences('FACILITY_GENERATOR_TYPE')
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe(res => {
        this.fuelTypeOpts = res.data.map(d => ({ label: d.desc, value: d.code }));
        this.fuelTypeRecords = res.data.reduce((acc, d) => {
          acc[d.code] = d.label;
          return acc;
        }, {} as Record<string, string>);
      });
  }

  add(item?: any): void {
    const modal = this.modalService.create({
      nzTitle: `${item ? LABELS.UPDATE : LABELS.ADD} ${LABELS.SEC_PARAMETER}`,
      nzCentered: true,
      nzContent: CreateSecParamComponent,
      nzFooter: null,
      nzData: { item }
    });

    modal.afterClose.subscribe(res => {
      if (res) {
        this.paginatedTable.search()
      }
    });
  }

  listUrl(): Observable<TableDataResult<SecParameters[]> | null> {
    if (!this.paginatedTable) {
      return of();
    }

    if (!this.paginatedTable?.tableParams?.sort) {
      this.paginatedTable.tableParams.sort = {
        dir: 'desc',
        prop: 'effectiveStartDate'
      }
    }

    const formValues = this.form?.getRawValue();

    return this.secService.listSecParameters(formValues, this.paginatedTable?.tableParams);
  }

  delete(id: number): void {
    console.log({id});

    this.modalService.confirm({
      nzTitle: `${LABELS.DELETE} ${LABELS.SEC_PARAMETER}`,
      nzContent: MESSAGES.CONFIRM_DELETE_ITEM(LABELS.SEC_PARAMETER),
      nzCentered: true,
      nzOnOk: () => {
        this.secService.deleteSecParams(id)
          .pipe(takeUntilDestroyed(this.destroyRef$))
          .subscribe(() => {
            this.toastrService.success(MESSAGES.SUCCESS_DELETE_ITEM(LABELS.SEC_PARAMETER));
            this.paginatedTable.search()
          });
      }
    })
  }

  get actionControls(): TableAction<any>[] {
    return [
      { label: LABELS.UPDATE, value: 'update', click: (rowData: any) => this.add(rowData)},
      { label: LABELS.DELETE, value: 'delete', hidden: (rowData: any) => rowData.active, click: (rowData: any) => this.delete(rowData.groupId), danger: true},
    ];
  }

}

const tableColumns: Record<string, TPL_TABLE_COLUMN> = {
  [LABELS.FUEL_TYPE]: { label: LABELS.FUEL_TYPE, propName: 'fuelType', width: '150px', type: 'template' },
  [LABELS.EFFECTIVE_START_DATE]: { label: LABELS.EFFECTIVE_START_DATE, propName: 'effectiveStartDate', type: 'date',  width: '150PX', sort: true },
  [LABELS.EFFECTIVE_END_DATE]: { label: LABELS.EFFECTIVE_END_DATE, propName: 'effectiveEndDate', width: '150px', type: 'date', sort: true },
  [LABELS.STATUS]: { label: LABELS.STATUS, propName: 'active', width: '100px', align: 'center', type: 'template', sort: true },
}

