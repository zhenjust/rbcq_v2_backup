import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import FingerprintJS from '@fingerprintjs/fingerprintjs'
import { DecimalPipe } from '@angular/common';
import { AuthorizationService } from '@core/services/authorization.service';

@Component({
  selector: 'app-relogin',
  standalone: false,
  templateUrl: './relogin.component.html',
  styleUrl: './relogin.component.scss',
  providers: [DecimalPipe]
})
export class ReloginComponent implements OnInit {

  form: FormGroup;
  passwordVisible = false;

  private readonly fb = inject(FormBuilder);
  private readonly as = inject(AuthorizationService);

  async ngOnInit(): Promise<void> {
    const fingerPrint = FingerprintJS.load();

    const key = (await fingerPrint).get()

    this.form = this.fb.group({
      device_id: [(await key).visitorId],
      username: [{ value: this.as.currentUser()?.user?.name, disabled: true }, RxwebValidators.required()],
      password: [null, RxwebValidators.required()]
    });
  }

}
