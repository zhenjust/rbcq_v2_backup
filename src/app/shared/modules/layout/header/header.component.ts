import { Component, OnInit } from '@angular/core';
import { faEllipsisVertical, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { HEADER_ROUTES } from '@shared/constants';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit{
  visible: boolean = false;
  ellipsisIcon: IconDefinition = faEllipsisVertical;
  headerLinks = [
    { label: 'ABOUT', url: HEADER_ROUTES.ABOUT_US },
    { label: 'HOW', url: HEADER_ROUTES.HOW },
    { label: 'FAQs', url: HEADER_ROUTES.FAQ }
  ];
  
  ngOnInit(): void {
      
  }
}
