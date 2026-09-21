import { Component, OnInit } from '@angular/core';
import { VisitasService } from '../services/visitas.service';
import { SchoolVisit } from '../../../shared/models/visitas.model';

@Component({
  standalone: false,
  selector: 'app-visitas-admin',
  templateUrl: './visitas-admin.component.html',
  styleUrls: ['./visitas-admin.component.scss'],
})
export class VisitasAdminComponent implements OnInit {
  visitas: SchoolVisit[] = [];
  errorMessage = '';
  successMessage = '';

  constructor(private visitasService: VisitasService) {}

  ngOnInit(): void {
    this.loadVisitas();
  }

  loadVisitas() {
    this.visitasService.getAll().subscribe((data: SchoolVisit[]) => {
      this.visitas = data;
      // Load details for each visit to get lab availabilities
      this.visitas.forEach((v) => this.loadVisitDetails(v));
    });
  }

  loadVisitDetails(visit: SchoolVisit) {
    this.visitasService.getById(visit.id).subscribe((detail: SchoolVisit) => {
      visit.labs = detail.labs;
    });
  }

  updateLabStatus(visitId: string, labId: string, status: string) {
    this.visitasService
      .updateLabAvailability(visitId, labId, status)
      .subscribe(() => {
        const visit = this.visitas.find((v) => v.id === visitId);
        if (visit) {
          this.loadVisitDetails(visit);
        }
      });
  }

  updateGlobalStatus(visitId: string, status: string) {
    this.errorMessage = '';
    this.successMessage = '';
    this.visitasService.updateStatus(visitId, status).subscribe({
      next: () => {
        this.successMessage = `Visita atualizada com sucesso.`;
        this.loadVisitas();
      },
      error: (err: any) => {
        this.errorMessage = err.error?.message || 'Erro ao atualizar visita.';
      },
    });
  }
}
