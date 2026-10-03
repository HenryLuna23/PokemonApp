import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NewUser } from './new-user';

describe('NewUser Page', () => {
    let fixture: ComponentFixture<NewUser>;
    let component: NewUser;

    beforeEach(async () => {
        localStorage.clear();
        await TestBed.configureTestingModule({
            imports: [NewUser],
            providers: [provideZonelessChangeDetection(), provideRouter([])],
        }).compileComponents();

        fixture = TestBed.createComponent(NewUser);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the new user page', () => {
        expect(component).toBeTruthy();
    });

    it('should render the Figma header title and subtitle', () => {
        const el = fixture.nativeElement as HTMLElement;
        const title = el.querySelector('.page-title');
        const subtitle = el.querySelector('.page-subtitle');

        expect(title?.textContent).toContain('¡Hola! Configuremos tu perfil');
        expect(subtitle?.textContent).toContain('Queremos conocerte mejor.');
    });

    it('should render both trainer card and trainer form components', () => {
        const el = fixture.nativeElement as HTMLElement;
        expect(el.querySelector('app-trainer-card')).toBeTruthy();
        expect(el.querySelector('app-trainer-form')).toBeTruthy();
    });

    it('should show photo required error when onPhotoRequired is called', () => {
        const el = fixture.nativeElement as HTMLElement;
        expect(el.querySelector('[data-testid="photo-error"]')).toBeNull();

        // Simular que el formulario emite photoRequired
        (component as unknown as { onPhotoRequired: () => void }).onPhotoRequired();
        fixture.detectChanges();

        const photoError = el.querySelector('[data-testid="photo-error"]');
        expect(photoError).toBeTruthy();
        expect(photoError?.textContent).toContain('La foto de perfil es requerida.');
    });

    it('should clear photo error when onPhotoRemoved sets error and then onPhotoSelected is called', async () => {
        const el = fixture.nativeElement as HTMLElement;

        // Al remover foto se activa el error
        (component as unknown as { onPhotoRemoved: () => void }).onPhotoRemoved();
        fixture.detectChanges();

        expect(el.querySelector('[data-testid="photo-error"]')).toBeTruthy();

        // Al seleccionar una foto válida se limpia el error
        const validImageFile = new File(['mock-image-data'], 'pixel.png', { type: 'image/png' });

        (component as unknown as { onPhotoSelected: (f: File) => void }).onPhotoSelected(validImageFile);
        await new Promise((resolve) => setTimeout(resolve, 50));
        fixture.detectChanges();

        expect(el.querySelector('[data-testid="photo-error"]')).toBeNull();
    });

    it('should automatically show photo error when form becomes valid without photo', () => {
        const el = fixture.nativeElement as HTMLElement;
        expect(el.querySelector('[data-testid="photo-error"]')).toBeNull();

        // Cuando el usuario completa todos los campos del formulario
        (component as unknown as { onFormValidityChange: (v: boolean) => void }).onFormValidityChange(true);
        fixture.detectChanges();

        const photoError = el.querySelector('[data-testid="photo-error"]');
        expect(photoError).toBeTruthy();
        expect(photoError?.textContent).toContain('La foto de perfil es requerida.');
    });
});
