import { inject, Injectable } from '@angular/core';
import { AmsComponent } from '@modules/settlement/shared/ams/ams.component';
import { SendNotificationComponent } from '@shared/components/send-notification/send-notification.component';
import { LABELS } from '@shared/constants/labels.const';
import { PublishSettlement } from '@shared/interfaces';
import { NzModalService } from 'ng-zorro-antd/modal';
import { SettlementService } from '../api';
import { ConfirmWithDescComponent } from '@shared/components/confirm-with-desc/confirm-with-desc.component';
import { ToastrService } from 'ngx-toastr';


@Injectable({
  providedIn: 'root'
})
/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class StlUtilitiesService {

  private readonly modal = inject(NzModalService);
  private readonly stlService = inject(SettlementService);
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

  sendNotification(rowData: any, callback: () => void): void {
    const dueDateTable = [
      { dueDate: new Date(), status: 'PUBLISHED' }
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

    modal.afterClose.subscribe(_reload => {
      if (_reload) {
        callback();
      }
    })
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
