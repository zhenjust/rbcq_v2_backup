import { Component, input, OnInit, output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { MESSAGES } from '@shared/constants/messages.const';

@Component({
  selector: 'app-date-range-picker',
  standalone: false,
  templateUrl: './date-range-picker.component.html',
  styleUrl: './date-range-picker.component.scss'
})
export class DateRangePickerComponent implements OnInit {

  MESSAGE = MESSAGES;
  label = input.required<string>();
  disabledDate = input<(current: Date) => boolean>();

  date = input<Date[]>();
  dates = input<FormControl>(new FormControl([], RxwebValidators.minLength({ value: 1 })));
  datesChange = output<Date[]>();

  ngOnInit(): void {
    if (this.date()) {
      this.dates().setValue(this.date());
    }

    this.dates().valueChanges
      .subscribe(() => this.datesChange.emit(this.dates()?.value));
  }
}
