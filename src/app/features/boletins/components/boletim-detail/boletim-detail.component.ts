import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BoletinsService } from '../../services/boletins.service';
import { Boletim } from '../../../../shared/models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-boletim-detail',
  template: `
    <div class="boletim-detail-page animate-in">
      <div class="loading-state" *ngIf="loading">
        <div class="spinner"></div>
        <p class="font-display">Recuperando informativo...</p>
      </div>

      <div class="error-state surface" *ngIf="error">
        <div class="error-content">
          <span class="error-icon">📂</span>
          <h3>Boletim não encontrado</h3>
          <p>{{ error }}</p>
          <button (click)="goBack()" class="btn btn-primary">Voltar ao Arquivo</button>
        </div>
      </div>

      <div class="detail-container" *ngIf="boletim && !loading">
        <nav class="detail-nav">
          <button (click)="goBack()" class="btn-back">
            <span>&larr;</span> Voltar para a lista
          </button>
        </nav>

        <header class="detail-header surface">
          <div class="header-meta">
            <span class="detail-badge" [class.featured]="boletim.isFeatured">
              {{ boletim.isFeatured ? '⭐ Destaque' : '📄 Boletim DEPPI' }}
            </span>
            <span class="detail-date">{{ boletim.publicationDate | date:'fullDate' }}</span>
          </div>
          
          <h1 class="detail-title">{{ boletim.title }}</h1>
          <p class="detail-desc">{{ boletim.description }}</p>
          
          <div class="header-actions">
            <a *ngIf="boletim.fileUrl" [href]="boletim.fileUrl" target="_blank" class="btn btn-primary">
               Baixar Edição Completa (PDF)
            </a>
            <div class="view-count" *ngIf="boletim.viewCount">
              <span class="icon">👁</span>
              <span>{{ boletim.viewCount }} visualizações</span>
            </div>
          </div>
        </header>

        <section class="news-section" *ngIf="boletim.news?.length">
          <div class="section-header">
            <h2 class="section-title">Conteúdo Destaque</h2>
            <div class="section-divider"></div>
          </div>
          
          <div class="news-grid">
            <div class="news-card surface" *ngFor="let n of boletim.news" [class.main]="n.isMain">
              <div class="news-visual" *ngIf="n.imageUrl">
                <img [src]="n.imageUrl" [alt]="n.title" class="news-img" onerror="this.parentElement.style.display='none'">
              </div>
              <div class="news-body">
                <span class="news-type-badge" *ngIf="n.isMain">Destaque Principal</span>
                <h3 class="news-title">{{ n.title }}</h3>
                <p class="news-content">{{ n.content }}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .boletim-detail-page {
      max-width: 900px;
      margin: 0 auto;
      padding-bottom: 5rem;
    }

    .detail-nav {
      margin-bottom: 2rem;
    }

    .btn-back {
      background: none;
      border: none;
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--color-primary);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0;
      transition: transform var(--transition-fast);
    }

    .btn-back:hover {
      transform: translateX(-5px);
    }

    .detail-header {
      padding: 4rem;
      margin-bottom: 4rem;
    }

    .header-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .detail-badge {
      font-size: 0.75rem;
      font-weight: 800;
      padding: 0.4rem 1.2rem;
      background: rgba(var(--color-primary-rgb), 0.1);
      color: var(--color-primary);
      border-radius: var(--border-radius-full);
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }

    .detail-badge.featured {
      background: rgba(var(--color-accent-rgb), 0.15);
      color: #b45309;
    }

    .detail-date {
      font-size: 0.85rem;
      color: var(--color-text-muted);
      text-transform: capitalize;
    }

    .detail-title {
      font-size: clamp(1.8rem, 4vw, 2.8rem);
      margin-bottom: 1.5rem;
      color: var(--color-text);
      line-height: 1.1;
    }

    .detail-desc {
      font-size: 1.2rem;
      line-height: 1.7;
      color: var(--color-text-secondary);
      margin-bottom: 3rem;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 2rem;
      padding-top: 2rem;
      border-top: 1px solid var(--color-border-light);
    }

    .view-count {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: var(--color-text-muted);
      font-weight: 600;
    }

    .news-section {
      margin-top: 4rem;
    }

    .section-header {
      margin-bottom: 3rem;
    }

    .section-title {
      font-size: 1.8rem;
      margin-bottom: 0.5rem;
    }

    .section-divider {
      width: 40px;
      height: 4px;
      background: var(--color-primary);
      border-radius: var(--border-radius-full);
    }

    .news-grid {
      display: grid;
      gap: 2rem;
    }

    .news-card {
      padding: 0;
      overflow: hidden;
      display: grid;
      grid-template-columns: 240px 1fr;
    }

    .news-card.main {
      border: 2px solid rgba(var(--color-primary-rgb), 0.2);
    }

    .news-visual {
      height: 100%;
    }

    .news-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .news-body {
      padding: 2.5rem;
    }

    .news-type-badge {
      display: inline-block;
      font-size: 0.7rem;
      font-weight: 800;
      text-transform: uppercase;
      color: var(--color-primary);
      margin-bottom: 1rem;
    }

    .news-title {
      font-size: 1.4rem;
      margin-bottom: 1rem;
      color: var(--color-text);
    }

    .news-content {
      font-size: 1rem;
      line-height: 1.7;
      color: var(--color-text-secondary);
    }

    @media (max-width: 768px) {
      .detail-header {
        padding: 2.5rem 1.5rem;
      }
      .news-card {
        grid-template-columns: 1fr;
      }
      .news-visual {
        height: 200px;
      }
      .header-actions {
        flex-direction: column;
        align-items: flex-start;
        gap: 1.5rem;
      }
    }
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
    if (id) {
      this.load(id);
    } else {
      this.error = 'Identificador de boletim inválido.';
    }
  }

  load(id: number): void {
    this.loading = true;
    this.boletinsService.getById(id).subscribe({
      next: (b) => {
        this.boletim = b;
        this.loading = false;
      },
      error: () => {
        this.error = 'O boletim solicitado não foi encontrado em nossa base de dados.';
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/boletins']);
  }
}
