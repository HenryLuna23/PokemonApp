import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, forkJoin, of } from 'rxjs';
import { Pokemon, PokemonListItem } from '../../types/pokemon/pokemon';
import { PokemonApi } from '../pokemon-api/pokemon-api';

@Injectable({
    providedIn: 'root',
})
export class PokemonData {
    private readonly pokemonApi = inject(PokemonApi);

    /** List 151 pokemon */
    private readonly _pokemonList = signal<PokemonListItem[]>([]);
    readonly pokemonList = this._pokemonList.asReadonly();

    /** details of pokemon */
    private readonly _detailsCache = signal<Map<number, Pokemon>>(new Map());
    readonly detailsCache = this._detailsCache.asReadonly();

    /** isLoading */
    private readonly _isLoading = signal<boolean>(false);
    readonly isLoading = this._isLoading.asReadonly();

    /** isLoadingDetails */
    private readonly _isLoadingDetails = signal<boolean>(false);
    readonly isLoadingDetails = this._isLoadingDetails.asReadonly();

    /** error */
    private readonly _error = signal<string | null>(null);
    readonly error = this._error.asReadonly();

    /** hasList */
    readonly hasList = computed(() => this._pokemonList().length > 0);

    /**
     * load pokemon list 151
     */
    loadInitialList(): void {
        if (this.hasList() || this._isLoading()) return;

        this._isLoading.set(true);
        this._error.set(null);

        this.pokemonApi.getPokemonList(151).subscribe({
            next: (res) => {
                const items: PokemonListItem[] = res.results.map((item) => {
                    const idString = item.url.split('/').filter(Boolean).pop() ?? '0';
                    return {
                        id: parseInt(idString, 10),
                        name: item.name,
                        url: item.url,
                    };
                });
                this._pokemonList.set(items);
                this._isLoading.set(false);
                this.loadDetails(items.slice(0, 9).map((i) => i.id));
            },
            error: (err) => {
                console.error('Error al cargar lista de Pokémon', err);
                this._error.set('No se pudo cargar la lista de Pokémon. Intenta de nuevo.');
                this._isLoading.set(false);
            },
        });
    }

    /**
     * load details of pokemon
     */
    loadDetails(ids: number[]): void {
        const currentCache = this._detailsCache();
        const uncachedIds = ids.filter((id) => !currentCache.has(id));

        if (uncachedIds.length === 0) return;

        this._isLoadingDetails.set(true);

        const requests = uncachedIds.map((id) => {
            const req$ = this.pokemonApi.getPokemonDetail(id);
            return req$
                ? req$.pipe(
                    catchError((err) => {
                        console.error(`Error al cargar Pokémon #${id}`, err);
                        return of(null);
                    }),
                )
                : of(null);
        });

        forkJoin(requests).subscribe({
            next: (results) => {
                const updatedMap = new Map(this._detailsCache());
                for (const pokemon of results) {
                    if (pokemon) updatedMap.set(pokemon.id, pokemon);
                }
                this._detailsCache.set(updatedMap);
                this._isLoadingDetails.set(false);
            },
            error: () => {
                this._isLoadingDetails.set(false);
            },
        });
    }

    /**
     * get details of pokemon by id
     */
    getDetails(id: number): Pokemon | null {
        return this._detailsCache().get(id) ?? null;
    }
}
