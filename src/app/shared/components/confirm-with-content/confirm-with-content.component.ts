import { Component, inject, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { LABELS } from '@shared/constants/labels.const';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-confirm-with-content',
  standalone: false,
  templateUrl: './confirm-with-content.component.html',
  styleUrl: './confirm-with-content.component.scss'
})
export class ConfirmWithContentComponent implements OnInit {

  @ViewChild('tpl', { read: ViewContainerRef }) tpl!: ViewContainerRef;
  nzDataRef = inject(NZ_MODAL_DATA);
  LABELS = LABELS;

  templateContent: any;

  readonly data = inject(NZ_MODAL_DATA);
  readonly modalRef = inject(NzModalRef);

  ngOnInit(): void {
    this.templateContent = this.nzDataRef.template;
  }

  onBtnClick(): void {
    this.modalRef.triggerOk();
  }

  onBtnClose(): void {
    this.modalRef.triggerCancel();
  }

}