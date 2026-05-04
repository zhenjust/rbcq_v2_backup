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
      this.emitReload.emit(true);
    }, 100);
  }

}
