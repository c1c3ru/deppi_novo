import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RevistaService } from '../../services/revista.service';
import { AuthService } from '../../../../core/services/auth.service';
import { RevistaEdicao } from '../../../../shared/models';

@Component({
  standalone: false,
  selector: 'app-revista-edicao-detail',
  template: `
    <section class="edicao-detail">
      <div class="loading-state" *ngIf="loading">
        <div class="spinner"></div>
        <p>Carregando edição...</p>
      </div>

      <div class="error-state surface" *ngIf="error">
        <p>{{ error }}</p>
        <a routerLink="/revista/edicoes" class="btn btn-glass">Voltar às edições</a>
      </div>

      <ng-container *ngIf="!loading && !error && edicao">
        <button class="btn-back" (click)="goBack()">&larr; Todas as edições</button>

        <header class="edicao-header surface">
          <span class="volume-badge">Vol. {{ edicao.volume }} &middot; {{ edicao.ano }}</span>
          <h1>{{ edicao.title }}</h1>
          <p *ngIf="edicao.description">{{ edicao.description }}</p>
          <a
            *ngIf="isAdmin"
            [routerLink]="['/revista/admin/edicoes', edicao.id, 'artigos', 'novo']"
            class="btn btn-primary add-artigo-btn"
          >
            + Novo Artigo
          </a>
        </header>

        <div class="artigos-list" *ngIf="edicao.artigos && edicao.artigos.length > 0">
          <div
            class="artigo-card surface"
            *ngFor="let a of edicao.artigos"
            (click)="openArtigo(a.id)"
          >
            <h3>{{ a.title }}</h3>
            <p class="authors" *ngIf="a.authors">{{ a.authors }}</p>
            <p class="summary" *ngIf="a.summary">{{ a.summary }}</p>
            <span class="btn-read">Ler artigo &rarr;</span>
          </div>
        </div>

        <div class="empty-artigos surface" *ngIf="!edicao.artigos || edicao.artigos.length === 0">
          <p>Esta edição ainda não possui artigos publicados.</p>
        </div>
      </ng-container>
    </section>
  `,
  styles: [
    `
      .loading-state,
      .error-state {
        text-align: center;
        padding: 4rem 0;
        color: var(--color-text-secondary);
      }

      .spinner {
        width: 50px;
        height: 50px;
        border: 3px solid var(--color-background-secondary);
        border-top-color: var(--color-primary);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 1.5rem;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .btn-back {
        background: none;
        border: none;
        color: var(--color-text-secondary);
        font-weight: 600;
        font-size: 0.9rem;
        margin-bottom: 1.5rem;
        padding: 0;
      }

      .btn-back:hover {
        color: var(--color-primary);
      }

      .edicao-header {
        padding: 2.5rem;
        margin-bottom: 2rem;
      }

      .volume-badge {
        display: inline-block;
        font-size: 0.75rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        padding: 0.35rem 0.9rem;
        background: rgba(var(--color-primary-rgb), 0.1);
        color: var(--color-primary);
        border-radius: var(--border-radius-full);
        margin-bottom: 0.8rem;
      }

      .edicao-header h1 {
        font-size: clamp(1.6rem, 4vw, 2.2rem);
        margin-bottom: 0.8rem;
      }

      .edicao-header p {
        color: var(--color-text-secondary);
        max-width: 700px;
      }

      .add-artigo-btn {
        display: inline-block;
        margin-top: 1.5rem;
      }

      .artigos-list {
        display: flex;
        flex-direction: column;
        gap: 1.2rem;
      }

      .artigo-card {
        padding: 2rem;
        cursor: pointer;
        transition: all var(--transition-fast);
      }

      .artigo-card:hover {
        border-color: var(--color-primary);
        box-shadow: var(--shadow-sm);
      }

      .artigo-card h3 {
        margin-bottom: 0.4rem;
      }

      .authors {
        font-size: 0.85rem;
        color: var(--color-text-muted);
        font-style: italic;
        margin-bottom: 0.6rem;
      }

      .summary {
        color: var(--color-text-secondary);
        margin-bottom: 1rem;
      }

      .btn-read {
        font-weight: 800;
        font-size: 0.85rem;
        color: var(--color-primary);
      }

      .empty-artigos {
        padding: 3rem;
        text-align: center;
        color: var(--color-text-muted);
      }
    `,
  ],
})
export class RevistaEdicaoDetailComponent implements OnInit {
  private readonly revistaService = inject(RevistaService);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  edicao: RevistaEdicao | null = null;
  loading = false;
  error = '';
  isAdmin = false;

  ngOnInit(): void {
    this.isAdmin = this.authService.hasRole('admin');
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      if (id) this.load(id);
    });
  }

  load(id: number): void {
    this.loading = true;
    this.error = '';
    this.revistaService.getEdicaoById(id).subscribe({
      next: (edicao) => {
        this.edicao = edicao;
        this.loading = false;
      },
      error: () => {
        this.error = 'Edição não encontrada.';
        this.loading = false;
      },
    });
  }

  openArtigo(id: number): void {
    this.router.navigate(['/revista/artigos', id]);
  }

  goBack(): void {
    this.router.navigate(['/revista/edicoes']);
  }
}
