import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthorizationService } from '@core/services/authorization.service';
import { faEllipsisVertical, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { HEADER_ROUTES } from '@shared/constants';
import { CurrentUser } from '@shared/interfaces';
import { ToastrService } from 'ngx-toastr';
import { catchError, map, switchMap, tap } from 'rxjs';
import { NzModalService } from 'ng-zorro-antd/modal';

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
  userList: any[] = [];
  isModalReady = false;

  @ViewChild('superUserModal', { static: true }) superUserModal!: TemplateRef<any>;

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
        this.isSuper = !!data.principal.superUsername;
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
    return this.userData.principal.superUsername || this.userData.principal.username || '';
  }


  //TODO review how to go super user
  handleSwitchClick(): void {
    if (this.isSuper) {
      if (!this.userData) return;
      const username = this.userData.principal.username;
      this.authServices.changeToNormalUser(username).subscribe({
        next: () => {
          this.toast.success('Switched to Normal User!');
          // this.router.navigate(['/']);
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
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.log(err);
        this.toast.error(err.message);
      }
    });
  }

  logoutUser(): void {
    this.authServices.logout();
  }
}
