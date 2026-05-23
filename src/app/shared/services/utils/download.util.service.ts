import { HttpEvent, HttpEventType } from '@angular/common/http';
import { inject, Injectable, TemplateRef } from '@angular/core';
import { HttpResponseProgress } from '@shared/interfaces';
import { saveAs } from 'file-saver';
import { NzNotificationDataOptions, NzNotificationService } from 'ng-zorro-antd/notification';
import { ToastrService } from 'ngx-toastr';


@Injectable({
  providedIn: 'root'
})
/* eslint-disable @typescript-eslint/no-explicit-any */
export class DownloadUtilService {
  private readonly ns = inject(NzNotificationService);
  private readonly toast = inject(ToastrService);

  public downloadingReports = new Set<number | string>();

  formatFileSize(bytes: number): string {
    if (bytes === 0) {
      return '0 Bytes';
    }

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  handleProgress(response: HttpResponseProgress, pipeline: any, downloadTpl: TemplateRef<void>): void {
    const currentDownloaded = response.loaded ?? 0;
    const currentTotal = response.total ? this.formatFileSize(response.total) : 0;
    const currentSize = this.formatFileSize(currentDownloaded);

    pipeline.currentDownloadedFile = currentDownloaded ? `${currentSize} / ${currentTotal}` : null;
    pipeline.currentDownloadedPercentage = response.total && +((response.loaded / response.total) * 100).toFixed(0);

    const config: NzNotificationDataOptions = {
      nzPlacement: 'bottomRight',
      nzDuration: 0,
      nzKey: pipeline.id.toString(),
      nzCloseIcon: '',
      nzClass: 'notif-progress',
      nzData: {
        size: pipeline.currentDownloadedFile,
        percentage: pipeline.currentDownloadedPercentage,
        id: pipeline.id
      },
      nzStyle: {
        padding: '0px'
      }
    };

    this.ns.blank('', downloadTpl, config);
  }

  handleDownloadedFile(response: any, name = ''): string {
    const blob = response.body as Blob;
    let filename: string = name;

    const contentDisposition = response?.headers?.get('Content-Disposition');
    if (contentDisposition) {
      const match = /filename="?([^"]+)"?/.exec(contentDisposition);
      if (match?.[1]) {
        filename = match[1];
      }
    } else {
      const contentType = response?.headers?.get('Content-Type');
      if (contentType) {
        let extension = '';
        if (contentType === 'application/pdf') {
          extension = 'pdf';
        } else if (contentType === 'application/zip' || contentType === 'application/x-zip-compressed') {
          extension = 'zip';
        }

        if (extension) {
          const currentExtension = filename.split('.').pop()?.toLowerCase();
          const validExtensions = ['zip', 'pdf', 'csv', 'xlsx'];
          const hasValidExtension = filename.includes('.') && currentExtension && validExtensions.includes(currentExtension);

          if (!hasValidExtension) {
            filename = `${filename}.${extension}`;
          } else if (currentExtension !== extension) {
            const baseName = filename.substring(0, filename.lastIndexOf('.'));
            filename = `${baseName}.${extension}`;
          }
        }
      }
    }

    saveAs(blob, filename!);
    return filename;
  }

  handleDownloadReport(response: any, pipeline: any, fileName: string, successMessage?: string): void {
    this.ns.remove(pipeline.id.toString());
    pipeline.currentDownloadedFile = null;
    pipeline.currentDownloadedPercentage = null;

    const actualFileName = this.handleDownloadedFile(response, fileName);
    this.downloadingReports.delete(pipeline.id);

    if (successMessage) {
      const extension = actualFileName.split('.').pop()?.toLowerCase();
      let typeSuffix = '';
      if (extension === 'pdf') {
        typeSuffix = ' (PDF)';
      } else if (extension === 'zip') {
        typeSuffix = ' (ZIP)';
      }

      const messageToDisplay = successMessage.toLowerCase().includes(extension || '')
        ? successMessage
        : `${successMessage}${typeSuffix}`;

      this.toast.success(messageToDisplay);
    }
  }

  processDownloadEvent(event: HttpEvent<any>, pipeline: any, downloadTpl: TemplateRef<void>, defaultFileName: string, successMessage?: string): void {
    if (event.type === HttpEventType.DownloadProgress) {
      this.handleProgress(event, pipeline, downloadTpl);
    } else if (event.type === HttpEventType.Response) {
      this.handleDownloadReport(event, pipeline, defaultFileName, successMessage);
    }
  }

  clearProgress(pipelineId: number | string): void {
    this.ns.remove(pipelineId.toString());
    this.downloadingReports.delete(pipelineId);
  }

  isDownloading(id: number | string): boolean {
    return this.downloadingReports.has(id);
  }

  addDownloading(id: number | string): void {
    this.downloadingReports.add(id);
  }

}
