import { ChangeDetectionStrategy, Component, ElementRef, HostListener, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { LoadingService } from '../../services/loading/loading';
import { TrainerData } from '../../services/trainer-data/trainer-data';

import { ConfirmModal } from '../confirm-modal/confirm-modal';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ConfirmModal],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  private readonly trainerData = inject(TrainerData);
  private readonly loading = inject(LoadingService);
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef);

  /** Reactive current URL via router events */
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map((e) => (e as NavigationEnd).urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  /** Only show user actions when the user is on the profile page */
  protected readonly isProfileRoute = computed(() => {
    const url = this.currentUrl() ?? '';
    return url === '/profile' || url.startsWith('/profile?') || url.startsWith('/profile/');
  });

  /** Estado del dropdown de usuario */
  readonly isDropdownOpen = signal<boolean>(false);

  /** Estado del modal de confirmación de logout */
  readonly showConfirmModal = signal<boolean>(false);

  /** Primer nombre del entrenador para visualización */
  protected readonly firstName = computed<string | null>(() => {
    const profile = this.trainerData.profile();
    if (!profile || !profile.fullName) return null;
    return profile.fullName.trim().split(' ')[0] || null;
  });

  /** Alternar estado del dropdown */
  protected toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.isDropdownOpen.update((v) => !v);
  }

  /** Cerrar menú dropdown */
  protected closeDropdown(): void {
    this.isDropdownOpen.set(false);
  }

  /** Abrir modal de confirmación para cerrar sesión */
  protected promptLogout(): void {
    this.closeDropdown();
    this.showConfirmModal.set(true);
  }

  /** Cancelar y cerrar modal */
  protected cancelLogout(): void {
    this.showConfirmModal.set(false);
  }

  /** Confirmar limpieza de datos, mostrar loader y redirigir a nuevo usuario */
  protected async confirmLogout(): Promise<void> {
    this.showConfirmModal.set(false);
    this.loading.show('Cerrando sesión...');

    this.trainerData.clear();

    await new Promise((resolve) => setTimeout(resolve, 600));
    await this.router.navigate(['/new-user']);
    this.loading.hide();
  }

  /** Cerrar dropdown si se hace clic fuera del componente */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }

  /** Cerrar dropdown o modal al presionar la tecla Escape */
  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeDropdown();
    if (this.showConfirmModal()) {
      this.cancelLogout();
    }
  }
}
