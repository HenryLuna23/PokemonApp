import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Header } from './header';

describe('Header', () => {
  let fixture: ComponentFixture<Header>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    fixture.detectChanges();
  });

  it('should render Pokémon logo', () => {
    const logo = fixture.nativeElement.querySelector('.header-logo') as HTMLImageElement;
    expect(logo).toBeTruthy();
    expect(logo.alt).toBe('Pokémon');
  });
});
