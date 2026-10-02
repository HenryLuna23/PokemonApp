import { ScrollingModule } from '@angular/cdk/scrolling';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PokemonCard } from '../../components/pokemon-card/pokemon-card';
import { TrainerCard, TrainerDocumentInfo } from '../../components/trainer-card/trainer-card';
import { LoadingService } from '../../services/loading/loading';
import { PokemonData } from '../../services/pokemon-data/pokemon-data';
import { TrainerData } from '../../services/trainer-data/trainer-data';
import { PokemonListItem } from '../../types/pokemon/pokemon';
import { calculateAge } from '../../utils/age/age';

@Component({
    selector: 'app-team-selection',
    standalone: true,
    imports: [TrainerCard, PokemonCard, ScrollingModule],
    templateUrl: './team-selection.html',
    styleUrl: './team-selection.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamSelection {
    protected readonly trainerData = inject(TrainerData);
    protected readonly pokemonData = inject(PokemonData);
    private readonly loading = inject(LoadingService);
    private readonly router = inject(Router);

    /** Número de columnas para la cuadrícula */
    readonly columns = 3;

    /** Altura estimada de cada fila en el Virtual Scroll */
    readonly itemRowSize = 195;

    /** Perfil del entrenador obtenido del estado reactivo */
    protected readonly profile = this.trainerData.profile;

    /** IDs de los pokémon seleccionados para el equipo (máx 3) */
    protected readonly selectedIds = signal<number[]>(this.trainerData.teamIds());

    /** Search filter text */
    protected readonly searchQuery = signal<string>('');

    /** age trainer pkmn */
    protected readonly trainerAge = computed<number | null>(() => {
        const profile = this.profile();
        return calculateAge(profile?.birthdate);
    });

    /** Documento formateado con su etiqueta (DUI o Carnet) */
    protected readonly trainerDocument = computed<TrainerDocumentInfo | null>(() => {
        const profile = this.profile();
        if (!profile || !profile.dni) return null;
        return {
            label: profile.isAdult ? 'DUI' : 'Carnet',
            value: profile.dni,
        };
    });

    /** Lista de pokémon filtrada por nombre o ID en los 151 */
    protected readonly filteredPokemon = computed(() => {
        const query = this.searchQuery().trim().toLowerCase();
        const list = this.pokemonData.pokemonList();

        if (!query) return list;

        return list.filter((p) => {
            return p.name.toLowerCase().includes(query) || String(p.id).includes(query);
        });
    });

    /** Rows of 3 grouped Pokémon for the virtual scroll. */
    protected readonly pokemonRows = computed<PokemonListItem[][]>(() => {
        const list = this.filteredPokemon();
        const rows: PokemonListItem[][] = [];
        for (let i = 0; i < list.length; i += this.columns) {
            rows.push(list.slice(i, i + this.columns));
        }
        return rows;
    });

    /** max pokemon selected */
    protected readonly isMaxSelected = computed(() => {
        return this.selectedIds().length >= 3;
    });

    /** can save */
    protected readonly canSave = computed(() => {
        return this.selectedIds().length === 3;
    });

    constructor() {
        this.pokemonData.loadInitialList();
    }

    /** text input */
    protected onSearchInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.searchQuery.set(input.value);

        const firstResults = this.filteredPokemon().slice(0, 15);
        if (firstResults.length > 0) {
            this.pokemonData.loadDetails(firstResults.map((p) => p.id));
        }
    }

    /** Clear search input */
    protected clearSearch(): void {
        this.searchQuery.set('');
        const firstResults = this.pokemonData.pokemonList().slice(0, 15);
        if (firstResults.length > 0) {
            this.pokemonData.loadDetails(firstResults.map((p) => p.id));
        }
    }

    /** Pokemon Details */
    protected onScrolledIndexChange(rowIndex: number): void {
        const startIndex = Math.max(0, (rowIndex - 1) * this.columns);
        const endIndex = (rowIndex + 4) * this.columns;
        const visibleItems = this.filteredPokemon().slice(startIndex, endIndex);

        if (visibleItems.length > 0) {
            this.pokemonData.loadDetails(visibleItems.map((p) => p.id));
        }
    }

    /** back to previous step */
    protected onBack(): void {
        this.router.navigate(['/new-user']);
    }

    /** Toggle the selection of a pokemon and persist immediately */
    protected onTogglePokemon(id: number): void {
        const current = this.selectedIds();
        let updated: number[];

        if (current.includes(id)) {
            updated = current.filter((item) => item !== id);
        } else if (current.length < 3) {
            updated = [...current, id];
        } else {
            return;
        }

        this.selectedIds.set(updated);
        this.trainerData.setTeam(updated);
    }

    /** Verify if an ID is selected */
    protected isSelected(id: number): boolean {
        return this.selectedIds().includes(id);
    }

    /** trackBy function for virtual scroll */
    protected trackByRow(index: number, row: PokemonListItem[]): string {
        return row.map((p) => p.id).join('-');
    }

    /** Save team and go to profile */
    protected async onSaveTeam(): Promise<void> {
        if (!this.canSave()) return;

        this.loading.show('Guardando equipo...');
        this.trainerData.setTeam(this.selectedIds());

        await new Promise((resolve) => setTimeout(resolve, 500));
        await this.router.navigate(['/profile']);
        this.loading.hide();
    }
}


