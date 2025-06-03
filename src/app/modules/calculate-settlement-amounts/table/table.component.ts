import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import { settlementSearch } from '@shared/interfaces';
import { SearchFilterService } from '@shared/services/settlement';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-table',
  standalone: false,
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
})
export class TableComponent implements OnInit {
  isLineRentalStatus: boolean = false;
  isLoading: boolean = false;
  tableData: settlementSearch | any = {};
  searchName: string = '';

  constructor(
    private router: ActivatedRoute,
    public toast: ToastrService,
    private sfs: SearchFilterService
  ){};

  ngOnInit(): void {
    this.router.data.subscribe((data: Data) => {
      this.isLineRentalStatus = data['isLineRentalStatus'] as boolean;
      this.searchName = data['searchName'] as string;
    })

    this.sfs.fetchJobs({}, this.searchName); //initial load

    //watch table data change
    this.sfs.jobs$.subscribe({
      next: (data) => {
        if (data) {
          this.tableData = data;
          this.toast.success('Jobs Loaded!');
        }
      },
      error: (error) => {
        this.toast.error(error.message);
      }
    });

    console.log(this.tableData);
  }
}
