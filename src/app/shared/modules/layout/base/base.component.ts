import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-base',
  standalone: false,
  templateUrl: './base.component.html',
  styleUrl: './base.component.scss'
})
export class BaseComponent implements OnInit {
  ngOnInit(): void {
  }
}
