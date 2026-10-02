import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Pokemon, PokemonListItem } from '../../types/pokemon/pokemon';

@Component({
    selector: 'app-pokemon-card',
    standalone: true,
    templateUrl: './pokemon-card.html',
    styleUrl: './pokemon-card.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokemonCard {
    /** info pokemon id and name */
    readonly item = input.required<PokemonListItem>();

    /** Detailed Pokémon information (stats, types, sprites) */
    readonly details = input<Pokemon | null>(null);

    /** pokemon is selected */
    readonly selected = input<boolean>(false);

    /** selection is disabled */
    readonly disabled = input<boolean>(false);

    /** emits the pokémon's ID when clicked */
    readonly toggle = output<number>();

    /** ID formatted with leading zeros */
    protected readonly formattedId = computed<string>(() => {
        return `#${String(this.item().id).padStart(3, '0')}`;
    });

    /** sprite url from home front default */
    protected readonly spriteUrl = computed<string>(() => {
        const d = this.details();
        const homeSprite = d?.sprites?.other?.home?.front_default;
        if (homeSprite) return homeSprite;
        return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${this.item().id}.png`;
    });

    /** Manage the selection by tapping the card */
    protected onCardClick(): void {
        if (!this.disabled() || this.selected()) {
            this.toggle.emit(this.item().id);
        }
    }
}
