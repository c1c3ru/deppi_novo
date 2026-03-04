import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BoletinsService } from '../../services/boletins.service';
import { Boletim } from '../../../../shared/models';

@Component({
    selector: 'app-boletim-detail',
    template: `
    <div class="boletim-detail">
      <div class="loading-state" *ngIf="loading">
        <div class="spinner"></div>
        <p>Carregando boletim...</p>
      </div>

      <div class="error-state" *ngIf="error">
        <p>{{ error }}</p>
        <button (click)="goBack()" class="back-btn">← Voltar</button>
      </div>

      <div *ngIf="boletim && !loading">
        <button (click)="goBack()" class="back-link">← Voltar à lista</button>

        <div class="detail-header">
          <div class="detail-badge">📄 Boletim</div>
          <h1 class="detail-title">{{ boletim.title }}</h1>
          <p class="detail-desc">{{ boletim.description }}</p>
          <div class="detail-meta">
            <span>📅 {{ boletim.publicationDate | date:'dd/MM/yyyy' }}</span>
            <span *ngIf="boletim.viewCount">👁 {{ boletim.viewCount }} visualizações</span>
          </div>
          <a *ngIf="boletim.fileUrl" [href]="boletim.fileUrl" target="_blank" class="download-btn">
            📥 Baixar PDF
          </a>
        </div>

        <div class="news-section" *ngIf="boletim.news?.length">
          <h2 class="section-title">📰 Notícias do Boletim</h2>
          <div class="news-grid">
            <div class="news-card" *ngFor="let n of boletim.news" [class.main]="n.isMain">
              <img *ngIf="n.imageUrl" [src]="n.imageUrl" [alt]="n.title" class="news-img" onerror="this.style.display='none'">
              <div class="news-body">
                <span class="news-badge" *ngIf="n.isMain">⭐ Principal</span>
                <h3>{{ n.title }}</h3>
                <p>{{ n.content }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .boletim-detail { max-width: 820px; }
    .loading-state, .error-state { text-align: center; padding: 4rem; color: #6b7280; }
    .spinner { width: 40px; height: 40px; border: 4px solid #e5e7eb; border-top-color: #0066b3; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 1rem; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .back-link, .back-btn { background: none; border: none; color: #0066b3; font-size: 0.95rem; cursor: pointer; padding: 0 0 1.5rem; display: inline-block; font-weight: 600; }
    .back-link:hover, .back-btn:hover { text-decoration: underline; }
    .detail-badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 99px; font-size: 0.8rem; background: #e0f2fe; color: #0066b3; margin-bottom: 1rem; font-weight: 600; }
    .detail-title { font-size: 2rem; font-weight: 800; color: #1a1a2e; margin: 0 0 0.75rem; line-height: 1.25; }
    .detail-desc { color: #6b7280; font-size: 1.05rem; line-height: 1.6; margin: 0 0 1.25rem; }
    .detail-meta { display: flex; gap: 1.5rem; color: #9ca3af; font-size: 0.9rem; margin-bottom: 1.5rem; }
    .download-btn { display: inline-block; padding: 0.75rem 1.5rem; background: #0066b3; color: white; border-radius: 0.5rem; text-decoration: none; font-weight: 600; transition: background 0.2s; }
    .download-btn:hover { background: #0052a3; }
    .news-section { margin-top: 3rem; }
    .section-title { font-size: 1.4rem; font-weight: 700; color: #1a1a2e; margin: 0 0 1.5rem; padding-bottom: 0.75rem; border-bottom: 2px solid #e5e7eb; }
    .news-grid { display: grid; gap: 1.25rem; }
    .news-card { background: white; border-radius: 1rem; overflow: hidden; border: 1px solid #e5e7eb; display: flex; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
    .news-card.main { border-color: #0066b3; }
    .news-img { width: 200px; object-fit: cover; flex-shrink: 0; }
    .news-body { padding: 1.5rem; }
    .news-badge { display: inline-block; padding: 0.2rem 0.6rem; background: #fef3c7; color: #d97706; border-radius: 99px; font-size: 0.75rem; font-weight: 600; margin-bottom: 0.75rem; }
    .news-body h3 { font-size: 1.1rem; font-weight: 700; color: #1a1a2e; margin: 0 0 0.75rem; }
    .news-body p { color: #6b7280; line-height: 1.6; margin: 0; }
    @media (max-width: 600px) { .news-card { flex-direction: column; } .news-img { width: 100%; height: 160px; } }
  `]
})
export class BoletimDetailComponent implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly boletinsService = inject(BoletinsService);

    boletim: Boletim | null = null;
    loading = false;
    error = '';

    ngOnInit(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        if (id) { this.load(id); } else { this.error = 'ID inválido.'; }
    }

    load(id: number): void {
        this.loading = true;
        this.boletinsService.getById(id).subscribe({
            next: (b) => { this.boletim = b; this.loading = false; },
            error: () => { this.error = 'Boletim não encontrado.'; this.loading = false; }
        });
    }

    goBack(): void { this.router.navigate(['/boletins']); }
}
