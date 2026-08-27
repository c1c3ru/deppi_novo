import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, BehaviorSubject } from 'rxjs';

import { VisitasPublicComponent } from './visitas-public.component';
import { VisitasService } from '../services/visitas.service';
import { LaboratoriosService } from '../../laboratorios/services/laboratorios.service';
import { AuthService } from '../../../core/services/auth.service';

describe('VisitasPublicComponent', () => {
  let fixture: ComponentFixture<VisitasPublicComponent>;
  let component: VisitasPublicComponent;
  let isAuthenticatedSubject: BehaviorSubject<boolean>;

  const visitasServiceSpy = jasmine.createSpyObj('VisitasService', [
    'getAll',
    'getById',
    'create',
    'updateStatus',
    'updateLabAvailability',
  ]);
  const laboratoriosServiceSpy = jasmine.createSpyObj('LaboratoriosService', [
    'getAll',
  ]);

  beforeEach(async () => {
    isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
    visitasServiceSpy.getAll.and.returnValue(of([]));
    laboratoriosServiceSpy.getAll.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      declarations: [VisitasPublicComponent],
      imports: [CommonModule, ReactiveFormsModule],
      providers: [
        { provide: VisitasService, useValue: visitasServiceSpy },
        { provide: LaboratoriosService, useValue: laboratoriosServiceSpy },
        {
          provide: AuthService,
          useValue: { isAuthenticated$: isAuthenticatedSubject.asObservable() },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(VisitasPublicComponent);
    component = fixture.componentInstance;
  });

  it('renders the "Agendar Visita" form when there is no active session (visitante), with no approval button and no "add lab" option', () => {
    fixture.detectChanges();

    const formWrapper = fixture.nativeElement.querySelector(
      '[data-testid="coluna-formulario"]'
    );
    expect(formWrapper).not.toBeNull();
    expect(fixture.nativeElement.querySelector('form')).not.toBeNull();

    expect(
      fixture.nativeElement.querySelector('[data-testid="confirmar-visita-btn"]')
    ).toBeNull();
    expect(
      fixture.nativeElement.querySelector('[data-testid="adicionar-lab"]')
    ).toBeNull();
  });

  it('removes the "Agendar Visita" form entirely from the DOM and keeps "Confirmar as visitas" enabled when authenticated', () => {
    const pendingVisit = {
      id: 'v1',
      school_name: 'Escola X',
      responsible_name: 'Fulano',
      contact_email: 'fulano@escola.edu.br',
      contact_phone: '(85) 99999-9999',
      students_count: 10,
      target_date: '2026-09-01',
      shift: 'M',
      status: 'pending',
    };
    visitasServiceSpy.getAll.and.returnValue(of([pendingVisit]));
    visitasServiceSpy.getById.and.returnValue(
      of({
        ...pendingVisit,
        labs: [
          { visit_id: 'v1', lab_id: 'l1', name: 'LAB - Laboratório', status: 'pending' },
        ],
      })
    );

    isAuthenticatedSubject.next(true);
    fixture.detectChanges();

    expect(component.isAuthenticated).toBeTrue();

    const formWrapper = fixture.nativeElement.querySelector(
      '[data-testid="coluna-formulario"]'
    );
    expect(formWrapper).toBeNull();
    expect(fixture.nativeElement.querySelector('form')).toBeNull();

    const confirmBtn: HTMLButtonElement = fixture.nativeElement.querySelector(
      '[data-testid="confirmar-visita-btn"]'
    );
    expect(confirmBtn).not.toBeNull();
    expect(confirmBtn.disabled).toBeFalse();
  });

  it('exibe a opção de adicionar mais laboratórios apenas no estado autenticado', () => {
    const pendingVisit = {
      id: 'v1',
      school_name: 'Escola X',
      responsible_name: 'Fulano',
      contact_email: 'fulano@escola.edu.br',
      contact_phone: '(85) 99999-9999',
      students_count: 10,
      target_date: '2026-09-01',
      shift: 'M',
      status: 'pending',
    };
    laboratoriosServiceSpy.getAll.and.returnValue(
      of([
        { id: 'l1', name: 'LAB - Laboratório Vinculado', description: '' },
        { id: 'l2', name: 'LAB2 - Laboratório Novo', description: '' },
      ])
    );
    visitasServiceSpy.getAll.and.returnValue(of([pendingVisit]));
    visitasServiceSpy.getById.and.returnValue(
      of({
        ...pendingVisit,
        labs: [
          { visit_id: 'v1', lab_id: 'l1', name: 'LAB - Laboratório Vinculado', status: 'pending' },
        ],
      })
    );

    isAuthenticatedSubject.next(true);
    fixture.detectChanges();

    const addLabSection = fixture.nativeElement.querySelector(
      '[data-testid="adicionar-lab"]'
    );
    expect(addLabSection).not.toBeNull();
    expect(addLabSection.textContent).toContain('LAB2');
    expect(addLabSection.textContent).not.toContain('Laboratório Vinculado');
  });

  it('renders lab cards (sigla, nome, descrição) for the authenticated user', () => {
    laboratoriosServiceSpy.getAll.and.returnValue(
      of([
        { id: 'l1', name: 'LAB - Laboratório de Testes', description: 'Descrição do lab' },
      ])
    );
    isAuthenticatedSubject.next(true);
    fixture.detectChanges();

    const labsGrid = fixture.nativeElement.querySelector(
      '[data-testid="labs-grid-autenticado"]'
    );
    expect(labsGrid).not.toBeNull();
    expect(labsGrid.textContent).toContain('LAB');
    expect(labsGrid.textContent).toContain('Laboratório de Testes');
    expect(labsGrid.textContent).toContain('Descrição do lab');
  });
});
