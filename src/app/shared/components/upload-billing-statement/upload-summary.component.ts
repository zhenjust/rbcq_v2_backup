import { Component, inject } from '@angular/core';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { LABELS } from '@shared/constants/labels.const';

@Component({
  selector: 'app-upload-summary',
  standalone: false,
  templateUrl: './upload-summary.component.html',
})
export class UploadSummaryComponent {
  readonly modalData = inject(NZ_MODAL_DATA);
  readonly modalRef = inject(NzModalRef);
  LABELS = LABELS;

  get results() {
    return this.modalData.results || [];
  }
}
