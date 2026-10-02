import { Injectable } from '@angular/core';
import { Account, PersistedTrainer } from '../../types/trainer/trainer';

const STORAGE_KEY = 'pokemon-trainer:v1';

@Injectable({
    providedIn: 'root',
})
export class TrainerStorage {
    read(): PersistedTrainer {
        try {
            if (typeof window === 'undefined' || !window.localStorage) {
                return this.getDefault();
            }

            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                return this.getDefault();
            }

            const parsed: unknown = JSON.parse(raw);
            if (!this.isValidTrainerData(parsed)) {
                this.clear();
                return this.getDefault();
            }

            return {
                profile: parsed.profile
                    ? {
                          ...parsed.profile,
                          birthdate: new Date(parsed.profile.birthdate),
                      }
                    : null,
                teamIds: parsed.teamIds,
            };
        } catch {
            return this.getDefault();
        }
    }

    write(data: PersistedTrainer): boolean {
        try {
            if (typeof window === 'undefined' || !window.localStorage) {
                return false;
            }

            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Failed to write trainer data to localStorage', error);
            return false;
        }
    }

    clear(): void {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                localStorage.removeItem(STORAGE_KEY);
            }
        } catch (error) {
            console.error('Failed to clear trainer data from localStorage', error);
        }
    }

    private getDefault(): PersistedTrainer {
        return {
            profile: null,
            teamIds: [],
        };
    }

    private isValidTrainerData(data: unknown): data is { profile: (Account & { birthdate: string | Date }) | null; teamIds: number[] } {
        if (!data || typeof data !== 'object') {
            return false;
        }

        const candidate = data as Partial<PersistedTrainer>;
        const hasValidTeam = Array.isArray(candidate.teamIds) && candidate.teamIds.every((id) => typeof id === 'number' && Number.isInteger(id));

        if (!hasValidTeam) {
            return false;
        }

        if (candidate.profile === null) {
            return true;
        }

        if (!candidate.profile || typeof candidate.profile !== 'object') {
            return false;
        }

        const profile = candidate.profile as Partial<Account>;
        return typeof profile.fullName === 'string' && typeof profile.dni === 'string' && typeof profile.photoData === 'string';
    }
}
