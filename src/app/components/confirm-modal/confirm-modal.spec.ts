import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmModal } from './confirm-modal';

describe('ConfirmModal', () => {
  let fixture: ComponentFixture<ConfirmModal>;
  let component: ConfirmModal;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmModal],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should not render anything when isOpen is false', () => {
    expect(fixture.nativeElement.querySelector('.modal-backdrop')).toBeNull();
  });

  it('should render modal content when isOpen is true', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('title', '¿Cerrar sesión?');
    fixture.componentRef.setInput('message', 'Se eliminarán tus datos.');
    fixture.detectChanges();

    const backdrop = fixture.nativeElement.querySelector('.modal-backdrop');
    expect(backdrop).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.modal-title')?.textContent).toContain('¿Cerrar sesión?');
    expect(fixture.nativeElement.querySelector('.modal-message')?.textContent).toContain('Se eliminarán tus datos.');
  });

  it('should emit cancelled when clicking cancel button or backdrop', () => {
    let cancelled = false;
    component.cancelled.subscribe(() => (cancelled = true));

    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    const cancelBtn = fixture.nativeElement.querySelector('.btn-cancel') as HTMLButtonElement;
    cancelBtn.click();
    expect(cancelled).toBeTrue();

    cancelled = false;
    const backdrop = fixture.nativeElement.querySelector('.modal-backdrop') as HTMLElement;
    backdrop.click();
    expect(cancelled).toBeTrue();
  });

  it('should emit confirmed when clicking confirm button', () => {
    let confirmed = false;
    component.confirmed.subscribe(() => (confirmed = true));

    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    const confirmBtn = fixture.nativeElement.querySelector('.btn-confirm') as HTMLButtonElement;
    confirmBtn.click();
    expect(confirmed).toBeTrue();
  });

  it('should emit cancelled when pressing Escape', () => {
    let cancelled = false;
    component.cancelled.subscribe(() => (cancelled = true));

    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    component.onEscape();
    expect(cancelled).toBeTrue();
  });
});
