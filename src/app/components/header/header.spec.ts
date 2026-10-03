import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { LoadingService } from '../../services/loading/loading';
import { TrainerData } from '../../services/trainer-data/trainer-data';
import { Header } from './header';

describe('Header', () => {
  let fixture: ComponentFixture<Header>;
  let component: Header;
  let trainerData: TrainerData;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    localStorage.clear();
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [
        provideZonelessChangeDetection(),
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    trainerData = TestBed.inject(TrainerData);
    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should render Pokémon logo', () => {
    const logo = fixture.nativeElement.querySelector('.header-logo') as HTMLImageElement;
    expect(logo).toBeTruthy();
    expect(logo.alt).toBe('Pokémon');
  });

  it('should render user badge when profile exists', () => {
    trainerData.saveAccount({
      fullName: 'Henry Cavill',
      birthdate: new Date('1990-05-15'),
      dni: '05634225-1',
      isAdult: true,
      photoData: 'data:image/png;base64,mock',
      photoName: 'henry.png',
    });
    fixture.detectChanges();

    const userName = fixture.nativeElement.querySelector('.user-name');
    expect(userName?.textContent).toContain('Henry');

    const searchBtn = fixture.nativeElement.querySelector('.search-btn');
    expect(searchBtn).toBeTruthy();
  });

  it('should toggle dropdown menu when clicking user badge', () => {
    trainerData.saveAccount({
      fullName: 'Henry Cavill',
      birthdate: new Date('1990-05-15'),
      dni: '05634225-1',
      isAdult: true,
      photoData: 'data:image/png;base64,mock',
      photoName: 'henry.png',
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-testid="user-dropdown-menu"]')).toBeNull();

    const badgeBtn = fixture.nativeElement.querySelector('[data-testid="user-badge-btn"]') as HTMLButtonElement;
    badgeBtn.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-testid="user-dropdown-menu"]')).toBeTruthy();

    badgeBtn.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="user-dropdown-menu"]')).toBeNull();
  });

  it('should open confirmation modal when clicking Cerrar sesión', () => {
    trainerData.saveAccount({
      fullName: 'Henry Cavill',
      birthdate: new Date('1990-05-15'),
      dni: '05634225-1',
      isAdult: true,
      photoData: 'data:image/png;base64,mock',
      photoName: 'henry.png',
    });
    trainerData.setTeam([1, 4, 7]);
    fixture.detectChanges();

    // Abrir dropdown
    const badgeBtn = fixture.nativeElement.querySelector('[data-testid="user-badge-btn"]') as HTMLButtonElement;
    badgeBtn.click();
    fixture.detectChanges();

    // Clic en Cerrar sesión
    const logoutItem = fixture.nativeElement.querySelector('[data-testid="logout-menu-item"]') as HTMLButtonElement;
    logoutItem.click();
    fixture.detectChanges();

    // Modal debe estar visible y dropdown cerrado
    expect(fixture.nativeElement.querySelector('[data-testid="logout-modal"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-testid="user-dropdown-menu"]')).toBeNull();
  });

  it('should close modal without clearing data when clicking Cancelar', () => {
    trainerData.saveAccount({
      fullName: 'Henry Cavill',
      birthdate: new Date('1990-05-15'),
      dni: '05634225-1',
      isAdult: true,
      photoData: 'data:image/png;base64,mock',
      photoName: 'henry.png',
    });
    fixture.detectChanges();

    component.isDropdownOpen.set(false);
    component.showConfirmModal.set(true);
    fixture.detectChanges();

    const cancelBtn = fixture.nativeElement.querySelector('[data-testid="cancel-logout-btn"]') as HTMLButtonElement;
    cancelBtn.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-testid="logout-modal"]')).toBeNull();
    expect(trainerData.hasProfile()).toBeTrue();
  });

  it('should clear trainer data, show loader and redirect to /new-user on confirm logout', async () => {
    const loading = TestBed.inject(LoadingService);
    spyOn(loading, 'show');
    spyOn(loading, 'hide');

    trainerData.saveAccount({
      fullName: 'Henry Cavill',
      birthdate: new Date('1990-05-15'),
      dni: '05634225-1',
      isAdult: true,
      photoData: 'data:image/png;base64,mock',
      photoName: 'henry.png',
    });
    trainerData.setTeam([1, 4, 7]);
    fixture.detectChanges();

    component.showConfirmModal.set(true);
    fixture.detectChanges();

    const confirmBtn = fixture.nativeElement.querySelector('[data-testid="confirm-logout-btn"]') as HTMLButtonElement;
    await (component as unknown as { confirmLogout(): Promise<void> }).confirmLogout();

    expect(loading.show).toHaveBeenCalledWith('Cerrando sesión...');
    expect(trainerData.profile()).toBeNull();
    expect(trainerData.teamIds().length).toBe(0);
    expect(router.navigate).toHaveBeenCalledWith(['/new-user']);
    expect(loading.hide).toHaveBeenCalled();
  });
});
