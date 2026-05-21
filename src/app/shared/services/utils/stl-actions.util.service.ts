import { inject, Injectable } from '@angular/core';
import { AmsComponent } from '@modules/settlement/shared/ams/ams.component';
import { SendNotificationComponent } from '@shared/components/send-notification/send-notification.component';
import { LABELS } from '@shared/constants/labels.const';
import { NzModalService } from 'ng-zorro-antd/modal';


@Injectable({
  providedIn: 'root'
})
/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class StlUtilitiesService {

  private readonly modal = inject(NzModalService);

  triggerAllocModal(action: string, row: any, callback: () => void): void {
    const modal = this.modal.create({
      nzTitle: LABELS.RUN_JOB,
      nzContent: AmsComponent,
      nzCentered: true,
      nzData: { rowData: row, action },
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

  sendNotification(rowData: any): void {
    console.log('Sending notification with data:', rowData);
    const dueDateTable = [
      { dueDate: new Date(), status: 'PUBLISHED' }
    ];

    this.modal.create({
      nzTitle: LABELS.SEND_NOTIFICATION,
      nzContent: SendNotificationComponent,
      nzWidth: '1000px',
      nzCentered: true,
      nzOkText: LABELS.SEND_NOTICE,
      nzData: {

      }
      // nzFooter: [
      //   {
      //     label: LABELS.CLOSE,
      //     onClick: (component) => component?.triggerClose(),
      //   }
      // ],
    });
  }


}
