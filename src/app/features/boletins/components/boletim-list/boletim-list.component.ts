import { Component, OnInit, inject } from '@angular/core';
import { BoletinsService } from '../../services/boletins.service';
import { Boletim } from '../../../../shared/models';
import { Router } from '@angular/router';

@Component({
    selector: 'app-boletim-list',
    template: `
    <div class="boletim-list">
      <div class="list-header">
        <h1 class="list-title">📋 Boletins DEPPI</h1>
        <p class="list-subtitle">Relatórios mensais e comunicados do Departamento</p>
      </div>

      <div class="loading-state" *ngIf="loading">
        <div class="spinner"></div>
        <p>Carregando boletins...</p>
      </div>

      <div class="error-state" *ngIf="error">
        <p>{{ error }}</p>
        <button (click)="load()" class="retry-btn">Tentar novamente</button>
      </div>

      <div class="boletins-grid" *ngIf="!loading && !error">
        <div class="boletim-card" *ngFor="let b of boletins" (click)="openBoletim(b.id)">
          <div class="card-badge" [class.featured]="b.isFeatured">
            {{ b.isFeatured ? '⭐ Destaque' : '📄 Boletim' }}
          </div>
          <h2 class="card-title">{{ b.title }}</h2>
          <p class="card-desc">{{ b.description }}</p>
          <div class="card-meta">
            <span class="date">📅 {{ b.publicationDate | date:'dd/MM/yyyy' }}</span>
            <span class="status" [class.published]="b.status === 'published'">
              {{ b.status === 'published' ? '✅ Publicado' : '📝 Rascunho' }}
            </span>
          </div>
          <button class="card-btn">Ver boletim →</button>
        </div>

        <div class="empty-state" *ngIf="boletins.length === 0">
          <div class="empty-icon">📭</div>
          <h3>Nenhum boletim encontrado</h3>
          <p>Os boletins aparecerão aqui quando disponíveis.</p>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .boletim-list { max-width: 900px; }
    .list-header { margin-bottom: 2rem; }
    .list-title { font-size: 1.8rem; font-weight: 800; color: #1a1a2e; margin: 0 0 0.5rem; }
    .list-subtitle { color: #6b7280; margin: 0; }
    .loading-state, .error-state { text-align: center; padding: 4rem; color: #6b7280; }
    .spinner { width: 40px; height: 40px; border: 4px solid #e5e7eb; border-top-color: #0066b3; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 1rem; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .retry-btn { margin-top: 1rem; padding: 0.6rem 1.5rem; background: #0066b3; color: white; border: none; border-radius: 0.5rem; cursor: pointer; }
    .boletins-grid { display: grid; gap: 1.25rem; }
    .boletim-card { background: white; border-radius: 1rem; padding: 1.75rem; border: 1px solid #e5e7eb; box-shadow: 0 2px 8px rgba(0,0,0,0.05); cursor: pointer; transition: all 0.2s; }
    .boletim-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,102,179,0.12); border-color: #0066b3; }
    .card-badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 99px; font-size: 0.8rem; font-weight: 600; background: #e0f2fe; color: #0066b3; margin-bottom: 1rem; }
    .card-badge.featured { background: #fef3c7; color: #d97706; }
    .card-title { font-size: 1.2rem; font-weight: 700; color: #1a1a2e; margin: 0 0 0.75rem; }
    .card-desc { color: #6b7280; margin: 0 0 1.25rem; line-height: 1.6; }
    .card-meta { display: flex; gap: 1rem; align-items: center; margin-bottom: 1.25rem; }
    .date { font-size: 0.85rem; color: #9ca3af; }
    .status { font-size: 0.8rem; padding: 0.2rem 0.6rem; border-radius: 99px; background: #f3f4f6; }
    .status.published { background: #d1fae5; color: #065f46; }
    .card-btn { background: #0066b3; color: white; border: none; padding: 0.6rem 1.25rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; transition: background 0.2s; }
    .card-btn:hover { background: #0052a3; }
    .empty-state { text-align: center; padding: 4rem; color: #9ca3af; }
    .empty-icon { font-size: 4rem; margin-bottom: 1rem; }
    .empty-state h3 { color: #6b7280; font-size: 1.2rem; margin: 0 0 0.5rem; }
    .empty-state p { margin: 0; }
  `]
})
export class BoletimListComponent implements OnInit {
    private readonly boletinsService = inject(BoletinsService);
    private readonly router = inject(Router);

    boletins: Boletim[] = [];
    loading = false;
    error = '';

    ngOnInit(): void {
        this.load();
    }

    load(): void {
        this.loading = true;
        this.error = '';
        this.boletinsService.getAll().subscribe({
            next: (res) => {
                this.boletins = res.data;
                this.loading = false;
            },
            error: (err) => {
                this.error = 'Não foi possível carregar os boletins. Tente novamente.';
                this.loading = false;
            }
        });
    }

    openBoletim(id: number): void {
        this.router.navigate(['/boletins', id]);
    }
}
