import { Injectable, signal, computed } from '@angular/core';
import { meterProcessParams } from '@shared/interfaces';

@Injectable({
  providedIn: 'root',
})
export class RunJobService {
  private readonly _latestConfiguration = signal<meterProcessParams | null>(null);
  private readonly _isConfigurationCleared = signal<boolean>(false);

  public readonly latestConfiguration = this._latestConfiguration.asReadonly();
  public readonly isConfigurationCleared = this._isConfigurationCleared.asReadonly();

  // Computed signal for active configuration validation
  public readonly hasValidConfiguration = computed(() => {
    const config = this._latestConfiguration();
    const isCleared = this._isConfigurationCleared();
    
    return config !== null && !isCleared;
  });

  constructor() {}

  public updateConfiguration(configuration: meterProcessParams): void {
    this._latestConfiguration.set(configuration);
    this._isConfigurationCleared.set(false);
  }

  public getLatestConfiguration(): meterProcessParams | null {
    return this._latestConfiguration();
  }

  public clearConfiguration(): void {
    this._isConfigurationCleared.set(true);
    this._latestConfiguration.set(null);
  }

  public isConfigCleared(): boolean {
    return this._isConfigurationCleared();
  }


}