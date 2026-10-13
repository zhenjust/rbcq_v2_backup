import { Component, input, TemplateRef, ViewChild } from '@angular/core';
import { LABELS } from '@shared/constants/labels.const';

@Component({
  selector: 'app-download-progress',
  standalone: false,
  templateUrl: './download-progress.component.html',
})
export class DownloadProgressComponent {
  @ViewChild('downloadTpl', { static: true }) downloadTpl!: TemplateRef<void>;
  downloadMessage = input<string>(LABELS.DOWNLOADING_REPORT_FOR_WORKSPACE);
  preparingMessage = input<string>(LABELS.PREPARING_DOWNLOAD_FOR_WORKSPACE);
  labels = LABELS;
}
