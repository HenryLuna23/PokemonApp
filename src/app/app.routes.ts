import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { hasCompleteTrainerGuard } from './guards/has-complete-trainer/has-complete-trainer';
import { hasProfileGuard } from './guards/has-profile/has-profile';
import { TrainerData } from './services/trainer-data/trainer-data';

export const routes: Routes = [
    {
        path: 'new-user',
        loadComponent: () => import('./pages/new-user/new-user').then((m) => m.NewUser),
    },
    {
        path: 'team',
        loadComponent: () => import('./pages/team-selection/team-selection').then((m) => m.TeamSelection),
        canActivate: [hasProfileGuard],
    },
    {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile').then((m) => m.Profile),
        canActivate: [hasCompleteTrainerGuard],
    },
    {
        path: '',
        pathMatch: 'full',
        redirectTo: () => {
            const trainerData = inject(TrainerData);
            if (!trainerData.hasProfile()) {
                return 'new-user';
            }
            if (!trainerData.hasCompleteTeam()) {
                return 'team';
            }
            return 'profile';
        },
    },
    {
        path: '**',
        redirectTo: '',
    },
];
