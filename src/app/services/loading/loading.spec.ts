import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LoadingService } from './loading';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(LoadingService);
  });

  it('should be created with initial state not loading', () => {
    expect(service.isLoading()).toBeFalse();
    expect(service.message()).toBeNull();
  });

  it('should set loading state and message when show is called', () => {
    service.show('Cargando datos...');
    expect(service.isLoading()).toBeTrue();
    expect(service.message()).toBe('Cargando datos...');
  });

  it('should use default message when show is called without arguments', () => {
    service.show();
    expect(service.isLoading()).toBeTrue();
    expect(service.message()).toBe('Cargando...');
  });

  it('should reset state when hide is called', () => {
    service.show('Test');
    service.hide();
    expect(service.isLoading()).toBeFalse();
    expect(service.message()).toBeNull();
  });
});
