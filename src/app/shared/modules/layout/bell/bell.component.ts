import { Component, OnInit } from '@angular/core';
import { faBell } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-bell',
  standalone: false,
  templateUrl: './bell.component.html',
  styleUrl: './bell.component.scss'
})
export class BellComponent implements OnInit {
  bell = faBell;
  visible = false;

  ngOnInit(): void {
      
  }
}
