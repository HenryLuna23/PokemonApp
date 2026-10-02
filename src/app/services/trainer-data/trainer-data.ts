import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { Account, PersistedTrainer } from '../../types/trainer/trainer';
import { TrainerStorage } from '../trainer-storage/trainer-storage';

@Injectable({
    providedIn: 'root',
})
export class TrainerData {
    private readonly storage = inject(TrainerStorage);

    private readonly _profile = signal<Account | null>(null);
    private readonly _teamIds = signal<number[]>([]);

    readonly profile = this._profile.asReadonly();
    readonly teamIds = this._teamIds.asReadonly();

    readonly hasProfile = computed(() => this._profile() !== null);
    readonly hasCompleteTeam = computed(() => this.hasProfile() && this._teamIds().length === 3);

    constructor() {
        this.hydrate();

        effect(() => {
            const persistedData: PersistedTrainer = {
                profile: this._profile(),
                teamIds: this._teamIds(),
            };
            this.storage.write(persistedData);
        });
    }

    saveAccount(account: Account): void {
        this._profile.set(account);
    }

    setTeam(teamIds: number[]): void {
        this._teamIds.set(teamIds.slice(0, 3));
    }

    clear(): void {
        this._profile.set(null);
        this._teamIds.set([]);
        this.storage.clear();
    }

    private hydrate(): void {
        const saved = this.storage.read();
        this._profile.set(saved.profile);
        this._teamIds.set(saved.teamIds);
    }
}
