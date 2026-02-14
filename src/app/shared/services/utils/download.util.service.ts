import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver';


@Injectable({
  providedIn: 'root'
})
/* eslint-disable @typescript-eslint/no-explicit-any */
export class DownloadUtilService {

  handleDownloadedFile(response: any, name = ''): void {
    const blob = response.body as Blob;
    let filename: string = name;

    const contentDisposition = response?.headers?.get('Content-Disposition');
    if (contentDisposition) {
      const match = /filename="?([^"]+)"?/.exec(contentDisposition);
      if (match?.[1]) {
        filename = match[1];
      }
    }

    saveAs(blob, filename!);
  }

}
