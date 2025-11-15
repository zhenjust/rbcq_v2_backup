import { Component } from '@angular/core';
import { TableParams } from '@shared/interfaces';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { Observable, Subject, Subscription } from 'rxjs';


@Component({
  template: ''
})
/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @angular-eslint/component-class-suffix
export abstract class SearchListBase {

  abstract busy$: Subscription;
  abstract getListUrl(): Observable<any>;
  abstract resultsProp: string;

  listComplete$ = new Subject<any>();
  tableData: any[] = [];

  tableParams = new TableParams();

  protected constructor() { }

  search(): void {
    this.tableParams.page = 0;
    this.getList();
  }

  onQueryParamsChange(params: NzTableQueryParams) {
    const page = params.pageIndex || 0;
    this.tableParams.page = page;
    this.tableParams.size = params.pageSize;

    const { sort } = params;
    if (sort.length) {
      const currentSort = sort.find(item => item.value);
      if (currentSort) {
        // this.tableParams.sort = {
        //   prop: currentSort?.key || null,
        //   dir: currentSort?.value || null,
        // };
      }
    }

    this.getList();
  }

  getList(): void {
    setTimeout(() => {
      this.busy$ = this.getListUrl()
        .subscribe(itemDetails => {
          console.log({itemDetails})
          this.tableData = itemDetails[this.resultsProp || 'content'];
          this.tableParams.totalElements = itemDetails?.totalElements;

          this.listComplete$.next(itemDetails);
        });
    }, 1);
  }

  get isLoading(): boolean { return this.busy$ && !this.busy$?.closed; }

}
