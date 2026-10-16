import { HttpEventType } from '@angular/common/http';
import { DestroyRef, inject, Injectable, TemplateRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AmsComponent } from '@modules/settlement/shared/ams/ams.component';
import { ConfirmWithDescComponent } from '@shared/components/confirm-with-desc/confirm-with-desc.component';
import { SendNotificationComponent } from '@shared/components/send-notification/send-notification.component';
import { LABELS } from '@shared/constants/labels.const';
import { MESSAGES } from '@shared/constants/messages.const';
import { meterProcessPipelineGroup, PublishSettlement, settlementPipeline } from '@shared/interfaces';
import { DownloadUtilService } from '@shared/services/utils';
import { format } from 'date-fns';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ToastrService } from 'ngx-toastr';
import { filter } from 'rxjs';

import { SettlementService } from '../api';

@Injectable({
  providedIn: 'root'
})
/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class StlUtilitiesService {

  private readonly modal = inject(NzModalService);
  private readonly stlService = inject(SettlementService);
  private readonly downloadService = inject(DownloadUtilService);
  private readonly toastr = inject(ToastrService);
  private readonly destroyRef = inject(DestroyRef);

  triggerAllocModal(action: string, row: any, callback: () => void): void {
    const modal = this.modal.create({
      nzTitle: LABELS.RUN_JOB,
      nzContent: AmsComponent,
      nzCentered: true,
      nzData: { rowData: row, action, isPenaltyMarketFee: action.includes('MarketFee') || action?.includes('penalty') },
      nzFooter: [
        {
          label: LABELS.CLOSE,
          onClick: (component) => component?.triggerClose(),
          disabled: (component) => component ? (component?.busy$ && !component?.busy$?.closed) : true
        },
        {
          label: LABELS.RUN_JOB,
          type: 'primary',
          onClick: (component) => component?.submit(),
          disabled: (component) => component ? (component.form.invalid || (component?.busy$ && !component?.busy$?.closed)) : true
        }
      ],
    });

    modal.afterClose.subscribe(res => {
      if (res) {
        callback();
      }
    })
  }

  sendNotification(rowData: settlementPipeline | meterProcessPipelineGroup, callback: () => void): void {
    const findParams = rowData.pipelines
      .find((pipeline) => pipeline?.parameters?.dueDate && ['Completed', 'Succeeded'].includes(pipeline.status));

    const dueDateTable = [
      { dueDate: findParams?.parameters?.dueDate || null, status: '' }
    ];

    const modal = this.modal.create({
      nzTitle: LABELS.SEND_NOTIFICATION,
      nzContent: SendNotificationComponent,
      nzWidth: '1000px',
      nzCentered: true,
      nzOkText: LABELS.SEND_NOTICE,
      nzData: {
        dueDateTable, rowData
      }
    });

    modal.afterClose.subscribe(res => {
      if (res) {
        callback();
      }
    });
  }

  getCalcTypes(name: string): string {
    switch (name) {
      case 'energyTradingAmounts':
        return 'ETA';
      case 'reserveTradingAmounts':
        return 'RTA';
      case 'reserveMarketFee':
        return 'RMF';
      case 'energyMarketFee':
        return 'EMF';
      case 'additionalCompensation':
        return 'AC';
      default:
        return '';
    }
  }

  generateSkipLogs(action: string, rowData: settlementPipeline, billingId?: string): void {
    const payload = {
      workspaceId: rowData.id,
      calcType: this.getCalcTypes(action.split('-')[0]),
      tradingDate: rowData?.tradingDate ?? null,
      pipelineName: action,
      groupId: rowData.groupId,
      billingId: billingId ?? null,
      parameters: {
        processType: rowData.processType,
        billingStartDate: rowData.billingStartDate,
        billingEndDate: rowData.billingEndDate,
      },
      billingMonth: rowData.billingEndDate ? format(new Date(rowData.billingEndDate), 'yyyy-MM') : null,
    };

    this.stlService.generateSkipLogs(payload)
      .pipe(filter(res => res.type === HttpEventType.Response))
      .subscribe(() => {});
  }

  downloadSkipLogs(rowData: settlementPipeline, downloadTpl: TemplateRef<void>, billingId?: string): void {
    const pipeline = rowData.pipelines.find(p =>
      [
        'energyTradingAmounts-generateSkipLogs',
        'reserveTradingAmounts-generateSkipLogs',
        'additionalCompensation-generateSkipLogs',
      ].includes(p.name) &&
      ['Completed', 'Succeeded'].includes(p.status));

    const pipelineRun = pipeline?.pipelineRuns[0];
    const workspaceId = pipelineRun?.workspaceId ?? 0;
    const downloadPipeline = { id: workspaceId, groupId: rowData.groupId, billingId: billingId ?? null };

    this.downloadService.startDownload(downloadPipeline, downloadTpl);

    this.stlService.downloadSkipLogs(rowData.groupId, pipelineRun?.fileName ?? '')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.downloadService.processDownloadEvent(
            response,
            downloadPipeline,
            downloadTpl,
            pipelineRun?.fileName ?? '',
            MESSAGES.SUCCESS_DOWNLOAD_ITEM(`skip logs for ${rowData.groupId}`)
          );
        },
        error: () => {
          this.downloadService.clearProgress(workspaceId);
        }
      });
  }


  publish(payload: PublishSettlement, title: string, message: string, descriptions: any[], callback?: () => void): void {
    const nzData = {
      message,
      okAction: LABELS.PUBLISH,
      descriptions,
      onOk: () => this.stlService.publish(payload)
    };

    const modal = this.modal.create({
      nzTitle: title,
      nzContent: ConfirmWithDescComponent,
      nzCentered: true,
      nzFooter: null,
      nzData,
      nzWidth: '600px',
    });

    modal.afterClose.subscribe(res => {
      if (res) {
        this.toastr.success(res.message);
        if (callback) {
          callback();
        }
      }
    });
  }

}
