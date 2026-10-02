import { computed, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private readonly _message = signal<string | null>(null);

  readonly message = this._message.asReadonly();
  readonly isLoading = computed(() => this._message() !== null);

  show(message = 'Cargando...'): void {
    this._message.set(message);
  }

  hide(): void {
    this._message.set(null);
  }
}
