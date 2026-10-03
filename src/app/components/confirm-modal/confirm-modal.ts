import { ChangeDetectionStrategy, Component, HostListener, input, output } from '@angular/core';

export type ModalVariant = 'danger' | 'warning' | 'info';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  templateUrl: './confirm-modal.html',
  styleUrl: './confirm-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmModal {
  /** Controls modal visibility state */
  readonly isOpen = input<boolean>(false);

  /** Modal header title */
  readonly title = input<string>('¿Estás seguro?');

  /** Descriptive confirmation message */
  readonly message = input<string>('');

  /** Label for confirm action button */
  readonly confirmText = input<string>('Confirmar');

  /** Label for cancel action button */
  readonly cancelText = input<string>('Cancelar');

  /** Visual alert style: danger, warning, or info */
  readonly variant = input<ModalVariant>('danger');

  /** Test attributes for automated testing */
  readonly testId = input<string>('confirm-modal');
  readonly confirmTestId = input<string>('confirm-btn');
  readonly cancelTestId = input<string>('cancel-btn');

  /** Emitted when confirmation action is triggered */
  readonly confirmed = output<void>();

  /** Emitted when modal is cancelled or dismissed */
  readonly cancelled = output<void>();

  /** Dismiss modal on backdrop click */
  protected onBackdropClick(): void {
    this.cancelled.emit();
  }

  /** Dismiss modal on cancel button click */
  protected onCancelClick(): void {
    this.cancelled.emit();
  }

  /** Trigger confirmation event */
  protected onConfirmClick(): void {
    this.confirmed.emit();
  }

  /** Dismiss modal on Escape key press */
  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen()) {
      this.cancelled.emit();
    }
  }
}
