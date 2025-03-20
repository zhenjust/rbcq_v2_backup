import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-bell',
  standalone: false,
  templateUrl: './bell.component.html',
  styleUrl: './bell.component.scss'
})
export class BellComponent implements OnInit {
  visible = false;

  ngOnInit(): void {
      
  }
}
