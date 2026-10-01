import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LoadingService } from '../../services/loading/loading';

@Component({
  selector: 'app-new-user',
  standalone: true,
  templateUrl: './new-user.html',
  styleUrl: './new-user.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewUser {
  private readonly loadingService = inject(LoadingService);

  testLoading(): void {
    this.loadingService.show('Cargando perfil...');
    setTimeout(() => {
      this.loadingService.hide();
    }, 2000);
  }

   testLoading2(): void {
    this.loadingService.show('este es otri mensaje...');
    setTimeout(() => {
      this.loadingService.hide();
    }, 2000);
  }
}
