import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { TrainerData } from '../../services/trainer-data/trainer-data';
import { hasCompleteTrainerGuard } from './has-complete-trainer';

describe('hasCompleteTrainerGuard', () => {
    let trainerData: jasmine.SpyObj<TrainerData>;
    let router: Router;

    beforeEach(() => {
        trainerData = jasmine.createSpyObj<TrainerData>('TrainerData', ['hasProfile', 'hasCompleteTeam']);

        TestBed.configureTestingModule({
            providers: [provideZonelessChangeDetection(), { provide: TrainerData, useValue: trainerData }],
        });

        router = TestBed.inject(Router);
    });

    it('should redirect to /new-user if trainer has no profile', () => {
        trainerData.hasProfile.and.returnValue(false);
        trainerData.hasCompleteTeam.and.returnValue(false);

        const result = TestBed.runInInjectionContext(() => hasCompleteTrainerGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot));

        expect(result instanceof UrlTree).toBeTrue();
        expect(router.serializeUrl(result as UrlTree)).toBe('/new-user');
    });

    it('should redirect to /team if trainer has profile but incomplete team', () => {
        trainerData.hasProfile.and.returnValue(true);
        trainerData.hasCompleteTeam.and.returnValue(false);

        const result = TestBed.runInInjectionContext(() => hasCompleteTrainerGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot));

        expect(result instanceof UrlTree).toBeTrue();
        expect(router.serializeUrl(result as UrlTree)).toBe('/team');
    });

    it('should allow navigation if trainer has profile and complete team', () => {
        trainerData.hasProfile.and.returnValue(true);
        trainerData.hasCompleteTeam.and.returnValue(true);

        const result = TestBed.runInInjectionContext(() => hasCompleteTrainerGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot));

        expect(result).toBeTrue();
    });
});
