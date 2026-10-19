import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadXHRArgs } from 'ng-zorro-antd/upload';
import { faUpload } from '@fortawesome/free-solid-svg-icons';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { RbcqService } from '@shared/services/api/rbcq.service';

interface AuditHistory {
  file_name: string;
  file_date: string | null;
  publish_date: string | null;
  published_by: string | null;
  remarks: string | null;
  type: string | null;
  status: string | null;
  expanded?: boolean;
}

@Component({
  selector: 'app-rbcq-uploading',
  standalone: false,
  templateUrl: './rbcq-uploading.component.html',
  styleUrl: './rbcq-uploading.component.scss'
})
export class RbcqUploadingComponent implements OnInit {

  pageTitle: string | undefined;
  selectedFile: File | null = null;
  uploadSuccess = false;
  uploadError: string | null = null;
  uploadIcon = faUpload;

  uploadHistory: AuditHistory[] = [];

  currentPage = 1;
  pageSize = 10;
  pageSizeOptions = [10, 20, 50, 100];
  totalItems = 0;
  loading = false;

  private readonly router = inject(ActivatedRoute);
  private readonly messageService = inject(NzMessageService);
  private readonly http = inject(HttpClient);
  private readonly toast = inject(ToastrService);
  private readonly rbcqService = inject(RbcqService);

  ngOnInit(): void {
    this.router.data.subscribe((data: any) => {
      this.pageTitle = data.pageTitle;
      this.getHistory();
    });
  }

  getHistory(): void {
    this.loading = true;

    this.rbcqService.getHistory(
      this.currentPage - 1,
      this.pageSize
    ).subscribe({
      next: (response) => {
        this.uploadHistory = (response.content || []).map(
          (item: AuditHistory) => ({
            ...item,
            expanded: false
          })
        );

        this.totalItems = response.totalElements;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load upload history:', err);
        this.uploadHistory = [];
        this.totalItems = 0;
        this.loading = false;
        this.toast.error('Failed to load upload history.');
      }
    });
  }

  uploadRbcq = (item: NzUploadXHRArgs): Subscription => {
    const uploadFile = item.file as any;
    const file: File = uploadFile?.originFileObj || uploadFile;

    if (!file || !file.name || !file.name.toLowerCase().endsWith('.csv')) {
      this.toast.error('Only CSV files are allowed.');
      item.onError?.('Invalid file type', item.file);
      return new Subscription();
    }

    return this.rbcqService.uploadCsv(file).subscribe({
      next: (response) => {
        this.toast.success(`${file.name} uploaded successfully.`);
        item.onSuccess?.(response, item.file, {});

        // Refresh history after successful upload
        this.currentPage = 1;
        this.getHistory();
      },
      error: (err) => {
        console.error('Upload error:', err);

        let errorMessage = 'Upload failed due to server error.';

        if (typeof err.error === 'string') {
          if (
            err.error.includes('ORA-00001') ||
            err.error.includes('UK_AUDIT_UNIQUE_FIELDS')
          ) {
            errorMessage = 'Upload failed: Duplicate entry found in the file.';
          } else if (err.error.includes('CSV import failed')) {
            errorMessage = err.error.replace(/^CSV import failed: /, '');
          } else {
            errorMessage = err.error;
          }
        }

        this.toast.error(`${file.name} upload failed. ${errorMessage}`);
        item.onError?.(err, item.file);
      }
    });
  };
}