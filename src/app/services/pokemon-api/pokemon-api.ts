import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NamedAPIResourceList, Pokemon } from '../../types/pokemon/pokemon';

@Injectable({
    providedIn: 'root',
})
export class PokemonApi {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = 'https://pokeapi.co/api/v2';

    /**
     * get list of pokemon names and urls
     */
    getPokemonList(limit = 151): Observable<NamedAPIResourceList> {
        return this.http.get<NamedAPIResourceList>(`${this.baseUrl}/pokemon?limit=${limit}`);
    }

    /**
     * get details of pokemon by name or id
     */
    getPokemonDetail(idOrName: string | number): Observable<Pokemon> {
        return this.http.get<Pokemon>(`${this.baseUrl}/pokemon/${idOrName}`);
    }
}
