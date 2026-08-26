import { Component, OnInit, ElementRef, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RevistaService } from '../../services/revista.service';
import { RevistaEdicao } from '../../../../shared/models';

@Component({
  standalone: false,
  selector: 'app-revista-edicoes-list',
  template: `
    <section class="edicoes-page">
      <div class="loading-state" *ngIf="loading">
        <div class="spinner"></div>
        <p>Carregando edições...</p>
      </div>

      <div class="error-state surface" *ngIf="error">
        <p>{{ error }}</p>
      </div>

      <ng-container *ngIf="!loading && !error">
        <div class="empty-state surface" *ngIf="edicoes.length === 0">
          <span class="empty-icon">🗂️</span>
          <h3>Nenhuma edição publicada ainda</h3>
          <p>
            O primeiro volume da Revista DEPPI está em preparação. Em breve
            a edição atual estará disponível nesta página.
          </p>
        </div>

        <ng-container *ngIf="edicoes.length > 0">
          <div class="current-block">
            <h2 class="section-title">Edição Atual</h2>
            <div
              class="current-card surface"
              (click)="openEdicao(edicaoAtual!.id)"
            >
              <div class="current-info">
                <span class="volume-badge"
                  >Vol. {{ edicaoAtual!.volume }} &middot;
                  {{ edicaoAtual!.ano }}</span
                >
                <h3>{{ edicaoAtual!.title }}</h3>
                <p>{{ edicaoAtual!.description }}</p>
              </div>
              <span class="btn-read">Acessar edição &rarr;</span>
            </div>
          </div>

          <div class="previous-block" #previousSection>
            <h2 class="section-title">Edições Anteriores</h2>
            <div class="previous-grid" *ngIf="edicoesAnteriores.length > 0">
              <div
                class="previous-card surface"
                *ngFor="let e of edicoesAnteriores"
                (click)="openEdicao(e.id)"
              >
                <span class="volume-badge">Vol. {{ e.volume }} &middot; {{ e.ano }}</span>
                <h4>{{ e.title }}</h4>
              </div>
            </div>
            <p class="no-previous" *ngIf="edicoesAnteriores.length === 0">
              Ainda não há edições anteriores. Este é o primeiro volume da
              publicação.
            </p>
          </div>
        </ng-container>
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

      .empty-state {
        text-align: center;
        padding: 5rem 2rem;
      }

      .empty-icon {
        font-size: 3rem;
        display: block;
        margin-bottom: 1.5rem;
      }

      .section-title {
        font-size: 1.3rem;
        margin-bottom: 1.2rem;
      }

      .current-block {
        margin-bottom: 3rem;
      }

      .current-card {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 2rem;
        padding: 2.5rem;
        cursor: pointer;
        border: 1px solid var(--color-border-light);
        transition: all var(--transition-fast);
      }

      .current-card:hover {
        border-color: var(--color-primary);
        box-shadow: var(--shadow-md);
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

      .current-info h3 {
        font-size: 1.5rem;
        margin-bottom: 0.6rem;
      }

      .current-info p {
        color: var(--color-text-secondary);
      }

      .btn-read {
        white-space: nowrap;
        font-weight: 800;
        color: var(--color-primary);
        font-size: 0.9rem;
      }

      .previous-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 1.2rem;
      }

      .previous-card {
        padding: 1.5rem;
        cursor: pointer;
        transition: all var(--transition-fast);
      }

      .previous-card:hover {
        border-color: var(--color-primary);
        transform: translateY(-2px);
      }

      .previous-card h4 {
        font-size: 1rem;
        margin-top: 0.6rem;
      }

      .no-previous {
        color: var(--color-text-muted);
        font-style: italic;
      }

      @media (max-width: 640px) {
        .current-card {
          flex-direction: column;
          align-items: flex-start;
          padding: 1.8rem;
        }
      }
    `,
  ],
})
export class RevistaEdicoesListComponent implements OnInit {
  private readonly revistaService = inject(RevistaService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  @ViewChild('previousSection') previousSection?: ElementRef;

  edicoes: RevistaEdicao[] = [];
  loading = false;
  error = '';

  get edicaoAtual(): RevistaEdicao | null {
    return this.edicoes.length > 0 ? this.edicoes[0] : null;
  }

  get edicoesAnteriores(): RevistaEdicao[] {
    return this.edicoes.slice(1);
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.revistaService.getEdicoes().subscribe({
      next: (res) => {
        this.edicoes = res.data;
        this.loading = false;
        this.route.queryParams.subscribe((params) => {
          if (params['secao'] === 'anteriores') {
            setTimeout(
              () =>
                this.previousSection?.nativeElement.scrollIntoView({
                  behavior: 'smooth',
                }),
              100
            );
          }
        });
      },
      error: () => {
        this.error = 'Não foi possível carregar as edições da revista.';
        this.loading = false;
      },
    });
  }

  openEdicao(id: number): void {
    this.router.navigate(['/revista/edicoes', id]);
  }
}
