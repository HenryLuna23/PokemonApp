import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { NamedAPIResourceList, Pokemon } from '../../types/pokemon/pokemon';
import { PokemonApi } from '../pokemon-api/pokemon-api';
import { PokemonData } from './pokemon-data';

describe('PokemonData', () => {
    let service: PokemonData;
    let apiSpy: jasmine.SpyObj<PokemonApi>;

    beforeEach(() => {
        apiSpy = jasmine.createSpyObj('PokemonApi', ['getPokemonList', 'getPokemonDetail']);
        apiSpy.getPokemonDetail.and.returnValue(of(null as any));

        TestBed.configureTestingModule({
            providers: [
                provideZonelessChangeDetection(),
                PokemonData,
                { provide: PokemonApi, useValue: apiSpy },
            ],
        });

        service = TestBed.inject(PokemonData);
    });

    it('should initialize with empty state', () => {
        expect(service.pokemonList()).toEqual([]);
        expect(service.isLoading()).toBeFalse();
        expect(service.hasList()).toBeFalse();
        expect(service.error()).toBeNull();
    });

    it('should load initial list and parse IDs correctly', () => {
        const mockList: NamedAPIResourceList = {
            count: 2,
            next: null,
            previous: null,
            results: [
                { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
                { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
            ],
        };
        apiSpy.getPokemonList.and.returnValue(of(mockList));

        service.loadInitialList();

        expect(service.isLoading()).toBeFalse();
        expect(service.hasList()).toBeTrue();
        expect(service.pokemonList().length).toBe(2);
        expect(service.pokemonList()[0]).toEqual({
            id: 1,
            name: 'bulbasaur',
            url: 'https://pokeapi.co/api/v2/pokemon/1/',
        });
    });

    it('should set error signal if loading fails', () => {
        apiSpy.getPokemonList.and.returnValue(throwError(() => new Error('Network error')));

        service.loadInitialList();

        expect(service.isLoading()).toBeFalse();
        expect(service.error()).toBeTruthy();
    });

    it('should load details and store them in cache map', () => {
        const mockPokemon = { id: 25, name: 'pikachu' } as Pokemon;
        apiSpy.getPokemonDetail.and.returnValue(of(mockPokemon));

        service.loadDetails([25]);

        expect(service.getDetails(25)).toEqual(mockPokemon);
        expect(service.detailsCache().has(25)).toBeTrue();
    });
});
