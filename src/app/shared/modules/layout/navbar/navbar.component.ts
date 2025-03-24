import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { navItems } from '@shared/interfaces';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  @Input() isCollapsed: boolean = true;
  @Input() isHovered: boolean = false;
  @Output() toggle: EventEmitter<void> = new EventEmitter<void>();
  
  navItems: navItems[] = [
    { title: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
    { title: 'Reports', icon: 'file', path: '/reports' },
    { title: 'Analytics', icon: 'bar-chart', path: '/analytics' },
    { title: 'Settings', icon: 'setting', path: '/settings' }
  ];
  
  ngOnInit(): void {
    console.log('Navbar component initialized');
  }
  
  toggleCollapse(): void {
    this.toggle.emit();
  }
  
  // Method to determine if text should be visible based on collapse and hover state
  shouldShowText(): boolean {
    return !this.isCollapsed || this.isHovered;
  }
}
