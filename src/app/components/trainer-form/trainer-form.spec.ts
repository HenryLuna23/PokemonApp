import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Account } from '../../types/trainer/trainer';
import { TrainerForm, TrainerFormOutput } from './trainer-form';

@Component({
    standalone: true,
    imports: [TrainerForm],
    template: `
        <app-trainer-form
            [initialAccount]="initialAccount()"
            [hasPhoto]="hasPhoto()"
            [photoError]="photoError()"
            (photoRequired)="onPhotoRequired()"
            (formSubmit)="onSubmit($event)"
        />
    `,
})
class TestHostComponent {
    readonly initialAccount = signal<Account | null>(null);
    readonly hasPhoto = signal<boolean>(false);
    readonly photoError = signal<string | null>(null);
    lastSubmitted: TrainerFormOutput | null = null;
    photoRequiredCalled = false;

    onPhotoRequired(): void {
        this.photoRequiredCalled = true;
    }

    onSubmit(data: TrainerFormOutput): void {
        this.lastSubmitted = data;
    }
}

describe('TrainerForm', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let host: TestHostComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TestHostComponent],
            providers: [provideZonelessChangeDetection()],
        }).compileComponents();

        fixture = TestBed.createComponent(TestHostComponent);
        host = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should initialize with submit button disabled when empty', () => {
        const submitBtn = fixture.nativeElement.querySelector('[data-testid="continue-btn"]') as HTMLButtonElement;
        expect(submitBtn.disabled).toBeTrue();
    });

    it('should return error messages with formErrors when controls are touched and invalid', () => {
        const formComponent = fixture.debugElement.children[0].componentInstance as TrainerForm;
        expect(formComponent.formErrors('fullName')).toBeNull();

        const fullNameControl = formComponent['form'].controls.fullName;
        fullNameControl.markAsTouched();
        expect(formComponent.formErrors('fullName')).toBe('El nombre es obligatorio.');

        fullNameControl.setValue('A');
        expect(formComponent.formErrors('fullName')).toBe('Debe tener al menos 2 caracteres.');

        fullNameControl.setValue('Ash Ketchum');
        expect(formComponent.formErrors('fullName')).toBeNull();
    });

    it('should require DUI format for adults (age >= 18)', () => {
        const fullNameInput = fixture.nativeElement.querySelector('#full-name') as HTMLInputElement;
        const birthdateInput = fixture.nativeElement.querySelector('#birthdate') as HTMLInputElement;
        const docInput = fixture.nativeElement.querySelector('#document') as HTMLInputElement;

        fullNameInput.value = 'Ash Ketchum';
        fullNameInput.dispatchEvent(new Event('input'));

        // Nacimiento hace 20 años
        const adultYear = new Date().getFullYear() - 20;
        birthdateInput.value = `${adultYear}-05-15`;
        birthdateInput.dispatchEvent(new Event('input'));

        fixture.detectChanges();

        expect(docInput.placeholder).toContain('Documento*');

        // DUI con formato incompleto
        docInput.value = '12345678';
        docInput.dispatchEvent(new Event('input'));
        fixture.detectChanges();

        const submitBtn = fixture.nativeElement.querySelector('[data-testid="continue-btn"]') as HTMLButtonElement;
        expect(submitBtn.disabled).toBeTrue();

        // DUI con 9 dígitos continuos (formateo automático y activación de error de foto)
        docInput.value = '123456789';
        docInput.dispatchEvent(new Event('input'));
        fixture.detectChanges();

        expect(docInput.value).toBe('12345678-9');
        // El botón sigue deshabilitado porque falta la foto
        expect(submitBtn.disabled).toBeTrue();

        // Muestra el mensaje de que la foto es requerida
        const errorEl = fixture.nativeElement.querySelector('[data-testid="form-photo-error"]');
        expect(errorEl).toBeTruthy();
        expect(errorEl?.textContent).toContain('La foto de perfil es requerida');

        // Al agregar foto se habilita
        host.hasPhoto.set(true);
        fixture.detectChanges();
        expect(submitBtn.disabled).toBeFalse();
    });

    it('should allow empty document for minors (age < 18)', () => {
        const fullNameInput = fixture.nativeElement.querySelector('#full-name') as HTMLInputElement;
        const birthdateInput = fixture.nativeElement.querySelector('#birthdate') as HTMLInputElement;
        const docInput = fixture.nativeElement.querySelector('#document') as HTMLInputElement;

        fullNameInput.value = 'Misty Waterflower';
        fullNameInput.dispatchEvent(new Event('input'));

        // Menor de 15 años
        const minorYear = new Date().getFullYear() - 15;
        birthdateInput.value = `${minorYear}-05-15`;
        birthdateInput.dispatchEvent(new Event('input'));

        fixture.detectChanges();

        expect(docInput.placeholder).toContain('Carnet de minoridad');

        const submitBtn = fixture.nativeElement.querySelector('[data-testid="continue-btn"]') as HTMLButtonElement;
        // Sigue deshabilitado porque falta la foto
        expect(submitBtn.disabled).toBeTrue();

        // Al agregar foto se habilita
        host.hasPhoto.set(true);
        fixture.detectChanges();
        expect(submitBtn.disabled).toBeFalse();
    });

    it('should emit formSubmit with correct data on valid submit with photo', () => {
        const fullNameInput = fixture.nativeElement.querySelector('#full-name') as HTMLInputElement;
        const hobbyInput = fixture.nativeElement.querySelector('#hobby') as HTMLInputElement;
        const birthdateInput = fixture.nativeElement.querySelector('#birthdate') as HTMLInputElement;
        const docInput = fixture.nativeElement.querySelector('#document') as HTMLInputElement;

        fullNameInput.value = 'Red Pallet';
        fullNameInput.dispatchEvent(new Event('input'));

        hobbyInput.value = 'Jugar Videojuegos';
        hobbyInput.dispatchEvent(new Event('input'));

        const adultYear = new Date().getFullYear() - 22;
        birthdateInput.value = `${adultYear}-01-10`;
        birthdateInput.dispatchEvent(new Event('input'));

        docInput.value = '87654321-0';
        docInput.dispatchEvent(new Event('input'));

        host.hasPhoto.set(true);
        fixture.detectChanges();

        const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
        form.dispatchEvent(new Event('submit'));

        expect(host.lastSubmitted).toBeTruthy();
        expect(host.lastSubmitted?.fullName).toBe('Red Pallet');
        expect(host.lastSubmitted?.hobby).toBe('Jugar Videojuegos');
        expect(host.lastSubmitted?.dni).toBe('87654321-0');
        expect(host.lastSubmitted?.isAdult).toBeTrue();
    });

    it('should restrict calendar date to not exceed current date via max attribute and validator', () => {
        const birthdateInput = fixture.nativeElement.querySelector('#birthdate') as HTMLInputElement;
        const formComponent = fixture.debugElement.children[0].componentInstance as TrainerForm;

        expect(birthdateInput.getAttribute('max')).toBeTruthy();
        expect(birthdateInput.getAttribute('max')).toBe(formComponent['maxDate']);

        // Intentar ingresar fecha futura
        const futureYear = new Date().getFullYear() + 1;
        birthdateInput.value = `${futureYear}-01-01`;
        birthdateInput.dispatchEvent(new Event('input'));
        formComponent['form'].controls.birthdate.markAsTouched();
        fixture.detectChanges();

        expect(formComponent.formErrors('birthdate')).toBe('La fecha no puede ser futura.');
    });
});
