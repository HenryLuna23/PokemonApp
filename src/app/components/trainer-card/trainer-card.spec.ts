import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TrainerCard, TrainerCardVariant, TrainerDocumentInfo } from './trainer-card';

@Component({
    standalone: true,
    imports: [TrainerCard],
    template: `
        <app-trainer-card
            [variant]="variant()"
            [photoData]="photoData()"
            [photoName]="photoName()"
            [fullName]="fullName()"
            [hobby]="hobby()"
            [age]="age()"
            [document]="document()"
            [photoError]="photoError()"
            (photoSelected)="onPhotoSelected($event)"
            (photoRemoved)="onPhotoRemoved()"
        />
    `,
})
class TestHostComponent {
    readonly variant = signal<TrainerCardVariant>('upload');
    readonly photoData = signal<string | null>(null);
    readonly photoName = signal<string>('');
    readonly photoError = signal<string | null>(null);
    readonly fullName = signal<string>('');
    readonly hobby = signal<string>('');
    readonly age = signal<number | null>(null);
    readonly document = signal<TrainerDocumentInfo | null>(null);

    selectedFile: File | null = null;
    removedCalled = false;

    onPhotoSelected(file: File): void {
        this.selectedFile = file;
    }

    onPhotoRemoved(): void {
        this.removedCalled = true;
    }
}

describe('TrainerCard', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let host: TestHostComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TestHostComponent],
            providers: [provideZonelessChangeDetection()],
        }).compileComponents();

        fixture = TestBed.createComponent(TestHostComponent);
        host = fixture.componentInstance;
    });

    describe('Upload Variant', () => {
        it('should render empty upload state when no photoData is provided', () => {
            host.variant.set('upload');
            fixture.detectChanges();

            const element = fixture.nativeElement as HTMLElement;
            expect(element.querySelector('.card-title')?.textContent).toContain('Imágen perfil');
            expect(element.querySelector('.upload-label')?.textContent).toContain('Adjunta un foto');
            expect(element.querySelector('.placeholder-icon')).toBeTruthy();
            expect(element.querySelector('.avatar-photo')).toBeNull();
        });

        it('should render filled upload state when photoData is provided', () => {
            host.variant.set('upload');
            host.photoData.set('data:image/jpeg;base64,mock');
            host.photoName.set('avatar.png');
            fixture.detectChanges();

            const element = fixture.nativeElement as HTMLElement;
            const photo = element.querySelector('.avatar-photo') as HTMLImageElement;
            expect(photo).toBeTruthy();
            expect(photo.src).toContain('data:image/jpeg;base64,mock');

            const fileName = element.querySelector('.file-name');
            expect(fileName?.textContent).toContain('avatar.png');

            const removeBtn = element.querySelector('[data-testid="remove-photo-btn"]') as HTMLButtonElement;
            expect(removeBtn).toBeTruthy();

            removeBtn.click();
            expect(host.removedCalled).toBeTrue();
        });

        it('should render photo error message and highlight upload box when photoError is provided', () => {
            host.variant.set('upload');
            host.photoError.set('La foto de perfil es requerida.');
            fixture.detectChanges();

            const element = fixture.nativeElement as HTMLElement;
            const errorMsg = element.querySelector('[data-testid="photo-error"]');
            expect(errorMsg).toBeTruthy();
            expect(errorMsg?.textContent).toContain('La foto de perfil es requerida.');

            const uploadBox = element.querySelector('.upload-box');
            expect(uploadBox?.classList.contains('upload-box-error')).toBeTrue();
        });
    });

    describe('Summary Variant', () => {
        it('should display trainer summary information', () => {
            host.variant.set('summary');
            host.fullName.set('Ash Ketchum');
            host.hobby.set('Entrenar Pokémon');
            host.age.set(18);
            host.document.set({ label: 'DUI', value: '12345678-9' });
            fixture.detectChanges();

            const element = fixture.nativeElement as HTMLElement;
            expect(element.querySelector('.trainer-name')?.textContent).toContain('Ash Ketchum');

            const rows = element.querySelectorAll('.info-row');
            expect(rows.length).toBe(3);
            expect(element.textContent).toContain('Entrenar Pokémon');
            expect(element.textContent).toContain('18 años');
            expect(element.textContent).toContain('12345678-9');
        });
    });

    describe('Profile Variant', () => {
        it('should render profile variant with badge and info', () => {
            host.variant.set('profile');
            host.hobby.set('Jugar Videojuegos');
            host.age.set(25);
            fixture.detectChanges();

            const element = fixture.nativeElement as HTMLElement;
            expect(element.querySelector('.badge-label')?.textContent).toContain('Entrenador');
            expect(element.querySelector('.badge-icon')).toBeTruthy();
            expect(element.textContent).toContain('Jugar Videojuegos');
            expect(element.textContent).toContain('25 años');
        });
    });
});
