import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VisitasService } from '../services/visitas.service';
import { SchoolVisit } from '../../../shared/models/visitas.model';

@Component({
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
  
  // Hardcoded for MVP, should be fetched from lab service ideally
  availableLabs = [
    { id: '1', name: 'LAQAMB' },
    { id: '2', name: 'LAPP' },
    { id: '3', name: 'MAKER' },
    { id: '4', name: 'OFICINA' },
    { id: '5', name: 'LQOI' },
    { id: '6', name: 'LABVICIA' },
    { id: '7', name: 'LASIC' },
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

  onLabChange(event: any, labId: string) {
    const labIds = this.visitForm.get('lab_ids')?.value as string[];
    if (event.target.checked) {
      labIds.push(labId);
    } else {
      const index = labIds.indexOf(labId);
      if (index >= 0) {
        labIds.splice(index, 1);
      }
    }
    this.visitForm.get('lab_ids')?.setValue(labIds);
  }
}
