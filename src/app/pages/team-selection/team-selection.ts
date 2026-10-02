import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TrainerCard, TrainerDocumentInfo } from '../../components/trainer-card/trainer-card';
import { TrainerData } from '../../services/trainer-data/trainer-data';
import { calculateAge } from '../../utils/age/age';

@Component({
    selector: 'app-team-selection',
    standalone: true,
    imports: [TrainerCard],
    templateUrl: './team-selection.html',
    styleUrl: './team-selection.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamSelection {
    protected readonly trainerData = inject(TrainerData);

    /** Perfil del entrenador obtenido del estado reactivo */
    protected readonly profile = this.trainerData.profile;

    /** Edad calculada a partir de la fecha de nacimiento */
    protected readonly trainerAge = computed<number | null>(() => {
        const profile = this.profile();
        return calculateAge(profile?.birthdate);
    });

    /** Documento formateado con su etiqueta (DUI o Carnet) */
    protected readonly trainerDocument = computed<TrainerDocumentInfo | null>(() => {
        const profile = this.profile();
        if (!profile || !profile.dni) return null;
        return {
            label: profile.isAdult ? 'DUI' : 'Carnet',
            value: profile.dni,
        };
    });
}
