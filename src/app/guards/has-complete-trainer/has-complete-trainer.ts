import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { TrainerData } from '../../services/trainer-data/trainer-data';

export const hasCompleteTrainerGuard: CanActivateFn = (): boolean | UrlTree => {
    const trainerData = inject(TrainerData);
    const router = inject(Router);

    if (!trainerData.hasProfile()) {
        return router.createUrlTree(['/new-user']);
    }

    if (!trainerData.hasCompleteTeam()) {
        return router.createUrlTree(['/team']);
    }

    return true;
};
