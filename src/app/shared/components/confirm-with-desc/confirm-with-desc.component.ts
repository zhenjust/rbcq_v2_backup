import { Component, inject } from '@angular/core';
import { LABELS } from '@shared/constants/labels.const';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-confirm-with-desc',
  standalone: false,
  templateUrl: './confirm-with-desc.component.html',
  styleUrl: './confirm-with-desc.component.scss'
})
export class ConfirmWithDescComponent {

  LABELS = LABELS;

  readonly data = inject(NZ_MODAL_DATA);
  readonly modalRef = inject(NzModalRef);

  onBtnClick(): void {
    this.modalRef.triggerOk();
  }

  onBtnClose(): void {
    this.modalRef.triggerCancel();
  }

}
