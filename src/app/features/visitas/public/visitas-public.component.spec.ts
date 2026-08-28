import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError, BehaviorSubject } from 'rxjs';

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

  it('renderiza os novos campos escolares no DOM sem erros durante a montagem do componente', () => {
    expect(() => fixture.detectChanges()).not.toThrow();

    const novosCampos = [
      'school_city',
      'school_network',
      'director_name',
      'institutional_email',
      'whatsapp_phone',
      'class_supervisors',
      'grade_level',
      'students_count',
      'notes',
    ];

    novosCampos.forEach((campo) => {
      const el = fixture.nativeElement.querySelector(`#${campo}`);
      expect(el).withContext(`campo #${campo} não renderizado`).not.toBeNull();
    });

    const studentsInput: HTMLInputElement =
      fixture.nativeElement.querySelector('#students_count');
    expect(studentsInput.max).toBe('50');

    const hint = fixture.nativeElement.querySelector('.campo-hint-alerta');
    expect(hint).not.toBeNull();
    expect(hint.textContent).toContain(
      'Recomendamos grupos de até 40 estudantes'
    );
    expect(hint.textContent).toContain(
      'O limite máximo permitido é de 50 estudantes por visita'
    );
  });

  it('bloqueia o envio do formulário quando a quantidade de alunos excede 50 (validação client-side)', () => {
    fixture.detectChanges();

    component.visitForm.patchValue({
      school_name: 'Escola X',
      school_city: 'Maracanaú',
      school_network: 'municipal',
      director_name: 'Diretor(a) Exemplo',
      responsible_name: 'Responsável Exemplo',
      contact_email: 'responsavel@escola.edu.br',
      contact_phone: '(85) 99999-9999',
      institutional_email: 'secretaria@escola.edu.br',
      whatsapp_phone: '(85) 99999-9999',
      class_supervisors: 'Fulano e Beltrano',
      grade_level: '9º ano',
      students_count: 51,
      target_date: '2026-12-01',
      shift: 'M',
    });

    expect(component.visitForm.get('students_count')?.hasError('max')).toBeTrue();
    expect(component.visitForm.invalid).toBeTrue();

    component.visitForm.patchValue({ students_count: 50 });
    expect(component.visitForm.get('students_count')?.hasError('max')).toBeFalse();
  });

  it('envia os novos campos no payload da requisição POST ao submeter o formulário', () => {
    fixture.detectChanges();
    visitasServiceSpy.create.and.returnValue(of({ id: 'new-visit' }));

    component.visitForm.setValue({
      school_name: 'Escola X',
      school_city: 'Maracanaú',
      school_network: 'municipal',
      director_name: 'Diretor(a) Exemplo',
      responsible_name: 'Responsável Exemplo',
      contact_email: 'responsavel@escola.edu.br',
      contact_phone: '(85) 99999-9999',
      institutional_email: 'secretaria@escola.edu.br',
      whatsapp_phone: '(85) 99999-9999',
      class_supervisors: 'Fulano e Beltrano',
      grade_level: '9º ano',
      students_count: 30,
      target_date: '2026-12-01',
      shift: 'M',
      notes: 'Observação de teste',
    });

    component.onSubmit();

    expect(visitasServiceSpy.create).toHaveBeenCalledWith(
      jasmine.objectContaining({
        school_city: 'Maracanaú',
        school_network: 'municipal',
        director_name: 'Diretor(a) Exemplo',
        institutional_email: 'secretaria@escola.edu.br',
        whatsapp_phone: '(85) 99999-9999',
        class_supervisors: 'Fulano e Beltrano',
        grade_level: '9º ano',
        notes: 'Observação de teste',
      })
    );
  });

  it('exibe a mensagem de erro retornada pela API quando a submissão falha (ex: limite de alunos)', () => {
    fixture.detectChanges();
    visitasServiceSpy.create.and.returnValue(
      throwError(() => ({ error: { message: 'O limite de alunos por visita é 50.' } }))
    );

    component.visitForm.setValue({
      school_name: 'Escola X',
      school_city: 'Maracanaú',
      school_network: 'municipal',
      director_name: 'Diretor(a) Exemplo',
      responsible_name: 'Responsável Exemplo',
      contact_email: 'responsavel@escola.edu.br',
      contact_phone: '(85) 99999-9999',
      institutional_email: 'secretaria@escola.edu.br',
      whatsapp_phone: '(85) 99999-9999',
      class_supervisors: 'Fulano e Beltrano',
      grade_level: '9º ano',
      students_count: 30,
      target_date: '2026-12-01',
      shift: 'M',
      notes: '',
    });

    component.onSubmit();

    expect(component.errorMessage).toBe('O limite de alunos por visita é 50.');
    expect(component.isSubmitting).toBeFalse();
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

  it('renders the 7 new laboratory cards (siglas) on the public visit scheduling form', () => {
    const novosLaboratorios = [
      { id: 'l1', name: 'LAQAMB - Laboratório de Química Ambiental', description: 'Breve descrição das atividades do laboratório LAQAMB.' },
      { id: 'l2', name: 'LAPP - Laboratório de Automação e Processos Produtivos', description: 'Breve descrição das atividades do laboratório LAPP.' },
      { id: 'l3', name: 'MAKER - Espaço Maker', description: 'Breve descrição das atividades do laboratório MAKER.' },
      { id: 'l4', name: 'OFICINA - Oficina de Prototipagem e Manutenção', description: 'Breve descrição das atividades do laboratório OFICINA.' },
      { id: 'l5', name: 'LQOI - Laboratório de Química Orgânica e Inorgânica', description: 'Breve descrição das atividades do laboratório LQOI.' },
      { id: 'l6', name: 'LABVICIA - Visão & IA', description: 'Breve descrição das atividades do laboratório LABVICIA.' },
      { id: 'l7', name: 'LASIC - Laboratório de Sistemas Inteligentes e Computação', description: 'Breve descrição das atividades do laboratório LASIC.' },
    ];
    laboratoriosServiceSpy.getAll.and.returnValue(of(novosLaboratorios));

    fixture.detectChanges();

    const formWrapper = fixture.nativeElement.querySelector(
      '[data-testid="coluna-formulario"]'
    );
    expect(formWrapper).not.toBeNull();

    const siglas = ['LAQAMB', 'LAPP', 'MAKER', 'OFICINA', 'LQOI', 'LABVICIA', 'LASIC'];
    siglas.forEach((sigla) => {
      expect(formWrapper.textContent).toContain(sigla);
    });

    const labCards = formWrapper.querySelectorAll('.lab-card');
    expect(labCards.length).toBe(7);

    // O laboratório de teste ("Laboratório de Física (teste)") nunca deve
    // aparecer na listagem pública de laboratórios.
    expect(formWrapper.textContent.toLowerCase()).not.toContain('física');
    expect(formWrapper.textContent.toLowerCase()).not.toContain('teste');
  });

  it('não exibe o laboratório de teste ("Laboratório de Física (teste)") na visão pública (visitante)', () => {
    const laboratoriosReais = [
      { id: 'l1', name: 'LAQAMB - Laboratório de Química Ambiental', description: 'Breve descrição das atividades do laboratório LAQAMB.' },
      { id: 'l2', name: 'LABVICIA - Visão & IA', description: 'Breve descrição das atividades do laboratório LABVICIA.' },
    ];
    laboratoriosServiceSpy.getAll.and.returnValue(of(laboratoriosReais));

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent.toLowerCase()).not.toContain(
      'física (teste)'
    );
  });

  it('não exibe o laboratório de teste ("Laboratório de Física (teste)") na visão autenticada (gestão)', () => {
    const laboratoriosReais = [
      { id: 'l1', name: 'LAQAMB - Laboratório de Química Ambiental', description: 'Breve descrição das atividades do laboratório LAQAMB.' },
      { id: 'l2', name: 'LABVICIA - Visão & IA', description: 'Breve descrição das atividades do laboratório LABVICIA.' },
    ];
    laboratoriosServiceSpy.getAll.and.returnValue(of(laboratoriosReais));

    isAuthenticatedSubject.next(true);
    fixture.detectChanges();

    const labsGrid = fixture.nativeElement.querySelector(
      '[data-testid="labs-grid-autenticado"]'
    );
    expect(labsGrid.textContent.toLowerCase()).not.toContain('física (teste)');
  });
});
