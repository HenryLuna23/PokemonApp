import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { TrainerData } from '../../services/trainer-data/trainer-data';
import { hasProfileGuard } from './has-profile';

describe('hasProfileGuard', () => {
    let trainerData: jasmine.SpyObj<TrainerData>;
    let router: Router;

    beforeEach(() => {
        trainerData = jasmine.createSpyObj<TrainerData>('TrainerData', ['hasProfile']);

        TestBed.configureTestingModule({
            providers: [provideZonelessChangeDetection(), { provide: TrainerData, useValue: trainerData }],
        });

        router = TestBed.inject(Router);
    });

    it('should allow navigation if trainer has a profile', () => {
        trainerData.hasProfile.and.returnValue(true);

        const result = TestBed.runInInjectionContext(() => hasProfileGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot));

        expect(result).toBeTrue();
    });

    it('should redirect to /new-user if trainer has no profile', () => {
        trainerData.hasProfile.and.returnValue(false);

        const result = TestBed.runInInjectionContext(() => hasProfileGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot));

        expect(result instanceof UrlTree).toBeTrue();
        expect(router.serializeUrl(result as UrlTree)).toBe('/new-user');
    });
});
