import { HttpEventType } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AmsComponent } from '@modules/settlement/shared/ams/ams.component';
import { ConfirmWithDescComponent } from '@shared/components/confirm-with-desc/confirm-with-desc.component';
import { SendNotificationComponent } from '@shared/components/send-notification/send-notification.component';
import { LABELS } from '@shared/constants/labels.const';
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
      default:
        return '';
    }
  }

  generateSkipLogs(action: string, rowData: settlementPipeline): void {
    const payload = {
      workspaceId: rowData.id,
      calcType: this.getCalcTypes(action.split('-')[0]),
      tradingDate: rowData?.tradingDate ?? null,
      pipelineName: action,
      parameters: {
        processType: rowData.processType,
        billingStartDate: rowData.billingStartDate,
        billingEndDate: rowData.billingEndDate,
      },
      billingMonth: rowData.billingEndDate ? format(new Date(rowData.billingEndDate), 'yyyy-MM') : null,
    };

    this.stlService.generateSkipLogs(payload)
      .pipe(filter(res => res.type === HttpEventType.Response))
      .subscribe(res => {
        this.downloadService.handleDownloadedFile(res);
      });
  }

  downloadSkipLogs(rowData: settlementPipeline): void {
    const pipeline = rowData.pipelines.find(p => p.name === 'energyTradingAmounts-generateSkipLogs' || p.name === 'reserveTradingAmounts-generateSkipLogs' && p.status === 'Completed');
    const pipelineRun = pipeline?.pipelineRuns[0];

    this.stlService.downloadSkipLogs(pipelineRun?.workspaceId ?? 0, pipelineRun?.fileName ?? '')
      .pipe(filter(res => res.type === HttpEventType.Response))
      .subscribe(res => {
        this.downloadService.handleDownloadedFile(res);
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
