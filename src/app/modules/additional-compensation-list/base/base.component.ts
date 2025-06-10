import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-base',
  standalone: false,
  templateUrl: './base.component.html'
})
export class BaseComponent implements OnInit {
  pageTitle: string | undefined;

  constructor(private router: ActivatedRoute) {};
  ngOnInit(): void {
    this.router.data.subscribe((data: any) => { //TODO update this and create proper interface
      this.pageTitle = data.pageTitle;
    })
  }
}
