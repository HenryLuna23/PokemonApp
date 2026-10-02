import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { PokemonApi } from '../../services/pokemon-api/pokemon-api';
import { PokemonData } from '../../services/pokemon-data/pokemon-data';
import { TrainerData } from '../../services/trainer-data/trainer-data';
import { TrainerStorage } from '../../services/trainer-storage/trainer-storage';
import { Account } from '../../types/trainer/trainer';
import { TeamSelection } from './team-selection';

class MockTrainerStorage {
    private data: { profile: Account | null; teamIds: number[] } = {
        profile: {
            fullName: 'Ash Ketchum',
            hobby: 'Jugar Pokémon',
            birthdate: new Date(new Date().getFullYear() - 20, 4, 15),
            dni: '12345678-9',
            isAdult: true,
            photoData: 'data:image/png;base64,mock',
            photoName: 'ash.png',
        },
        teamIds: [],
    };

    read() {
        return this.data;
    }

    write(d: any) {
        this.data = d;
        return true;
    }

    clear() {
        this.data = { profile: null, teamIds: [] };
    }
}

describe('TeamSelection', () => {
    let component: TeamSelection;
    let fixture: ComponentFixture<TeamSelection>;
    let pokemonApiSpy: jasmine.SpyObj<PokemonApi>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        pokemonApiSpy = jasmine.createSpyObj('PokemonApi', ['getPokemonList', 'getPokemonDetail']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        const mockList = Array.from({ length: 12 }, (_, i) => ({
            name: `pokemon-${i + 1}`,
            url: `https://pokeapi.co/api/v2/pokemon/${i + 1}/`,
        }));

        pokemonApiSpy.getPokemonList.and.returnValue(
            of({
                count: 12,
                next: null,
                previous: null,
                results: mockList,
            }),
        );
        pokemonApiSpy.getPokemonDetail.and.returnValue(
            of({
                id: 1,
                name: 'pokemon-1',
                sprites: { front_default: 'p1.png' },
                types: [],
                stats: [],
            } as any),
        );

        await TestBed.configureTestingModule({
            imports: [TeamSelection],
            providers: [
                provideZonelessChangeDetection(),
                TrainerData,
                PokemonData,
                { provide: TrainerStorage, useClass: MockTrainerStorage },
                { provide: PokemonApi, useValue: pokemonApiSpy },
                { provide: Router, useValue: routerSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(TeamSelection);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component and render trainer card', () => {
        expect(component).toBeTruthy();
        const cardEl = fixture.nativeElement.querySelector('app-trainer-card');
        expect(cardEl).toBeTruthy();
        expect(cardEl.textContent).toContain('Ash Ketchum');
    });

    it('should render pokemon virtual scroll viewport and group in rows of 3', () => {
        const viewport = fixture.nativeElement.querySelector('cdk-virtual-scroll-viewport');
        expect(viewport).toBeTruthy();

        // 12 pokémon agrupados en filas de 3 equivalen a 4 filas
        const rows = component['pokemonRows']();
        expect(rows.length).toBe(4);
        expect(rows[0].length).toBe(3);
        expect(rows[0][0].name).toBe('pokemon-1');
    });

    it('should filter pokemon rows based on search query', () => {
        component['searchQuery'].set('pokemon-10');
        fixture.detectChanges();

        const filtered = component['filteredPokemon']();
        expect(filtered.length).toBe(1);
        expect(filtered[0].name).toBe('pokemon-10');

        const rows = component['pokemonRows']();
        expect(rows.length).toBe(1);
        expect(rows[0].length).toBe(1);
    });

    it('should persist pokemon selection immediately in trainerData for F5 persistence', () => {
        const trainerData = TestBed.inject(TrainerData);

        component['onTogglePokemon'](1);
        fixture.detectChanges();

        expect(component['selectedIds']()).toEqual([1]);
        expect(trainerData.teamIds()).toEqual([1]);

        // Removerlo debe persistir el arreglo vacío
        component['onTogglePokemon'](1);
        fixture.detectChanges();

        expect(component['selectedIds']()).toEqual([]);
        expect(trainerData.teamIds()).toEqual([]);
    });

    it('should allow selecting up to 3 pokemon and enable save button', () => {
        const saveBtn = fixture.nativeElement.querySelector('[data-testid="save-team-btn"]') as HTMLButtonElement;
        expect(saveBtn.disabled).toBeTrue();

        component['onTogglePokemon'](1);
        component['onTogglePokemon'](2);
        fixture.detectChanges();
        expect(component['selectedIds']().length).toBe(2);
        expect(saveBtn.disabled).toBeTrue();

        component['onTogglePokemon'](3);
        fixture.detectChanges();
        expect(component['selectedIds']().length).toBe(3);
        expect(saveBtn.disabled).toBeFalse();

        // No debe permitir seleccionar un 4to pokémon
        component['onTogglePokemon'](4);
        fixture.detectChanges();
        expect(component['selectedIds']().length).toBe(3);
    });

    it('should navigate back to /new-user when onBack is called', () => {
        component['onBack']();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/new-user']);
    });
});


