import { Injectable, signal, computed } from '@angular/core';
import { meterProcessParams } from '@shared/interfaces';

@Injectable({
  providedIn: 'root',
})
export class RunJobService {
  private readonly _latestConfiguration = signal<meterProcessParams | null>(null);
  private readonly _isConfigurationCleared = signal<boolean>(false);
  private readonly _isFormValid = signal<boolean>(false);

  public readonly latestConfiguration = this._latestConfiguration.asReadonly();
  public readonly isConfigurationCleared = this._isConfigurationCleared.asReadonly();

  // Computed signal for active configuration validation
  public readonly hasValidConfiguration = computed(() => {
    const config = this._latestConfiguration();
    const isCleared = this._isConfigurationCleared();
    const isFormValid = this._isFormValid();

    return config !== null && !isCleared && isFormValid;
  });

  constructor() {}

  public updateConfiguration(configuration: meterProcessParams): void {
    this._latestConfiguration.set(configuration);
    this._isConfigurationCleared.set(false);
  }

  public updateFormValidity(isValid: boolean): void {
    this._isFormValid.set(isValid);
  }

  public getLatestConfiguration(): meterProcessParams | null {
    return this._latestConfiguration();
  }

  public clearConfiguration(): void {
    this._isConfigurationCleared.set(true);
    this._latestConfiguration.set(null);
    this._isFormValid.set(false);
  }

  public isConfigCleared(): boolean {
    return this._isConfigurationCleared();
  }
}
