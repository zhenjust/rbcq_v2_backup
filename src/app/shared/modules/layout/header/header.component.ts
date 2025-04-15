import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthorizationService } from '@core/services/authorization.service';
import { faEllipsisVertical, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { apiPath, HEADER_ROUTES } from '@shared/constants';
import { CurrentUser } from '@shared/interfaces';
import { ToastrService } from 'ngx-toastr';
import { switchMap, tap } from 'rxjs';
import { NzModalService } from 'ng-zorro-antd/modal';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit{
  public userData: CurrentUser | null = null;
  isSuper: boolean = false;
  isLoading: boolean = false;
  visible: boolean = false;
  ellipsisIcon: IconDefinition = faEllipsisVertical;
  userOptions: string = '';
  selectedSuperUser: string = '';
  userList: string[] = [];
  isModalReady = false;

  @ViewChild('superUserModal', { static: true }) superUserModal!: TemplateRef<HTMLBodyElement>;

  headerLinks = [
    { label: 'ABOUT', url: HEADER_ROUTES.ABOUT_US },
    { label: 'HOW', url: HEADER_ROUTES.HOW },
    { label: 'FAQs', url: HEADER_ROUTES.FAQ }
  ];

  constructor(
    private authServices: AuthorizationService,
    public toast: ToastrService,
    public router: Router,
    public modal: NzModalService
  ){}

  ngOnInit(): void {
      this.checkUser();
  }

  checkUser(): void {
    this.isLoading = true;
    this.authServices.userInit().subscribe({
      next: (data) => {
        this.userData = data;
        this.isSuper = !!data.principal.superUserName;
        this.userOptions = this.isSuper ? 'Switch to Normal User' : 'Switch to Super User';
      },
      error: (err) => {
        this.toast.error(err.message);
      },
      complete: () => {
        this.isLoading = false;
      }
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
    return this.userData.principal.superUserName || this.userData.principal.username || '';
  }


  //TODO review how to go super user
  handleSwitchClick(): void {
    if (this.isSuper) {
      if (!this.userData) return;
      this.authServices.changeToNormalUser(this.userData.principal.username).subscribe({
        next: () => {
          this.toast.success('Switched to Normal User!');
          window.location.href = environment.__PHASE_ONE_URL__;
        },
        error: (err) => {
          this.toast.error(err.message);
        }
      });
    } else {
      this.openSuperUserModal();
    }
  }

  openSuperUserModal(): void {
    this.isModalReady = false;
    this.authServices.userNameList().subscribe({
      next: (data) => {
        this.userList = data;
        this.isModalReady = true;
        this.modal.create({
          nzContent: this.superUserModal,
          nzFooter: null
        });
      },
      error: (err) => {
        this.toast.error('Failed to load user list. ->', err.message);
      }
    });
  }

  confirmSuperUser(modalRef: any): void {
    if (!this.selectedSuperUser) return;
    const username = this.selectedSuperUser.split(' ')[0];
    this.authServices.changeToSuperUser(username).pipe(
      switchMap(() => this.authServices.logSuperUserLogin()),
      tap(() => {
        this.toast.success('Switched to Super User!');
        modalRef.destroy();
      })
    ).subscribe({
      next: () => {
        window.location.href = environment.__PHASE_ONE_URL__;
      },
      error: (err) => {
        console.log(err);
        this.toast.error(err.message);
      }
    });
  }

  logoutUser(): void {
    this.authServices.logout().subscribe({
      next: () => {
        return this.toast.success('Logout successfully!');
      },
      error: (err) => {
        return this.toast.error(err.message);
        //TODO investigate error message but 200 response 
      }
    }).add(() => {
      localStorage.clear();
      window.location.href = `${apiPath.__AUTH_PATH__}/logout`;
    });
  }
}
