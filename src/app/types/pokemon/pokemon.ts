export interface Pokemon {
  id: number;
  name: string;
  base_experience: number;
  height: number;
  is_default: boolean;
  order: number;
  weight: number;
  abilities: Ability[];
  past_abilities?: PastAbility[];
  forms: NamedAPIResource[];
  game_indices: GameIndex[];
  held_items: HeldItem[];
  location_area_encounters: string;
  moves: Move[];
  species: NamedAPIResource;
  sprites: Sprites;
  cries?: PokemonCries;
  stats: Stat[];
  types: Type[];
}

export interface Ability {
  is_hidden: boolean;
  slot: number;
  ability: NamedAPIResource;
}

export interface PastAbility {
  generation: NamedAPIResource;
  abilities: {
    is_hidden: boolean;
    slot: number;
    ability: NamedAPIResource | null;
  }[];
}

export interface NamedAPIResource {
  name: string;
  url: string;
}

export interface GameIndex {
  game_index: number;
  version: NamedAPIResource;
}

export interface HeldItem {
  item: NamedAPIResource;
  version_details: VersionDetail[];
}

export interface VersionDetail {
  rarity: number;
  version: NamedAPIResource;
}

export interface Move {
  move: NamedAPIResource;
  version_group_details: VersionGroupDetail[];
}

export interface VersionGroupDetail {
  level_learned_at: number;
  version_group: NamedAPIResource;
  move_learn_method: NamedAPIResource;
}

export interface Sprites {
  back_default: string | null;
  back_female: string | null;
  back_shiny: string | null;
  back_shiny_female: string | null;
  front_default: string | null;
  front_female: string | null;
  front_shiny: string | null;
  front_shiny_female: string | null;
  other?: OtherSprites;
  versions?: Record<string, Record<string, Sprite>>;
}

export interface OtherSprites {
  dream_world?: Sprite;
  home?: Sprite;
  'official-artwork'?: Sprite;
  showdown?: Sprite;
}

export interface Sprite {
  front_default: string | null;
  front_female?: string | null;
  front_shiny?: string | null;
  front_shiny_female?: string | null;
}

export interface PokemonCries {
  latest: string;
  legacy: string;
}

export interface Stat {
  base_stat: number;
  effort: number;
  stat: NamedAPIResource;
}

export interface Type {
  slot: number;
  type: NamedAPIResource;
}

/** Tipos utilitarios para el consumo dentro de la aplicación */
export type StatKey =
  | 'hp'
  | 'attack'
  | 'defense'
  | 'special-attack'
  | 'special-defense'
  | 'speed';

export interface PokemonListItem {
  id: number;
  name: string;
  url: string;
}

export interface NamedAPIResourceList {
  count: number;
  next: string | null;
  previous: string | null;
  results: NamedAPIResource[];
}
