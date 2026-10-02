import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingService } from '../../services/loading/loading';
import { LoadingOverlay } from './loading-overlay';

describe('LoadingOverlay', () => {
  let fixture: ComponentFixture<LoadingOverlay>;
  let loadingService: LoadingService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingOverlay],
      providers: [provideZonelessChangeDetection(), LoadingService],
    }).compileComponents();

    loadingService = TestBed.inject(LoadingService);
    fixture = TestBed.createComponent(LoadingOverlay);
  });

  it('should not render overlay when not loading', () => {
    fixture.detectChanges();
    const overlay = fixture.nativeElement.querySelector('[data-testid="global-loading-overlay"]');
    expect(overlay).toBeNull();
  });

  it('should render overlay with message and gif when loading is active', () => {
    loadingService.show('Cargando perfil...');
    fixture.detectChanges();

    const overlay = fixture.nativeElement.querySelector('[data-testid="global-loading-overlay"]');
    expect(overlay).toBeTruthy();

    const text = fixture.nativeElement.querySelector('.loading-text');
    expect(text?.textContent).toContain('Cargando perfil...');

    const img = fixture.nativeElement.querySelector('.loading-gif');
    expect(img).toBeTruthy();
  });
});
