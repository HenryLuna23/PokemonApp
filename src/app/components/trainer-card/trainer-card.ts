import { ChangeDetectionStrategy, Component, computed, ElementRef, input, output, viewChild } from '@angular/core';

export type TrainerCardVariant = 'upload' | 'summary' | 'profile';
export interface TrainerDocumentInfo {
    label: string;
    value: string;
}

@Component({
    selector: 'app-trainer-card',
    standalone: true,
    templateUrl: './trainer-card.html',
    styleUrl: './trainer-card.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainerCard {
    variant = input.required<TrainerCardVariant>();
    photoData = input<string | null>(null);
    photoName = input<string>('');
    fullName = input<string>('');
    hobby = input<string>('');
    age = input<number | null>(null);
    document = input<TrainerDocumentInfo | null>(null);
    photoError = input<string | null>(null);

    photoSelected = output<File>();
    photoRemoved = output<void>();

    private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

    protected readonly hasPhoto = computed(() => !!this.photoData());
    protected readonly showDocument = computed(() => !!this.document()?.value?.trim());

    protected triggerFileSelect(): void {
        if (this.variant() === 'upload' && !this.hasPhoto()) {
            this.fileInput()?.nativeElement.click();
        }
    }

    protected onFileChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const file = input.files[0];
            this.photoSelected.emit(file);
            input.value = '';
        }
    }

    protected removePhoto(event: MouseEvent): void {
        event.stopPropagation();
        this.photoRemoved.emit();
    }
}
