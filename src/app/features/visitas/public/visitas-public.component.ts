import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VisitasService } from '../services/visitas.service';
import { SchoolVisit } from '../../../shared/models/visitas.model';
import { LaboratoriosService } from '../../laboratorios/services/laboratorios.service';
import { Laboratorio } from '../../laboratorios/models/laboratorio.model';

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
export class VisitasPublicComponent implements OnInit {
  visitas: SchoolVisit[] = [];
  visitForm: FormGroup;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  // Laboratórios disponíveis, carregados a partir de /api/laboratorios
  laboratorios: LabCard[] = [];

  constructor(
    private visitasService: VisitasService,
    private laboratoriosService: LaboratoriosService,
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
      lab_ids: [[], Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadVisitas();
    this.loadLaboratorios();
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
        // Seleção de laboratório é opcional na visita; falha silenciosa não
        // deve bloquear o formulário de agendamento.
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

  // Alterna a seleção de um laboratório pelo card
  toggleLab(labId: string): void {
    const labIds = this.visitForm.get('lab_ids')?.value as string[];
    const indice = labIds.indexOf(labId);
    if (indice >= 0) {
      labIds.splice(indice, 1);
    } else {
      labIds.push(labId);
    }
    this.visitForm.get('lab_ids')?.setValue([...labIds]);
  }

  // Verifica se um laboratório está selecionado
  isLabSelected(labId: string): boolean {
    const labIds = this.visitForm.get('lab_ids')?.value as string[];
    return labIds.includes(labId);
  }
}
