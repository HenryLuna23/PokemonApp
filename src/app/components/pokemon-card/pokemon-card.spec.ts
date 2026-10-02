import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Pokemon, PokemonListItem } from '../../types/pokemon/pokemon';
import { PokemonCard } from './pokemon-card';

@Component({
    standalone: true,
    imports: [PokemonCard],
    template: `
        <app-pokemon-card
            [item]="item()"
            [details]="details()"
            [selected]="selected()"
            [disabled]="disabled()"
            (toggle)="onToggle($event)"
        />
    `,
})
class TestHostComponent {
    readonly item = signal<PokemonListItem>({ id: 1, name: 'bulbasaur', url: '' });
    readonly details = signal<Pokemon | null>(null);
    readonly selected = signal<boolean>(false);
    readonly disabled = signal<boolean>(false);
    lastToggledId: number | null = null;

    onToggle(id: number) {
        this.lastToggledId = id;
    }
}

describe('PokemonCard', () => {
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

    it('should display formatted ID and name', () => {
        const idEl = fixture.nativeElement.querySelector('.pokemon-id');
        const nameEl = fixture.nativeElement.querySelector('.pokemon-name');

        expect(idEl.textContent).toContain('#001');
        expect(nameEl.textContent).toContain('bulbasaur');
    });

    it('should emit toggle when clicked and not disabled', () => {
        const cardEl = fixture.nativeElement.querySelector('.pokemon-card') as HTMLElement;
        cardEl.click();

        expect(host.lastToggledId).toBe(1);
    });

    it('should not emit toggle when disabled and not selected', () => {
        host.disabled.set(true);
        fixture.detectChanges();

        const cardEl = fixture.nativeElement.querySelector('.pokemon-card') as HTMLElement;
        cardEl.click();

        expect(host.lastToggledId).toBeNull();
    });

    it('should emit toggle if already selected even when disabled', () => {
        host.selected.set(true);
        host.disabled.set(true);
        const cardEl = fixture.nativeElement.querySelector('.pokemon-card') as HTMLElement;
        cardEl.click();

        expect(host.lastToggledId).toBe(1);
    });

    it('should use the sprite from subnode other.home.front_default', () => {
        host.details.set({
            id: 1,
            name: 'bulbasaur',
            sprites: {
                front_default: 'default.png',
                other: {
                    home: {
                        front_default: 'https://pokeapi.co/home/1.png',
                    },
                },
            } as any,
        } as Pokemon);
        fixture.detectChanges();

        const imgEl = fixture.nativeElement.querySelector('.pokemon-sprite') as HTMLImageElement;
        expect(imgEl.src).toBe('https://pokeapi.co/home/1.png');
    });
});
