import { Component, OnInit } from '@angular/core';
import { AuthorizationService } from '@core/services/authorization.service';
import { faEllipsisVertical, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { HEADER_ROUTES } from '@shared/constants';
import { CurrentUser } from '@shared/interfaces';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit{
  public userData: CurrentUser | null = null;

  isLoading: boolean = false;
  visible: boolean = false;
  ellipsisIcon: IconDefinition = faEllipsisVertical;
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
    this.isLoading = true;
    this.authServices.userInit().subscribe({
      next: (data) => {
        this.userData = data;
        this.isSuperUser(this.userData);
      },
      error: (err) => {
        this.toast.error(err.message);
      }
    }).add(() => {
      this.isLoading = false;
    });
  }

  getLdapUsers(): void{
    this.isLoading = true;
    this.authServices.userNameList().subscribe({
      next: (data) => {
        console.log(data)
      },
      error: (err) => {
        this.toast.error(err.message);
      }
    })
  }

  getUserDisplayName(): string {
    if (!this.userData) return '';
    return this.userData.principal.superUsername || this.userData.principal.username || '';
  }


  isSuperUser(data: CurrentUser | null): void {
    if(!data) return;
    if(data.principal.superUsername){
      this.userOptions = 'Switch to Normal User';
    } else {
      this.userOptions = 'Switch to Super User';
    }
  }

  logoutUser(): void {
    return this.authServices.logout();
  }
}
