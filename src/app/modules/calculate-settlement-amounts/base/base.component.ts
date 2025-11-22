import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import { settlementPageTitles, settlementSearchNames } from '@shared/enums';

@Component({
  selector: 'app-base',
  standalone: false,
  templateUrl: './base.component.html'
})
export class BaseComponent implements OnInit {
  pageTitle: string | undefined = undefined;
  isLineRentalStatus: boolean = false;

  private router = inject(ActivatedRoute);
  module: settlementSearchNames;

  ngOnInit(): void {
    this.router.data.subscribe((data: Data) => {
      this.pageTitle = data['pageTitle'] as settlementPageTitles;
      this.module = data['searchName'] as settlementSearchNames;
    });
  }

  get showRunProcess(): boolean { return [settlementSearchNames.RESERVE_TRADING_AMOUNTS].includes(this.module); }
}
