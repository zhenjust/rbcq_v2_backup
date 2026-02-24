import { ChangeDetectorRef, Component, inject, signal, TemplateRef, ViewChild } from '@angular/core';
import { AuthorizationService } from '@core/services/authorization.service';
import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { apiPath } from '@shared/constants';
import { MESSAGES } from '@shared/constants/messages.const';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.scss'
})
export class AppComponent {

  @ViewChild('idleMsg') idleMsg: TemplateRef<HTMLElement>;

  idleState = signal<string>('NOT_STARTED');
  countdown = signal<number | null>(null);
  lastPing = signal<Date | null>(null);
  MESSAGE = MESSAGES;

  modal: NzModalRef | null = null;

  private readonly idle = inject(Idle);
  private readonly cd = inject(ChangeDetectorRef);
  private readonly ms = inject(NzModalService);
  private readonly as = inject(AuthorizationService);

  constructor() {

    /**
     * GUIDE:
     * onIdleStart: when user starts being idle
     * onIdleEnd: when user stops being idle
     * onTimeout: when idle checking has timedout, logout
     * onTimeoutWarning: show notification that the user
     *
     * idle: in seconds, inactivity time before being notified via modal
     * timeout: in seconds, how long can they be idle before timing out (logged out)
     */

    this.idle.setIdle(1800);
    this.idle.setTimeout(30);
    this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

    this.idle.onIdleStart.subscribe(() => {
      this.idleState.set(IDLE_STATE.IDLE);
    });

    this.idle.onIdleEnd.subscribe(() => {
      this.idleState.set(IDLE_STATE.NOT_IDLE);
      this.countdown.set(null);
      this.modal?.close();
      this.cd.detectChanges();
    });

    this.idle.onTimeout.subscribe(() => {
      this.idleState.set(IDLE_STATE.TIMED_OUT);
      this.modal?.close();
      this.as.logout();
      window.location.href = `${apiPath.__AUTH_PATH__}/logout`;
    });

    this.idle.onTimeoutWarning.subscribe(seconds => {
      this.countdown.set(seconds);
      if (this.modal) return;

      this.modal = this.ms.info({
        nzTitle: MESSAGES.SESSION_TIMEOUT_TITLE,
        nzContent: this.idleMsg,
        nzMaskClosable: false,
        nzCloseOnNavigation: true,
        nzCentered: true,
        nzFooter: null
      })
    });

    this.reset();
  }

  reset() {
    this.idle.watch();
    this.idleState.set(IDLE_STATE.NOT_IDLE);
    this.countdown.set(null);
    this.lastPing.set(null);
  }

}

export enum IDLE_STATE {
  NOT_IDLE = "NOT_IDLE",
  TIMED_OUT = "TIMED_OUT",
  NOT_STARTED = "NOT_STARTED",
  IDLE = "IDLE",
}
