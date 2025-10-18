import { Component, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthorizationService } from '@core/services/authorization.service';
import { LABELS } from '@shared/constants/labels.const';
import { NzSelectOptionInterface } from 'ng-zorro-antd/select';
import { ToastrService } from 'ngx-toastr';
import { Subscription, switchMap, tap } from 'rxjs';
import { environment } from 'environments/environment';
import { MESSAGES } from '@shared/constants/messages.const';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-switch-user',
  standalone: false,
  templateUrl: './switch-user.component.html',
  styleUrl: './switch-user.component.scss'
})
export class SwitchUserComponent implements OnInit {

  private readonly as = inject(AuthorizationService);
  private readonly untilDestroy$ = takeUntilDestroyed();
  private readonly toast = inject(ToastrService);
  public modalRef = inject(NzModalRef);

  LABELS = LABELS;

  busy$: Subscription;
  userOpts: NzSelectOptionInterface[] = [];
  selectedUser: string;

  ngOnInit(): void {
    this.getUsers();
  }

  getUsers(): void {
    this.as.userNameList()
      .pipe(this.untilDestroy$)
      .subscribe({
        next: userList => {
          this.userOpts = (userList as string[])
            .map(user => ({ label: user, value: user }) );
        },
    });
  }

  switchToSuperUser(): void {
    const username = this.selectedUser.split(' ')[0];

    this.as.changeToSuperUser(username)
      .pipe(
        this.untilDestroy$,
        switchMap(() => this.as.logSuperUserLogin()))
      .subscribe({
        next: () => {
          this.modalRef.destroy();
          this.toast.success(MESSAGES.SUCCESS_SWITCH('Super'));
          window.location.href = environment.__PHASE_ONE_URL__;
        },
    });
  }
}
