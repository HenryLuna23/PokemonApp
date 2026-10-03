import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
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
    private readonly destroyRef = inject(DestroyRef);

    /** IDs de Pokémon que tienen su versión shiny activa */
    protected readonly shinyPokemonIds = signal<Set<number>>(new Set<number>());

    /** Mapa de temporizadores activos para limpiar el estado shiny después de 5 segundos */
    private readonly shinyTimers = new Map<number, ReturnType<typeof setTimeout>>();

    /** Referencia al elemento de audio actual para evitar solapamientos */
    private currentAudio: HTMLAudioElement | null = null;

    /** ID del Pokémon cuyo sonido se está reproduciendo actualmente */
    protected readonly playingCryId = signal<number | null>(null);

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

        // Limpieza de temporizadores y audio al destruir el componente
        this.destroyRef.onDestroy(() => {
            this.shinyTimers.forEach((timer) => clearTimeout(timer));
            this.shinyTimers.clear();
            if (this.currentAudio) {
                this.currentAudio.pause();
                this.currentAudio = null;
            }
        });
    }

    /** Navigation to new-user */
    protected onEditProfile(): void {
        this.router.navigate(['/new-user']);
    }

    /** Navigation to team */
    protected onEditTeam(): void {
        this.router.navigate(['/team']);
    }

    /**
     * Verifica si un Pokémon tiene activa su versión shiny
     */
    protected isShiny(pokemonId: number): boolean {
        return this.shinyPokemonIds().has(pokemonId);
    }

    /**
     * Activa la versión shiny del Pokémon durante 5 segundos y luego la revierte automáticamente
     */
    protected showShiny(pokemon: Pokemon): void {
        if (!pokemon?.id) return;
        const id = pokemon.id;

        // Cancelar temporizador previo si existía para este Pokémon
        const existingTimer = this.shinyTimers.get(id);
        if (existingTimer) {
            clearTimeout(existingTimer);
        }

        // Activar estado shiny reactivamente
        this.shinyPokemonIds.update((current) => {
            const next = new Set(current);
            next.add(id);
            return next;
        });

        const timer = setTimeout(() => {
            this.shinyPokemonIds.update((current) => {
                const next = new Set(current);
                next.delete(id);
                return next;
            });
            this.shinyTimers.delete(id);
        }, 3000);

        this.shinyTimers.set(id, timer);
    }

    /**
     * Obtiene el sprite correspondiente: versión shiny si está activa, o la normal por defecto
     */
    protected getPokemonSprite(pokemon: Pokemon): string {
        if (this.isShiny(pokemon.id)) {
            return this.getPokemonSpriteShiny(pokemon);
        }
        return (
            pokemon.sprites?.other?.home?.front_default ??
            `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${pokemon.id}.png`
        );
    }

    /**
     * URL del sprite shiny oficial (Home o Front Shiny como fallback)
     */
    protected getPokemonSpriteShiny(pokemon: Pokemon): string {
        return (
            pokemon.sprites?.other?.home?.front_shiny ??
            pokemon.sprites?.front_shiny ??
            `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/${pokemon.id}.png`
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

    /**  reproduciendo el sonido del Pokémon */
    protected listenerCries(pokemon: Pokemon): void {
        const cryUrl = pokemon?.cries?.latest || pokemon?.cries?.legacy;
        if (!cryUrl) {
            console.warn('Este Pokémon no contiene sonido registrado.');
            return;
        }

        // escuchamos solamente un audio a la vez
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            this.currentAudio = null;
        }

        try {
            const audio = new Audio(cryUrl);
            audio.volume = 0.1;
            this.currentAudio = audio;
            this.playingCryId.set(pokemon.id);

            audio.onended = () => {
                if (this.playingCryId() === pokemon.id) this.playingCryId.set(null);
                if (this.currentAudio === audio) this.currentAudio = null;
            };

            audio.onerror = () => {
                if (this.playingCryId() === pokemon.id) this.playingCryId.set(null);
            };

            audio.play().catch((error) => {
                if (this.playingCryId() === pokemon.id) this.playingCryId.set(null);
            });
        } catch (error) {
            console.warn('Error al inicializar audio:', error);
        }
    }
}

