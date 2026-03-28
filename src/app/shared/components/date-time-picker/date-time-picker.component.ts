import { set } from 'date-fns';
import { Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-date-time-picker',
  standalone: false,
  templateUrl: './date-time-picker.component.html',
  styleUrls: ['./date-time-picker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateTimePickerComponent),
      multi: true
    }
  ]
})
export class DateTimePickerComponent implements ControlValueAccessor {

  value: Date | null = null;

  disabledDate = input<(current: Date) => boolean>(() => false);

  showCalendar = signal<boolean>(true);
  time = { hour: 0, minute: 0 };
  date: any;
  isVisible = false;

  onChange: (value: Date | null) => void = () => { };
  onTouched: () => void = () => { };

  writeValue(value: Date | null): void {
    this.value = value;
  }

  registerOnChange(fn: (value: Date | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  // setDisabledState(_isDisabled: boolean): void {
  //   // optional
  // }

  updateValue(date: Date | null) {
    this.value = set(date!, { hours: this.time.hour, minutes: this.time.minute });
    this.onChange(this.value);
    this.onTouched();
  }

  /**
   *
   */

  toggleTime(): void {
    this.showCalendar.set(!this.showCalendar());
  }

  setTimeDefault(): void {
    const date = set(this.value || new Date(), { hours: 0, minutes: 0 });
    this.showCalendar.set(!this.showCalendar());
    this.updateValue(date);
  }

  onTimeChange(time: { hour: number, minute: number }): void {
    const date = set(this.value || new Date(), { hours: time.hour, minutes: time.minute });
    this.updateValue(date);
  }

  onVisibleChange(show: boolean): void {
    if (show) {
      this.showCalendar.set(true);
    }
  }

}