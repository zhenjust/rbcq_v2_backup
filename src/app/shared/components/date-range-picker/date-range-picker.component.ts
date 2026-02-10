import { Component, input, OnInit, output } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-date-range-picker',
  standalone: false,
  templateUrl: './date-range-picker.component.html',
  styleUrl: './date-range-picker.component.scss'
})
export class DateRangePickerComponent implements OnInit {

  label = input.required<string>();
  disabledDate = input<(current: Date) => boolean>();

  date = input<Date[]>();
  dates = input<FormControl>(new FormControl([]));
  datesChange = output<Date[]>();

  ngOnInit(): void {
    if (this.date()) {
      this.dates().setValue(this.date());
    }

    this.dates().valueChanges
      .subscribe(() => this.datesChange.emit(this.dates()?.value));
  }
}
