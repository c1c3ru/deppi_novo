import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { RevistaService } from '../../services/revista.service';
import { AuthService } from '../../../../core/services/auth.service';
import { RevistaArtigo } from '../../../../shared/models';

@Component({
  standalone: false,
  selector: 'app-revista-artigo-detail',
  template: `
    <section class="artigo-detail">
      <div class="loading-state" *ngIf="loading">
        <div class="spinner"></div>
        <p>Carregando artigo...</p>
      </div>

      <div class="error-state surface" *ngIf="error">
        <p>{{ error }}</p>
        <a routerLink="/revista/edicoes" class="btn btn-glass">Voltar às edições</a>
      </div>

      <ng-container *ngIf="!loading && !error && artigo">
        <button class="btn-back" (click)="goBack()">&larr; Voltar à edição</button>

        <article class="artigo-card surface">
          <div class="artigo-meta">
            <span class="volume-badge" *ngIf="artigo.edicao">
              Vol. {{ artigo.edicao.volume }} &middot; {{ artigo.edicao.ano }}
            </span>
            <a
              *ngIf="isAdmin"
              [routerLink]="['/revista/admin/artigos', artigo.id, 'editar']"
              class="btn-edit"
              >Editar</a
            >
          </div>

          <h1>{{ artigo.title }}</h1>
          <p class="authors" *ngIf="artigo.authors">{{ artigo.authors }}</p>
          <p class="summary" *ngIf="artigo.summary">{{ artigo.summary }}</p>

          <div class="artigo-content" [innerHTML]="sanitizedContent"></div>
        </article>
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

      .artigo-card {
        padding: 3rem;
      }

      .artigo-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
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
      }

      .btn-edit {
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--color-secondary);
        text-decoration: none;
      }

      .artigo-card h1 {
        font-size: clamp(1.6rem, 4vw, 2.2rem);
        margin-bottom: 0.6rem;
      }

      .authors {
        font-size: 0.9rem;
        color: var(--color-text-muted);
        font-style: italic;
        margin-bottom: 1.2rem;
      }

      .summary {
        font-size: 1.05rem;
        color: var(--color-text-secondary);
        padding-bottom: 1.5rem;
        margin-bottom: 1.5rem;
        border-bottom: 1px solid var(--color-border-light);
      }

      .artigo-content {
        line-height: 1.8;
        color: var(--color-text);
      }

      ::ng-deep .artigo-content img {
        max-width: 100%;
        border-radius: var(--border-radius-md);
      }
    `,
  ],
})
export class RevistaArtigoDetailComponent implements OnInit {
  private readonly revistaService = inject(RevistaService);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sanitizer = inject(DomSanitizer);

  artigo: RevistaArtigo | null = null;
  sanitizedContent: SafeHtml = '';
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
    this.revistaService.getArtigoById(id).subscribe({
      next: (artigo) => {
        this.artigo = artigo;
        this.sanitizedContent = this.sanitizer.bypassSecurityTrustHtml(
          artigo.content || ''
        );
        this.loading = false;
      },
      error: () => {
        this.error = 'Artigo não encontrado.';
        this.loading = false;
      },
    });
  }

  goBack(): void {
    if (this.artigo?.edicaoId) {
      this.router.navigate(['/revista/edicoes', this.artigo.edicaoId]);
    } else {
      this.router.navigate(['/revista/edicoes']);
    }
  }
}
