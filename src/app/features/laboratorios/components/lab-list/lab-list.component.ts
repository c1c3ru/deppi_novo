import { Component, OnInit, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { LaboratoriosService } from '../../services/laboratorios.service';
import { Laboratorio } from '../../models/laboratorio.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-lab-list',
  standalone: false,
  templateUrl: './lab-list.component.html',
  styleUrls: ['./lab-list.component.scss']
})
export class LabListComponent implements OnInit {
  private labsService = inject(LaboratoriosService);
  private authService = inject(AuthService);

  laboratorios: Laboratorio[] = [];
  loading = true;
  isAdmin$: Observable<boolean> = this.authService.isAuthenticated$;

  ngOnInit() {
    this.loadLabs();
  }

  loadLabs() {
    this.labsService.getAll().subscribe({
      next: (data) => {
        this.laboratorios = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
