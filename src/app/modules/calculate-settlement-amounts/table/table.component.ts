import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import { meterProcessSearch } from '@shared/interfaces';
import { SettlementService } from '@shared/services/api';
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
  tableData: meterProcessSearch | any = {};
  searchName: string = '';

  constructor(
    private router: ActivatedRoute,
    private sts: SettlementService,
    public toast: ToastrService,
  ){};

  fetchJobs(searchName: string): void {
    this.isLoading = true
    return this.sts.search({}, searchName).subscribe({
      next: (data) => [this.tableData = data, this.toast.success('Jobs Loaded!')],
      error: (error) => this.toast.error(error.message)
    }).add(() => {this.isLoading = false});
  }

  ngOnInit(): void {
    this.router.data.subscribe((data: Data) => {
      this.isLineRentalStatus = data['isLineRentalStatus'] as boolean;
      this.searchName = data['searchName'] as string;
    })

    this.fetchJobs(this.searchName);
    console.log(this.tableData);
  }
}
