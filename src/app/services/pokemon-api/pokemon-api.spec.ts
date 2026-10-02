import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PokemonApi } from './pokemon-api';
import { NamedAPIResourceList, Pokemon } from '../../types/pokemon/pokemon';

describe('PokemonApi', () => {
    let service: PokemonApi;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideZonelessChangeDetection(),
                provideHttpClient(),
                provideHttpClientTesting(),
                PokemonApi,
            ],
        });

        service = TestBed.inject(PokemonApi);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should fetch pokemon list with default limit of 151', () => {
        const mockResponse: NamedAPIResourceList = {
            count: 151,
            next: null,
            previous: null,
            results: [{ name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' }],
        };

        service.getPokemonList().subscribe((data) => {
            expect(data.results.length).toBe(1);
            expect(data.results[0].name).toBe('bulbasaur');
        });

        const req = httpMock.expectOne('https://pokeapi.co/api/v2/pokemon?limit=151');
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);
    });

    it('should fetch pokemon detail by id', () => {
        const mockPokemon = { id: 1, name: 'bulbasaur' } as Pokemon;

        service.getPokemonDetail(1).subscribe((data) => {
            expect(data.id).toBe(1);
            expect(data.name).toBe('bulbasaur');
        });

        const req = httpMock.expectOne('https://pokeapi.co/api/v2/pokemon/1');
        expect(req.request.method).toBe('GET');
        req.flush(mockPokemon);
    });
});
