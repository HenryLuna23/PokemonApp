import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Account } from '../../types/trainer/trainer';
import { calculateAge } from '../../utils/age/age';

export interface TrainerFormOutput {
    fullName: string;
    hobby?: string;
    birthdate: Date;
    dni: string;
    isAdult: boolean;
}

export const HOBBY_OPTIONS: readonly string[] = ['Jugar Fútbol', 'Jugar Básquetbol', 'Jugar Tenis', 'Jugar Voleibol', 'Jugar FIFA', 'Jugar Videojuegos'];

/** Maximum date validation in the calendar */
export function notFutureDateValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const [year, month, day] = control.value.split('-').map(Number);
    if (!year || !month || !day) return null;
    const inputDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return inputDate > today ? { futureDate: true } : null;
}

@Component({
    selector: 'app-trainer-form',
    standalone: true,
    imports: [ReactiveFormsModule],
    templateUrl: './trainer-form.html',
    styleUrl: './trainer-form.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainerForm {
    private readonly fb = inject(FormBuilder).nonNullable;
    private readonly destroyRef = inject(DestroyRef);

    /** data trainer if exist */
    readonly initialAccount = input<Account | null>(null);

    /** Indicates whether a photo has been uploaded to the trainer card.*/
    readonly hasPhoto = input<boolean>(false);

    /** error message in the photo */
    readonly photoError = input<string | null>(null);

    /** check photo is required */
    readonly photoRequired = output<void>();

    /** listener when the form is valid */
    readonly formValidityChange = output<boolean>();

    /** Event emitted when the form is valid */
    readonly formSubmit = output<TrainerFormOutput>();

    /** options for the hobby */
    protected readonly hobbyOptions = HOBBY_OPTIONS;

    /** maximum date allowed in the calendar (today in local format YYYY-MM-DD) */
    protected readonly maxDate = (() => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    })();

    /** Signal that tracks the current value of birthdate in the form */
    protected readonly birthdateValue = signal<string>('');

    /** Calculated age reactively from the birthdate */
    protected readonly age = computed<number | null>(() => {
        return calculateAge(this.birthdateValue());
    });

    /** Indicates whether the user is an adult (>= 18 years old) */
    protected readonly isAdult = computed<boolean>(() => {
        const calculatedAge = this.age();
        return calculatedAge === null ? true : calculatedAge >= 18;
    });

    /** Dynamic label for the document */
    protected readonly documentLabel = computed<string>(() => {
        return this.isAdult() ? 'Documento*' : 'Carnet de minoridad';
    });

    /** Dynamic placeholder for the document */
    protected readonly documentPlaceholder = computed<string>(() => {
        return this.isAdult() ? 'Documento*' : 'Carnet de minoridad (opcional)';
    });

    /** typed reactive form */
    protected readonly form = this.fb.group({
        fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(60)]],
        hobby: [''],
        birthdate: ['', [Validators.required, notFutureDateValidator]],
        dni: ['', [Validators.required, Validators.pattern(/^\d{8}-\d$/)]],
    });

    /** Signal que indica si el formulario es válido en su totalidad */
    protected readonly isFormValid = signal<boolean>(false);

    /** Message effective to show when the photo is missing */
    protected readonly effectivePhotoError = computed<string | null>(() => {
        if (this.hasPhoto()) return null;
        if (this.photoError()) return this.photoError();
        // If the text fields are already valid but the photo is missing
        if (this.isFormValid()) return 'La foto de perfil es requerida para continuar.';
        return null;
    });

    /** State of enabling the Continue button (valid form + photo loaded) */
    protected readonly canSubmit = computed<boolean>(() => {
        return this.isFormValid() && this.hasPhoto();
    });

    constructor() {
        // Escuchar cambios de fecha para actualizar la edad y ajustar validaciones del DUI
        this.form.controls.birthdate.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((val) => {
            this.birthdateValue.set(val);
            this.updateDniValidators();
        });

        // Escuchar estado de validez general del formulario
        this.form.statusChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            const valid = this.form.valid;
            this.isFormValid.set(valid);
            this.formValidityChange.emit(valid);
        });

        // Sincronizar datos iniciales si existen
        effect(() => {
            const initial = this.initialAccount();
            if (initial) this.populateInitial(initial);
        });
    }

    /** Aplica formato automático de guión al DUI cuando el usuario escribe */
    protected onDniInput(event: Event): void {
        const inputElement = event.target as HTMLInputElement;
        let value = inputElement.value.replace(/\D/g, ''); // Solo dígitos

        if (this.isAdult()) {
            if (value.length > 9) {
                value = value.substring(0, 9);
            }
            if (value.length > 8) {
                value = `${value.substring(0, 8)}-${value.substring(8)}`;
            }
            this.form.controls.dni.setValue(value);
            inputElement.value = value;
        } else {
            this.form.controls.dni.setValue(inputElement.value);
        }

        const valid = this.form.valid;
        this.isFormValid.set(valid);
        this.formValidityChange.emit(valid);
    }

    /** Retorna el mensaje de error correspondiente a un campo si ha sido tocado e inválido */
    formErrors(field: string): string | null {
        const control = this.form.get(field);
        if (!control || !control.touched || !control.errors) return null;

        const errorMessages: Record<string, Record<string, string>> = {
            fullName: {
                required: 'El nombre es obligatorio.',
                minlength: 'Debe tener al menos 2 caracteres.',
                maxlength: 'Máximo alcanzado.',
            },
            birthdate: {
                required: 'La fecha de nacimiento es obligatoria.',
                futureDate: 'La fecha no puede ser futura.',
            },
            dni: {
                required: 'El documento es obligatorio para mayores de edad.',
                pattern: 'Formato de DUI inválido (ej. 00000000-0).',
            },
        };

        for (const error in control.errors) {
            if (errorMessages[field]?.[error]) {
                return errorMessages[field][error];
            }
        }

        return null;
    }

    /** Abre el selector nativo de fecha */
    protected openDatePicker(dateInput: HTMLInputElement): void {
        if (typeof dateInput.showPicker === 'function') {
            dateInput.showPicker();
        } else {
            dateInput.focus();
        }
    }

    /** Procesa el envío del formulario */
    protected onSubmit(): void {
        if (!this.form.valid) {
            this.form.markAllAsTouched();
            if (!this.hasPhoto()) {
                this.photoRequired.emit();
            }
            return;
        }

        if (!this.hasPhoto()) {
            this.photoRequired.emit();
            return;
        }

        const { fullName, hobby, birthdate, dni } = this.form.getRawValue();
        const [year, month, day] = birthdate.split('-').map(Number);
        const birthdateObj = new Date(year, month - 1, day);

        this.formSubmit.emit({
            fullName: fullName.trim(),
            hobby: hobby.trim() || undefined,
            birthdate: birthdateObj,
            dni: dni.trim(),
            isAdult: this.isAdult(),
        });
    }

    /** Actualiza las reglas de validación del documento según la edad calculada */
    private updateDniValidators(): void {
        const dniControl = this.form.controls.dni;
        this.isAdult() ? dniControl.setValidators([Validators.required, Validators.pattern(/^\d{8}-\d$/)]) : dniControl.clearValidators();
        dniControl.updateValueAndValidity({ emitEvent: false });
        const valid = this.form.valid;
        this.isFormValid.set(valid);
        this.formValidityChange.emit(valid);
    }

    /** Puebla el formulario con los datos iniciales */
    private populateInitial(account: Account): void {
        const date = new Date(account.birthdate);
        const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

        this.form.patchValue({
            fullName: account.fullName,
            hobby: account.hobby ?? '',
            birthdate: formattedDate,
            dni: account.dni,
        });
        this.birthdateValue.set(formattedDate);
        this.updateDniValidators();
    }
}
