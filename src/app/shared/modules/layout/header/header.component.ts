import { Component, OnInit } from '@angular/core';
import { AuthorizationService } from '@core/services/authorization.service';
import { faEllipsisVertical, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { HEADER_ROUTES } from '@shared/constants';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit{
  visible: boolean = false;
  ellipsisIcon: IconDefinition = faEllipsisVertical;
  userData: any | null = null;
  userOptions: string = '';
  headerLinks = [
    { label: 'ABOUT', url: HEADER_ROUTES.ABOUT_US },
    { label: 'HOW', url: HEADER_ROUTES.HOW },
    { label: 'FAQs', url: HEADER_ROUTES.FAQ }
  ];

  constructor(
    private authServices: AuthorizationService,
    public toast: ToastrService
  ){}

  ngOnInit(): void {
      this.checkUser();
  }

  checkUser(): void {
    this.authServices.userInit().subscribe({
      next: (data) => {
        if(data.principal?.superUserName){
          this.userOptions = 'Switch to Normal User';
        }else{
          this.userOptions = 'Switch to Super User'
        }
      },
      error: (err) => {
        this.toast.error(err);
      }
    })
    this.userOptions = 'Switch to Super User'; //TODO remove this once CORS is fixed
  }

  logoutUser(): void {
    return this.authServices.logout();
  }
}
