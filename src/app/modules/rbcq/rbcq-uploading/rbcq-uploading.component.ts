import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadChangeParam, NzUploadXHRArgs } from 'ng-zorro-antd/upload';
import { faUpload} from '@fortawesome/free-solid-svg-icons';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { RbcqService } from '@shared/services/api/rbcq.service'; 

@Component({
  selector: 'app-rbcq-uploading',
  standalone: false,
  templateUrl: './rbcq-uploading.component.html',
  styleUrl: './rbcq-uploading.component.scss'
})
export class RbcqUploadingComponent implements OnInit{
 pageTitle: string | undefined;
  selectedFile: File | null = null;
  uploadSuccess = false;
  uploadError: string | null = null;
  uploadIcon = faUpload;


    constructor(
    private router: ActivatedRoute,
    private messageService: NzMessageService,
    private http: HttpClient ,
    private toast: ToastrService,
    private rbcqService : RbcqService


    
  ) {}
  

  ngOnInit(): void {
    this.router.data.subscribe((data: any) => {
      this.pageTitle = data.pageTitle;
    });
  }



  uploadRbcq = (item: NzUploadXHRArgs): Subscription => {
    const uploadFile = item.file as any;
    const file: File = uploadFile?.originFileObj || uploadFile;  // fallback

    console.log('Uploading file:', file);

    if (!file || !file.name || !file.name.toLowerCase().endsWith('.csv')) {
      this.toast.error('Only CSV files are allowed.');
      item.onError?.('Invalid file type', item.file);
      return new Subscription();
    }

    return this.rbcqService.uploadCsv(file).subscribe({
      next: (response) => {
        this.toast.success(`${file.name} uploaded successfully.`);
        item.onSuccess?.(response, item.file, {});
      },
      error: (err) => {
        console.error('Upload error:', err);

        let errorMessage = 'Upload failed due to server error.';

        if (typeof err.error === 'string') {
          if (err.error.includes('ORA-00001') || err.error.includes('UK_AUDIT_UNIQUE_FIELDS')) {
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

