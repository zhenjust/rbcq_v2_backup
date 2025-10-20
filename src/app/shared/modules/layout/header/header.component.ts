import { Component, inject, OnInit } from '@angular/core';
import { AuthorizationService } from '@core/services/authorization.service';
import { faEllipsisVertical, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { apiPath, HEADER_ROUTES, PHASE_ONE_AUTHORITIES } from '@shared/constants';
import { CurrentUser } from '@shared/interfaces';
import { ToastrService } from 'ngx-toastr';
import { NzModalService } from 'ng-zorro-antd/modal';
import { environment } from 'environments/environment';
import { LABELS } from '@shared/constants/labels.const';
import { SwitchUserComponent } from '../switch-user/switch-user.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MESSAGES } from '@shared/constants/messages.const';
import { NgxPermissionsService } from 'ngx-permissions';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {

  visible: boolean = false;
  ellipsisIcon: IconDefinition = faEllipsisVertical;

  private userData: CurrentUser | null = null;

  private readonly toast = inject(ToastrService);
  private readonly modal = inject(NzModalService);
  private readonly untilDestroy$ = takeUntilDestroyed();
  private readonly as = inject(AuthorizationService);
  private readonly ngx = inject(NgxPermissionsService);

  isNormalUser = true;

  headerLinks = [
    { label: 'ABOUT', url: HEADER_ROUTES.ABOUT_US },
    { label: 'HOW', url: HEADER_ROUTES.HOW },
    { label: 'FAQs', url: HEADER_ROUTES.FAQ }
  ];

  menuOptions = [
    { id: 1, label: LABELS.PROFILE, action: () => {}, show: true, perms: [] },
    { id: 2, label: LABELS.CHANGE_PASSWORD, action: () => {}, show: true, perms: []  },
    { id: 3, label: LABELS.SWITCH_TO_NORMAL_USER, action: () => this.switchUser(), show: this.isSuperUser, perms: [ PHASE_ONE_AUTHORITIES.ADM_SUPER_USER ] },
    { id: 4, label: LABELS.SWITCH_TO_SUPER_USER, action: () => this.switchUser(), show: !this.isSuperUser, perms: [ PHASE_ONE_AUTHORITIES.ADM_SUPER_USER ] },
    { id: 5, label: LABELS.SIGN_OUT, action: () => this.signout(), show: true, perms: [] },
  ];

  ngOnInit(): void {
    this.checkUser();
  }

  checkUser(): void {
    const currentUser = this.as.currentUser();

    if (currentUser) {
      this.userData = currentUser;
    } else {
      this.as.loadUser()
        .subscribe({
          next: (data) => this.userData = data
      });
    }
  }

  switchUser(): void {
    if (this.isNormalUser) {
      this.changeToSuperUser();
    } else {
      this.changeToNormal();
    }
  }

  changeToSuperUser(): void {
    this.modal.create({
      nzCentered: true,
      nzTitle: `${LABELS.SWITCH} ${LABELS.USER}`,
      nzContent: SwitchUserComponent,
      nzFooter: null
    });
  }

  changeToNormal(): void {
    if (!this.userData) {
      return;
    }

    this.as.changeToNormalUser(this.userData?.principal?.username)
      .pipe(this.untilDestroy$)
      .subscribe({
        next: () => {
          this.toast.success(MESSAGES.SUCCESS_SWITCH('Normal'));
          window.location.href = environment.__PHASE_ONE_URL__;
        }
      });
  }

  signout(): void {
    this.as.logout()
      .subscribe({})
      .add(() => {
        this.ngx.flushPermissions();
        localStorage.clear();
        window.location.href = `${apiPath.__AUTH_PATH__}/logout`;
      });
  }

  get isSuperUser(): boolean { return !!this.userData?.principal.superUserName; }
  get displayName(): string { return this.userData?.principal?.superUserName || this.userData?.principal?.dn || ''; }
}
