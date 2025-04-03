import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-base',
  standalone: false,
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss']
})
export class BaseComponent implements OnInit {
  isCollapsed: boolean = true;
  isHovered: boolean = false;
  
  ngOnInit(): void {
  }
  
  handleSiderHover(hovered: boolean): void {
    this.isHovered = hovered;
    // When mouse enters the sider, temporarily un-collapse it
    // When mouse leaves, return to previous state
  }
  
  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }
}
