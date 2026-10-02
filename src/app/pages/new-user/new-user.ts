import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TrainerCard } from '../../components/trainer-card/trainer-card';
import { TrainerForm, TrainerFormOutput } from '../../components/trainer-form/trainer-form';
import { LoadingService } from '../../services/loading/loading';
import { TrainerData } from '../../services/trainer-data/trainer-data';

@Component({
    selector: 'app-new-user',
    standalone: true,
    imports: [TrainerCard, TrainerForm],
    templateUrl: './new-user.html',
    styleUrl: './new-user.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewUser {
    protected readonly trainerData = inject(TrainerData);
    private readonly loading = inject(LoadingService);
    private readonly router = inject(Router);

    /** signals for the picture selected */
    protected readonly photoData = signal<string | null>(this.trainerData.profile()?.photoData ?? null);
    protected readonly photoName = signal<string>(this.trainerData.profile()?.photoName ?? '');

    /** estado de formulario valido */
    protected readonly isFormValid = signal<boolean>(false);

    protected readonly manualPhotoError = signal<string | null>(null);
    protected readonly hasPhoto = computed<boolean>(() => !!this.photoData());

    protected readonly photoError = computed<string | null>(() => {
        if (this.hasPhoto()) return null;
        if (this.isFormValid() || this.manualPhotoError()) return 'La foto de perfil es requerida.';
        return null;
    });

    /** listening for form changes */
    protected onFormValidityChange(valid: boolean): void {
        this.isFormValid.set(valid);
    }

    /** processing image with native FileReader */
    protected onPhotoSelected(file: File): void {
        const reader = new FileReader();
        reader.onload = () => {
            this.photoData.set(reader.result as string);
            this.photoName.set(file.name);
            this.manualPhotoError.set(null);
        };
        reader.onerror = (error) => {
            console.error('Error al leer la imagen de perfil', error);
        };
        reader.readAsDataURL(file);
    }

    /** delete picture */
    protected onPhotoRemoved(): void {
        this.photoData.set(null);
        this.photoName.set('');
        this.manualPhotoError.set('La foto de perfil es requerida.');
    }

    /** handle when the picture is required */
    protected onPhotoRequired(): void {
        this.manualPhotoError.set('La foto de perfil es requerida.');
    }

    /** back button */
    protected onBack(): void {
        if (this.trainerData.hasProfile()) this.router.navigate(['/team']);
    }

    /** save the account in trainer data */
    protected async onFormSubmit(formData: TrainerFormOutput): Promise<void> {
        const currentPhoto = this.photoData();
        if (!currentPhoto) {
            this.manualPhotoError.set('La foto de perfil es requerida.');
            return;
        }

        this.loading.show('Cargando...');

        this.trainerData.saveAccount({
            ...formData,
            photoData: currentPhoto,
            photoName: this.photoName(),
        });

        // simulacion de carga
        await new Promise((resolve) => setTimeout(resolve, 600));

        await this.router.navigate(['/team']);
        this.loading.hide();
    }
}
