import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { LABELS } from '@shared/constants/labels.const';
import { meterProcessPipeline, TPL_TABLE_COLUMN } from '@shared/interfaces';
import { MeterprocessService } from '@shared/services/api';
import { NZ_MODAL_DATA, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { Subscription } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TemplateTableComponent } from '@shared/components/template-table/template-table.component';
import { NzMessageService } from 'ng-zorro-antd/message';
import { MESSAGES } from '@shared/constants/messages.const';
import { MeterDataPipelineName } from '@shared/constants';
import { MeterProcessTypes } from '@shared/enums';
import { NzNotificationService } from 'ng-zorro-antd/notification';
@Component({
  selector: 'app-consolidate',
  standalone: false,
  templateUrl: './consolidate.component.html',
})
export class ConsolidateComponent implements OnInit {

  @ViewChild('tradingDateTpl', { static: true }) tradingDateTpl!: TemplateRef<HTMLElement>;
  @ViewChild('mtnTpl', { static: true }) mtnTpl!: TemplateRef<HTMLElement>;
  @ViewChild('statusTpl', { static: true }) statusTpl!: TemplateRef<HTMLElement>;
  @ViewChild('processTypeTpl', { static: true }) processTypeTpl!: TemplateRef<HTMLElement>;
  @ViewChild('rerunTable', { static: true }) rerunTable!: TemplateTableComponent;

  // Dependency Injections
  readonly mpService = inject(MeterprocessService);
  readonly data = inject(NZ_MODAL_DATA);
  readonly modalRef = inject(NzModalRef);
  readonly untilDestroy$ = takeUntilDestroyed();
  readonly nzms = inject(NzMessageService);
  readonly notif = inject(NzNotificationService);
  readonly modal = inject(NzModalService);

  LABELS = LABELS;
  baseTableColumns!: TPL_TABLE_COLUMN[];
  busy$!: Subscription;
  modalBusy$!: Subscription;
  rerunList: meterProcessPipeline[] = [];
  showAlert = false;

  ngOnInit(): void {
    this.setTable();
    this.getReruns();
  }

  // Sets the templates for tables with custom formatting
  setTable(): void {
    baseTableColumns[LABELS.DATE_TIME_RANGE].template = this.tradingDateTpl;
    baseTableColumns[LABELS.MTN].template = this.mtnTpl;
    baseTableColumns[LABELS.STATUS].template = this.statusTpl;
    baseTableColumns[LABELS.PROCESS_TYPE].template = this.processTypeTpl;

    this.baseTableColumns = Object.values(baseTableColumns);
  }

  getReruns(): void {
    this.busy$ = this.mpService.getRerunList(this.workspaceId)
      .pipe(this.untilDestroy$)
      .subscribe(reruns => {
        this.rerunList = reruns as meterProcessPipeline[];
      });
  }

  // Checks if a table row's checkbox should be disabled
  disableCheck = (row: meterProcessPipeline): boolean => {
    const selectedItemsArr = Array.from(this.rerunTable.selectedItems.values());
    const selectedId = selectedItemsArr?.length && selectedItemsArr[0];
    const selectedItem = this.rerunTable?.tableData.find(td => td.id === selectedId);

    if (selectedItemsArr.length) {
      if (this.baseData[0]?.parameters.processType === MeterProcessTypes.ADJUSTMENT) {
        return row.parameters.adjNo !== selectedItem?.parameters.adjNo;
      } else {
        return row.status !== selectedItem?.status;
      }
    }

    return false;
  };

  confirmConsolidate(): void {
    const reRunWorkspaceId = Array.from(this.rerunTable.selectedItems.values());
    this.showAlert = !this.data.isRerunOptional && !reRunWorkspaceId?.length;

    if (this.showAlert) {
      return;
    }

    this.modal.confirm({
      nzTitle: LABELS.CONFIRMATION,
      nzContent: MESSAGES.CONFIRM_CONSOLIDATE_ITEMS('items'),
      nzCentered: true,
      nzOnOk: () => this.consolidate(reRunWorkspaceId)
    });
  }

  consolidate(reRunWorkspaceId?: number[]): void {
    const params = {
      reRunId: reRunWorkspaceId?.join(',')
    };

    this.modalBusy$ = this.mpService.runJob(params, MeterDataPipelineName.CONSOLIDATE, this.workspaceId)
      .pipe(this.untilDestroy$)
      .subscribe(() => {
        this.notif.success(LABELS.SUCCESS, MESSAGES.SUCCESS_CONSOLIDATE_ITEM('items'));
        this.modalRef.destroy();
      });
  }

  get baseData(): meterProcessPipeline[] { return this.data?.baseTableData; }
  get workspaceId(): number { return this.baseData[0]?.id; }
  get requiredRerunMsg(): string { return MESSAGES.ITEMS_REQUIRED(LABELS.RERUNS); }

}

// Table Columns for Base and Reruns
const baseTableColumns: Record<string, TPL_TABLE_COLUMN> = {
  [LABELS.WORKSPACE_ID]: { label: LABELS.WORKSPACE_ID, propName: 'id' },
  [LABELS.RUN_DATE_AND_TIME]: { label: LABELS.RUN_DATE_AND_TIME, propName: 'lastModifiedDatetime', type: 'date', width: '200px' },
  [LABELS.PROCESS_TYPE]: { label: LABELS.PROCESS_TYPE, propName: 'parameters', secondPropName: 'processType', width: '130px', type: 'template' },
  [LABELS.DATE_TIME_RANGE]: { label: LABELS.DATE_TIME_RANGE, propName: 'id', type: 'template', width: '320px' },
  [LABELS.MTN]: { label: LABELS.MTN, propName: 'parameters', secondPropName: 'mtn', type: 'template' },
  [LABELS.STATUS]: { label: LABELS.STATUS, propName: 'status', width: '120px', type: 'template' }
}
