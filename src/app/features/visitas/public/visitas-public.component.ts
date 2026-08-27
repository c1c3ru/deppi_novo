import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { VisitasService } from '../services/visitas.service';
import { SchoolVisit } from '../../../shared/models/visitas.model';
import { LaboratoriosService } from '../../laboratorios/services/laboratorios.service';
import { Laboratorio } from '../../laboratorios/models/laboratorio.model';
import { AuthService } from '../../../core/services/auth.service';

interface LabCard {
  id: string;
  sigla: string;
  nome: string;
  descricao: string;
}

@Component({
  standalone: false,
  selector: 'app-visitas-public',
  templateUrl: './visitas-public.component.html',
  styleUrls: ['./visitas-public.component.scss'],
})
export class VisitasPublicComponent implements OnInit, OnDestroy {
  visitas: SchoolVisit[] = [];
  visitForm: FormGroup;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  // Laboratórios exibidos apenas como informação — não são selecionáveis
  laboratorios: LabCard[] = [];

  // ====== Visão do usuário/admin logado: gestão de solicitações ======
  isAuthenticated = false;
  pendingVisitas: SchoolVisit[] = [];
  managementError = '';
  managementSuccess = '';
  private authSubscription?: Subscription;

  constructor(
    private visitasService: VisitasService,
    private laboratoriosService: LaboratoriosService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.visitForm = this.fb.group({
      school_name: ['', Validators.required],
      responsible_name: ['', Validators.required],
      contact_email: ['', [Validators.required, Validators.email]],
      contact_phone: ['', Validators.required],
      students_count: ['', [Validators.required, Validators.max(30)]],
      target_date: ['', Validators.required],
      shift: ['M', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadVisitas();
    this.loadLaboratorios();

    this.authSubscription = this.authService.isAuthenticated$.subscribe(
      (isAuth) => {
        this.isAuthenticated = isAuth;
        if (isAuth) {
          this.loadPendingVisitas();
        } else {
          this.pendingVisitas = [];
        }
      }
    );
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
  }

  loadVisitas() {
    this.visitasService.getAll().subscribe((data: SchoolVisit[]) => {
      this.visitas = data.filter((v: SchoolVisit) => v.status === 'confirmed');
    });
  }

  loadLaboratorios() {
    this.laboratoriosService.getAll().subscribe({
      next: (data: Laboratorio[]) => {
        this.laboratorios = data.map((lab) => this.toLabCard(lab));
      },
      error: () => {
        // Exibição informativa; falha ao carregar não deve bloquear o formulário
        this.laboratorios = [];
      },
    });
  }

  // Nomes seguem o padrão "SIGLA - Nome completo" (ver seed de laboratorios)
  private toLabCard(lab: Laboratorio): LabCard {
    const separatorIndex = lab.name.indexOf(' - ');
    const sigla =
      separatorIndex > 0 ? lab.name.substring(0, separatorIndex) : lab.name;
    const nome =
      separatorIndex > 0 ? lab.name.substring(separatorIndex + 3) : lab.name;

    return {
      id: lab.id || '',
      sigla,
      nome,
      descricao: lab.description,
    };
  }

  onSubmit() {
    if (this.visitForm.valid) {
      this.isSubmitting = true;
      this.successMessage = '';
      this.errorMessage = '';
      this.visitasService.create(this.visitForm.value).subscribe({
        next: () => {
          this.successMessage =
            'Solicitação enviada com sucesso! Você receberá um e-mail com os detalhes.';
          this.visitForm.reset();
          this.isSubmitting = false;
        },
        error: (err: any) => {
          console.error(err);
          this.errorMessage =
            err.error?.message ||
            'Ocorreu um erro ao processar sua solicitação.';
          this.isSubmitting = false;
        },
      });
    }
  }

  // ====== Visão do usuário/admin logado: gestão de solicitações ======

  loadPendingVisitas() {
    this.visitasService.getAll().subscribe((data: SchoolVisit[]) => {
      this.pendingVisitas = data.filter(
        (v: SchoolVisit) => v.status === 'pending'
      );
      this.pendingVisitas.forEach((v) => this.loadVisitDetails(v));
    });
  }

  private loadVisitDetails(visit: SchoolVisit) {
    this.visitasService.getById(visit.id).subscribe((detail: SchoolVisit) => {
      visit.labs = detail.labs;
    });
  }

  hasAvailableLab(visit: SchoolVisit): boolean {
    return !!visit.labs?.some((lab) => lab.status === 'available');
  }

  // Nomes seguem o padrão "SIGLA - Nome completo" (ver toLabCard)
  labSigla(name: string | undefined): string {
    if (!name) return '';
    const separatorIndex = name.indexOf(' - ');
    return separatorIndex > 0 ? name.substring(0, separatorIndex) : name;
  }

  labNome(name: string | undefined): string {
    if (!name) return '';
    const separatorIndex = name.indexOf(' - ');
    return separatorIndex > 0 ? name.substring(separatorIndex + 3) : name;
  }

  updateLabStatus(visitId: string, labId: string, status: string) {
    this.visitasService
      .updateLabAvailability(visitId, labId, status)
      .subscribe(() => {
        const visit = this.pendingVisitas.find((v) => v.id === visitId);
        if (visit) {
          this.loadVisitDetails(visit);
        }
      });
  }

  confirmVisit(visitId: string) {
    this.setVisitStatus(visitId, 'confirmed', 'Visita confirmada com sucesso.');
  }

  rejectVisit(visitId: string) {
    this.setVisitStatus(visitId, 'canceled', 'Visita recusada.');
  }

  private setVisitStatus(visitId: string, status: string, message: string) {
    this.managementError = '';
    this.managementSuccess = '';
    this.visitasService.updateStatus(visitId, status).subscribe({
      next: () => {
        this.managementSuccess = message;
        this.loadPendingVisitas();
        this.loadVisitas();
      },
      error: (err: any) => {
        this.managementError =
          err.error?.message || 'Erro ao atualizar a visita.';
      },
    });
  }
}
