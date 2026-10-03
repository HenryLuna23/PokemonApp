import { provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { PokemonData } from '../../services/pokemon-data/pokemon-data';
import { TrainerData } from '../../services/trainer-data/trainer-data';
import { Pokemon } from '../../types/pokemon/pokemon';
import { Profile } from './profile';

describe('Profile', () => {
    let fixture: ComponentFixture<Profile>;
    let component: Profile;
    let router: jasmine.SpyObj<Router>;
    let trainerDataMock: jasmine.SpyObj<TrainerData>;
    let pokemonDataMock: jasmine.SpyObj<PokemonData>;

    const mockProfile = {
        fullName: 'José Hernández',
        hobby: 'Ver Series',
        birthdate: new Date('1998-05-15'),
        dni: '05634225-1',
        isAdult: true,
        photoData: 'data:image/png;base64,mock',
        photoName: 'jose.png',
    };

    const mockPokemon: Pokemon = {
        id: 1,
        name: 'bulbasaur',
        base_experience: 64,
        height: 7,
        is_default: true,
        order: 1,
        weight: 69,
        abilities: [],
        forms: [],
        game_indices: [],
        held_items: [],
        location_area_encounters: '',
        moves: [],
        species: { name: 'bulbasaur', url: '' },
        sprites: {
            front_default: 'https://img/1.png',
            back_default: null,
            back_female: null,
            back_shiny: null,
            back_shiny_female: null,
            front_female: null,
            front_shiny: null,
            front_shiny_female: null,
            other: {
                home: {
                    front_default: 'https://img/home/1.png',
                },
            },
        },
        cries: {
            latest: 'https://pokemon-cries/1.ogg',
            legacy: 'https://pokemon-cries/1-legacy.ogg',
        },
        stats: [
            { base_stat: 45, effort: 0, stat: { name: 'hp', url: '' } },
            { base_stat: 49, effort: 0, stat: { name: 'attack', url: '' } },
            { base_stat: 49, effort: 0, stat: { name: 'defense', url: '' } },
            { base_stat: 65, effort: 1, stat: { name: 'special-attack', url: '' } },
            { base_stat: 65, effort: 0, stat: { name: 'special-defense', url: '' } },
            { base_stat: 45, effort: 0, stat: { name: 'speed', url: '' } },
        ],
        types: [
            { slot: 1, type: { name: 'grass', url: '' } },
            { slot: 2, type: { name: 'poison', url: '' } },
        ],
    };

    beforeEach(async () => {
        const detailsMap = new Map<number, Pokemon>();
        detailsMap.set(1, mockPokemon);

        router = jasmine.createSpyObj<Router>('Router', ['navigate']);
        trainerDataMock = {
            profile: signal(mockProfile),
            teamIds: signal([1]),
            hasProfile: signal(true),
            hasCompleteTeam: signal(true),
        } as unknown as jasmine.SpyObj<TrainerData>;

        pokemonDataMock = {
            detailsCache: signal(detailsMap),
            loadInitialList: jasmine.createSpy('loadInitialList'),
            loadDetails: jasmine.createSpy('loadDetails'),
        } as unknown as jasmine.SpyObj<PokemonData>;

        await TestBed.configureTestingModule({
            imports: [Profile],
            providers: [
                provideZonelessChangeDetection(),
                { provide: Router, useValue: router },
                { provide: TrainerData, useValue: trainerDataMock },
                { provide: PokemonData, useValue: pokemonDataMock },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(Profile);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should render greeting title with trainer first name', () => {
        const title = fixture.nativeElement.querySelector('.greeting-title');
        expect(title?.textContent).toContain('¡Hola José!');
    });

    it('should navigate to /new-user when clicking Editar perfil', () => {
        const editProfileBtn = fixture.nativeElement.querySelector('[data-testid="edit-profile-btn"]') as HTMLButtonElement;
        expect(editProfileBtn).toBeTruthy();

        editProfileBtn.click();
        expect(router.navigate).toHaveBeenCalledWith(['/new-user']);
    });

    it('should navigate to /team when clicking Editar team', () => {
        const editTeamBtn = fixture.nativeElement.querySelector('[data-testid="edit-team-btn"]') as HTMLButtonElement;
        expect(editTeamBtn).toBeTruthy();

        editTeamBtn.click();
        expect(router.navigate).toHaveBeenCalledWith(['/team']);
    });

    it('should render trainer card with profile variant and data', () => {
        const trainerCard = fixture.nativeElement.querySelector('app-trainer-card');
        expect(trainerCard).toBeTruthy();
        expect(fixture.nativeElement.textContent).toContain('Ver Series');
        expect(fixture.nativeElement.textContent).toContain('05634225-1');
    });

    it('should calculate stat percentages according to the official maximum limits', () => {
        const stats = (component as unknown as { getStatsList(p: Pokemon): { label: string; value: number; maxValue: number; percentage: number }[] }).getStatsList(mockPokemon);

        const hpStat = stats.find((s) => s.label === 'HP');
        expect(hpStat?.maxValue).toBe(255);
        expect(hpStat?.percentage).toBe(Math.round((45 / 255) * 100)); // 18%

        const atkStat = stats.find((s) => s.label === 'Ataque');
        expect(atkStat?.maxValue).toBe(190);
        expect(atkStat?.percentage).toBe(Math.round((49 / 190) * 100)); // 26%

        const defStat = stats.find((s) => s.label === 'Defensa');
        expect(defStat?.maxValue).toBe(230);
        expect(defStat?.percentage).toBe(Math.round((49 / 230) * 100)); // 21%

        const spAtkStat = stats.find((s) => s.label === 'Ataque Especial');
        expect(spAtkStat?.maxValue).toBe(194);
        expect(spAtkStat?.percentage).toBe(Math.round((65 / 194) * 100)); // 34%

        const spDefStat = stats.find((s) => s.label === 'Defensa Especial');
        expect(spDefStat?.maxValue).toBe(230);
        expect(spDefStat?.percentage).toBe(Math.round((65 / 230) * 100)); // 28%

        const speedStat = stats.find((s) => s.label === 'Velocidad');
        expect(speedStat?.maxValue).toBe(180);
        expect(speedStat?.percentage).toBe(Math.round((45 / 180) * 100)); // 25%
    });

    it('should render pokemon cards using responsive view (swiper or list)', () => {
        const container = fixture.nativeElement.querySelector('.pokemon-cards-container');
        expect(container).toBeTruthy();

        const detailCard = fixture.nativeElement.querySelector('[data-testid="pokemon-detail-1"]');
        expect(detailCard).toBeTruthy();
    });

    it('should render sound and shine action buttons for each pokemon', () => {
        const soundBtn = fixture.nativeElement.querySelector('[data-testid="sound-btn-1"]');
        const shineBtn = fixture.nativeElement.querySelector('[data-testid="shine-btn-1"]');

        expect(soundBtn).toBeTruthy();
        expect(shineBtn).toBeTruthy();
    });

    it('should activate shiny version for 3 seconds and then revert automatically', () => {
        jasmine.clock().install();

        const shineBtn = fixture.nativeElement.querySelector('[data-testid="shine-btn-1"]') as HTMLButtonElement;
        expect((component as any).isShiny(1)).toBeFalse();

        shineBtn.click();
        fixture.detectChanges();

        expect((component as any).isShiny(1)).toBeTrue();

        // Avanzar el reloj 2900ms (sigue siendo shiny)
        jasmine.clock().tick(2900);
        fixture.detectChanges();
        expect((component as any).isShiny(1)).toBeTrue();

        // Avanzar 200ms más (total > 3000ms)
        jasmine.clock().tick(200);
        fixture.detectChanges();
        expect((component as any).isShiny(1)).toBeFalse();

        jasmine.clock().uninstall();
    });

    it('should attempt to play audio cry when clicking sound button', () => {
        const soundBtn = fixture.nativeElement.querySelector('[data-testid="sound-btn-1"]') as HTMLButtonElement;
        expect(soundBtn).toBeTruthy();

        // Spy on Audio constructor or play
        const audioSpy = spyOn(window, 'Audio').and.returnValue({
            volume: 0,
            play: () => Promise.resolve(),
            pause: () => {},
        } as unknown as HTMLAudioElement);

        soundBtn.click();
        expect(audioSpy).toHaveBeenCalled();
    });
});
