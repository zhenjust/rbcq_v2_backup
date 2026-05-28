import { AfterViewInit, Component, output, signal } from '@angular/core';

@Component({
  selector: 'app-polling-timer',
  standalone: false,
  templateUrl: './polling-timer.component.html',
})
export class PollingTimerComponent implements AfterViewInit {

  emitEvent = output<number>();
  emitReload = output<boolean>();

  selectedPollingTime = signal<string>('1m');

  pollingOpts = [
    { label: '30s', value: 30000 },
    { label: '1m', value: 60000 },
    { label: '5m', value: 300000 }
  ];

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.emitEvent.emit(this.getCurrentPollingValue());
      // this.emitReload.emit(true);
    }, 100);
  }

  onPollingChange(time: { label: string; value: number }): void {
    this.selectedPollingTime.set(time.label);
    this.emitEvent.emit(time.value);
  }

  private getCurrentPollingValue(): number {
    return this.pollingOpts.find(option => option.label === this.selectedPollingTime())?.value ?? 60000;
  }

}
