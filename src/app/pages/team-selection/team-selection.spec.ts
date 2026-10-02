import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TrainerData } from '../../services/trainer-data/trainer-data';
import { TrainerStorage } from '../../services/trainer-storage/trainer-storage';
import { Account } from '../../types/trainer/trainer';
import { TeamSelection } from './team-selection';

class MockTrainerStorage {
    private data: { profile: Account | null; teamIds: number[] } = {
        profile: {
            fullName: 'Ash Ketchum',
            hobby: 'Jugar Pokémon',
            birthdate: new Date(new Date().getFullYear() - 20, 4, 15),
            dni: '12345678-9',
            isAdult: true,
            photoData: 'data:image/png;base64,mock',
            photoName: 'ash.png',
        },
        teamIds: [],
    };

    read() {
        return this.data;
    }

    write(d: any) {
        this.data = d;
        return true;
    }

    clear() {
        this.data = { profile: null, teamIds: [] };
    }
}

describe('TeamSelection', () => {
    let component: TeamSelection;
    let fixture: ComponentFixture<TeamSelection>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TeamSelection],
            providers: [provideZonelessChangeDetection(), TrainerData, { provide: TrainerStorage, useClass: MockTrainerStorage }],
        }).compileComponents();

        fixture = TestBed.createComponent(TeamSelection);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should render app-trainer-card with variant summary and profile data', () => {
        const cardEl = fixture.nativeElement.querySelector('app-trainer-card');
        expect(cardEl).toBeTruthy();

        const nameEl = cardEl.querySelector('.trainer-name');
        expect(nameEl?.textContent).toContain('Ash Ketchum');

        const hobbyEl = cardEl.textContent;
        expect(hobbyEl).toContain('Jugar Pokémon');
        expect(hobbyEl).toContain('20 años');
        expect(hobbyEl).toContain('12345678-9');
    });
});
