import { Component, DestroyRef, inject, input, signal } from '@angular/core';

import 'froala-editor/js/plugins/link.min.js';
import 'froala-editor/js/plugins/image.min.js';
import 'froala-editor/js/plugins/colors.min.js';
import { LABELS } from '@shared/constants/labels.const';
import { PipelineRun, SendNotice, TPL_TABLE_COLUMN } from '@shared/interfaces';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { SettlementService } from '@shared/services/api';
import { SettlementModuleName } from '@shared/constants';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';
import { MESSAGES } from '@shared/constants/messages.const';
import { StlUtilitiesService } from '@shared/services/utils';

@Component({
  selector: 'app-send-notification',
  standalone: false,
  templateUrl: './send-notification.component.html',
  styleUrl: './send-notification.component.scss'
})
export class SendNotificationComponent{

  private readonly modalData = inject(NZ_MODAL_DATA);
  private readonly settlementService = inject(SettlementService);
  private readonly toastrService = inject(ToastrService);
  private readonly destroyRef$ = inject(DestroyRef);
  private readonly stlUtil = inject(StlUtilitiesService);

  private readonly modalRef = inject(NzModalRef);

  defaultValue = input<string>();
  tableData = signal<{ dueDate: string, status: string}[]>([]);
  rowData = signal<any>(null);
  showError = signal<boolean>(false);

  columns: TPL_TABLE_COLUMN[] = [];
  froalaOptions = froalaOptions;
  LABELS = LABELS;
  MESSAGES = MESSAGES;

  notificationMessage: string;

  constructor() {
    this.columns = Object.values(expandedTableCols);
    this.tableData.set(this.modalData?.dueDateTable);
    this.rowData.set(this.modalData?.rowData);
    this.getStatus();

    this.modalRef.updateConfig({
      nzOnOk: (): boolean | void => {
        if (!this.notificationMessage) {
          this.showError.set(true);
          return false;
        }

        this.sendNotice();
        return false;
      }
    });
  }

  getStatus(): void {
    this.settlementService.sendNoticeStatus(this.rowData()?.workspaceId || this.rowData()?.id)
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe(response => {
        console.log(response.status)
        this.modalData.dueDateTable[0].status = response?.status ?? '';
        this.tableData.set(this.modalData?.dueDateTable);
        console.log(this.tableData())
      });
  }

  sendNotice(): void {
    this.showError.set(false);

    const findParams = this.rowData().pipelines
      .find((pipeline: PipelineRun) => pipeline.name.includes('finalize') && ['Completed', 'Succeeded'].includes(pipeline.status));

    const payload: SendNotice = {
      notificationMessage: this.notificationMessage,
      type: SettlementModuleName[this.rowData()?.name],
      parameters: {
        workspaceId: this.rowData().workspaceId || this.rowData().id,
        processType: this.rowData().processType,
        billingPeriodName: this.rowData()?.billingPeriod || findParams?.parameters?.billingPeriodName || null,
        billingStartDate: this.rowData()?.billingStartDate || findParams?.parameters?.billingStartDate,
        billingEndDate: this.rowData()?.billingEndDate || findParams?.parameters?.billingEndDate
      }
    }

    this.settlementService.sendNotice(payload)
      .subscribe(() => {
        this.toastrService.success(MESSAGES.SUCCESS_SEND_NOTICE);
        this.modalRef.close(true);
      });
  }

}

const expandedTableCols: Record<string, TPL_TABLE_COLUMN> = {
  [LABELS.DUE_DATE]: { label: LABELS.DUE_DATE, propName: 'dueDate', type: 'date' },
  [LABELS.STATUS]: { label: LABELS.STATUS, propName: 'status' },
}

const froalaOptions = {
  toolbarButtons: [ 'bold', 'italic', 'underline', 'strikeThrough', '|', 'insertLink', 'insertImage', 'textColor', 'backgroundColor', '|', 'undo', 'redo' ],
  pluginsEnabled: ['link', 'image', 'colors'],
  colorsHEXTemplate: true,
  colorsBackground: true,
};
