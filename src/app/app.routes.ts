import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'new-user',
    loadComponent: () => import('./pages/new-user/new-user').then((m) => m.NewUser),
  },
  {
    path: 'team',
    loadComponent: () =>
      import('./pages/team-selection/team-selection').then((m) => m.TeamSelection),
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile').then((m) => m.Profile),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: () => {
      return 'new-user';
    },
  },
  {
    path: '**',
    redirectTo: '',
  },
];
