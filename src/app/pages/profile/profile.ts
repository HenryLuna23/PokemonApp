import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TrainerCard, TrainerDocumentInfo } from '../../components/trainer-card/trainer-card';
import { PokemonData } from '../../services/pokemon-data/pokemon-data';
import { TrainerData } from '../../services/trainer-data/trainer-data';
import { Pokemon, Stat } from '../../types/pokemon/pokemon';
import { calculateAge } from '../../utils/age/age';

export const TYPE_SPANISH: Record<string, string> = {
    normal: 'Normal',
    fire: 'Fuego',
    water: 'Agua',
    grass: 'Planta',
    electric: 'Eléctrico',
    ice: 'Hielo',
    fighting: 'Lucha',
    poison: 'Veneno',
    ground: 'Tierra',
    flying: 'Volador',
    psychic: 'Psíquico',
    bug: 'Bicho',
    rock: 'Roca',
    ghost: 'Fantasma',
    dragon: 'Dragón',
    steel: 'Acero',
    fairy: 'Hada',
};

export const TYPE_COLORS: Record<string, string> = {
    grass: '#78c850',
    fire: '#f59e0b',
    water: '#3b82f6',
    bug: '#a8b820',
    normal: '#a8a878',
    poison: '#a040a0',
    electric: '#eab308',
    ground: '#e0c068',
    fairy: '#ee99ac',
    fighting: '#c03028',
    psychic: '#f85888',
    rock: '#b8a038',
    ghost: '#705898',
    ice: '#98d8d8',
    dragon: '#7038f8',
    steel: '#b8b8d0',
};

export const STAT_NAME_SPANISH: Record<string, string> = {
    hp: 'HP',
    attack: 'Ataque',
    defense: 'Defensa',
    'special-attack': 'Ataque Especial',
    'special-defense': 'Defensa Especial',
    speed: 'Velocidad',
};

/**
 * Límites máximos absolutos por estadística según la especificación técnica:
 * - Salud (HP): 255
 * - Ataque: 190
 * - Defensa: 230
 * - Ataque especial: 194
 * - Defensa especial: 230
 * - Velocidad: 180
 */
export const STAT_MAX_LIMITS: Record<string, number> = {
    hp: 255,
    attack: 190,
    defense: 230,
    'special-attack': 194,
    'special-defense': 230,
    speed: 180,
};

export interface PokemonStatView {
    label: string;
    value: number;
    maxValue: number;
    percentage: number;
}

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [TrainerCard],
    templateUrl: './profile.html',
    styleUrl: './profile.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Profile {
    protected readonly trainerData = inject(TrainerData);
    protected readonly pokemonData = inject(PokemonData);
    private readonly router = inject(Router);

    /** Perfil del entrenador */
    protected readonly profile = this.trainerData.profile;

    /** Primer nombre para el saludo en encabezado */
    protected readonly firstName = computed<string>(() => {
        const name = this.profile()?.fullName?.trim() ?? '';
        return name.split(' ')[0] || 'Entrenador';
    });

    /** Edad calculada */
    protected readonly trainerAge = computed<number | null>(() => {
        return calculateAge(this.profile()?.birthdate);
    });

    /** Documento formateado */
    protected readonly trainerDocument = computed<TrainerDocumentInfo | null>(() => {
        const p = this.profile();
        if (!p || !p.dni) return null;
        return {
            label: p.isAdult ? 'DUI' : 'Carnet',
            value: p.dni,
        };
    });

    /** IDs de los Pokémon del equipo */
    protected readonly teamIds = this.trainerData.teamIds;

    /** Lista completa de los Pokémon del equipo con sus detalles */
    protected readonly teamPokemon = computed<Pokemon[]>(() => {
        const cache = this.pokemonData.detailsCache();
        return this.teamIds()
            .map((id) => cache.get(id))
            .filter((p): p is Pokemon => !!p);
    });

    constructor() {
        this.pokemonData.loadInitialList();
        const ids = this.teamIds();
        if (ids.length > 0) {
            this.pokemonData.loadDetails(ids);
        }
    }

    /** Navigation to new-user */
    protected onEditProfile(): void {
        this.router.navigate(['/new-user']);
    }

    /** Navigation to team */
    protected onEditTeam(): void {
        this.router.navigate(['/team']);
    }

    /** Get the official home sprite */
    protected getPokemonSprite(pokemon: Pokemon): string {
        return (
            pokemon.sprites?.other?.home?.front_default ??
            `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${pokemon.id}.png`
        );
    }

    /** Format types */
    protected formatTypes(pokemon: Pokemon): string {
        if (!pokemon.types || pokemon.types.length === 0) return '';
        return pokemon.types
            .map((t) => TYPE_SPANISH[t.type.name.toLowerCase()] ?? t.type.name)
            .join('/');
    }

    /** Get the color of the stat bar according to the main type */
    protected getBarColor(pokemon: Pokemon): string {
        const primaryType = pokemon.types?.[0]?.type?.name?.toLowerCase() ?? 'normal';
        return TYPE_COLORS[primaryType] ?? '#78c850';
    }

    /** Get the list of stats mapped for view calculating the percentage according to the official maximum limit */
    protected getStatsList(pokemon: Pokemon): PokemonStatView[] {
        const order = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];
        const statsMap = new Map<string, number>();

        for (const s of pokemon.stats || []) {
            statsMap.set(s.stat.name, s.base_stat);
        }

        return order.map((key) => {
            const val = statsMap.get(key) ?? 0;
            const maxVal = STAT_MAX_LIMITS[key] ?? 255;
            const pct = Math.min(100, Math.max(0, Math.round((val / maxVal) * 100)));
            return {
                label: STAT_NAME_SPANISH[key] ?? key,
                value: val,
                maxValue: maxVal,
                percentage: pct,
            };
        });
    }
}
