import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VisitasService } from '../services/visitas.service';
import { SchoolVisit } from '../../../shared/models/visitas.model';

@Component({
  standalone: false,
  selector: 'app-visitas-public',
  templateUrl: './visitas-public.component.html',
  styleUrls: ['./visitas-public.component.scss']
})
export class VisitasPublicComponent implements OnInit {
  visitas: SchoolVisit[] = [];
  visitForm: FormGroup;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  
  // Laboratórios disponíveis com sigla, nome completo e descrição resumida
  laboratorios = [
    {
      id: '1',
      sigla: 'LAQAMB',
      nome: 'Laboratório de Qualidade Ambiental',
      descricao: 'Análises ambientais, monitoramento de água, solo e ar, com foco em sustentabilidade e preservação do meio ambiente.'
    },
    {
      id: '2',
      sigla: 'LAPP',
      nome: 'Laboratório de Práticas Pedagógicas',
      descricao: 'Espaço dedicado à formação docente, metodologias de ensino e práticas pedagógicas inovadoras para professores e licenciandos.'
    },
    {
      id: '3',
      sigla: 'MAKER',
      nome: 'Espaço Maker IFCE',
      descricao: 'Espaço de prototipagem e fabricação digital com impressoras 3D, cortadora a laser e eletrônica embarcada.'
    },
    {
      id: '4',
      sigla: 'OFICINA',
      nome: 'Oficina Mecânica e Eletromecânica',
      descricao: 'Laboratório de práticas mecânicas, usinagem, soldagem e manutenção eletromecânica industrial.'
    },
    {
      id: '5',
      sigla: 'LQOI',
      nome: 'Laboratório de Química Orgânica e Inorgânica',
      descricao: 'Experimentação química, síntese de compostos e análises instrumentais em química orgânica e inorgânica.'
    },
    {
      id: '6',
      sigla: 'LABVICIA',
      nome: 'Laboratório de Visão Computacional e IA',
      descricao: 'Projetos em inteligência artificial, visão computacional, machine learning e reconhecimento de padrões.'
    },
    {
      id: '7',
      sigla: 'LASIC',
      nome: 'Laboratório de Sistemas e Computação',
      descricao: 'Desenvolvimento de software, redes de computadores, segurança da informação e sistemas embarcados.'
    },
  ];

  constructor(
    private visitasService: VisitasService,
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
      lab_ids: [[], Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadVisitas();
  }

  loadVisitas() {
    this.visitasService.getAll().subscribe((data: SchoolVisit[]) => {
      this.visitas = data.filter((v: SchoolVisit) => v.status === 'confirmed');
    });
  }

  onSubmit() {
    if (this.visitForm.valid) {
      this.isSubmitting = true;
      this.successMessage = '';
      this.errorMessage = '';
      this.visitasService.create(this.visitForm.value).subscribe({
        next: () => {
          this.successMessage = 'Solicitação enviada com sucesso! Você receberá um e-mail com os detalhes.';
          this.visitForm.reset();
          this.isSubmitting = false;
        },
        error: (err: any) => {
          console.error(err);
          this.errorMessage = err.error?.message || 'Ocorreu um erro ao processar sua solicitação.';
          this.isSubmitting = false;
        }
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
