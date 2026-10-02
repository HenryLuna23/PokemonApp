import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { TrainerData } from '../../services/trainer-data/trainer-data';

export const hasProfileGuard: CanActivateFn = (): boolean | UrlTree => {
    const trainerData = inject(TrainerData);
    const router = inject(Router);

    if (trainerData.hasProfile()) {
        return true;
    }

    return router.createUrlTree(['/new-user']);
};
