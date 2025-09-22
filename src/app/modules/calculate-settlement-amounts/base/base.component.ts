import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import { settlementPageTitles } from '@shared/enums';

@Component({
  selector: 'app-base',
  standalone: false,
  templateUrl: './base.component.html'
})
export class BaseComponent implements OnInit {
  pageTitle: string | undefined = undefined;
  isLineRentalStatus: boolean = false;

  private router = inject(ActivatedRoute);

  ngOnInit(): void {
    this.router.data.subscribe((data: Data) => {
      this.pageTitle = data['pageTitle'] as settlementPageTitles;
    })
  }
}
