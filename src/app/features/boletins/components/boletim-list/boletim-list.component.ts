import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
  inject,
} from '@angular/core';
import { BoletinsService } from '../../services/boletins.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Boletim } from '../../../../shared/models';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-boletim-list',
  standalone: false,
  template: `
    <div class="boletim-list-page animate-in">
      <header class="list-header">
        <div class="header-content">
          <div>
            <div class="badge">Informativos Oficiais</div>
            <h1 class="list-title">
              Central de <span class="highlight">Boletins</span>
            </h1>
            <p class="list-subtitle">
              Acompanhe as últimas atualizações, projetos e conquistas do DEPPI
              no IFCE Maracanaú.
            </p>
          </div>
          <div class="actions-header" *ngIf="isAuthenticated">
            <button class="btn btn-primary" (click)="createNew()">
              <span class="icon">+</span> Novo Boletim
            </button>
          </div>
        </div>
      </header>

      <div class="loading-state" *ngIf="loading">
        <div class="spinner"></div>
        <p class="font-display">Sincronizando registros de inovação...</p>
      </div>

      <div class="error-state surface" *ngIf="error">
        <div class="error-content">
          <span class="error-icon">📡</span>
          <h3>Falha na Conexão</h3>
          <p>{{ error }}</p>
          <button (click)="load()" class="btn btn-primary">
            Tentar Reconectar
          </button>
        </div>
      </div>

      <div
        class="boletins-grid"
        *ngIf="!loading && !error && boletins.length > 0"
      >
        <div
          class="boletim-card surface"
          *ngFor="let b of boletins"
          (click)="openBoletim(b.id)"
        >
          <div class="card-header">
            <span class="card-badge" [class.featured]="b.isFeatured">
              {{
                b.isFeatured ? '⭐ Destaque Institucional' : '📄 Informativo'
              }}
            </span>
            <span class="card-date">{{
              b.publicationDate | date: 'MMMM, yyyy'
            }}</span>
          </div>

          <div class="card-content">
            <h2 class="card-title">{{ b.title }}</h2>
            <p class="card-desc">{{ b.description }}</p>
          </div>

          <div class="card-footer">
            <div class="status-indicator">
              <span
                class="dot"
                [class.active]="b.status === 'published'"
                [class.draft]="b.status === 'draft'"
              ></span>
              <span class="status-text">{{
                b.status === 'published' ? 'Disponível' : 'Rascunho'
              }}</span>
            </div>
            <div class="actions" *ngIf="isAuthenticated">
              <button
                class="btn-action edit"
                title="Editar"
                (click)="editBoletim(b.id, $event)"
              >
                ✏️
              </button>
              <button
                class="btn-action delete"
                title="Excluir"
                (click)="deleteBoletim(b.id, $event)"
              >
                🗑️
              </button>
            </div>
            <button class="btn-read" *ngIf="!isAuthenticated">
              Acessar conteúdo &rarr;
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        class="empty-state surface"
        *ngIf="!loading && !error && boletins.length === 0"
      >
        <div class="empty-visual">
          <div class="empty-icon">📂</div>
          <div class="empty-ring"></div>
        </div>
        <h3>Arquivo em Construção</h3>
        <p>
          Ainda não há boletins publicados. Novos conteúdos serão listados aqui
          em breve.
        </p>
      </div>

      <!-- Scroll Trigger -->
      <div
        #scrollTrigger
        class="scroll-trigger"
        [class.visible]="hasMore && !loading && !loadingMore"
      >
        <div class="loading-more-spinner" *ngIf="loadingMore">
          <div class="small-spinner"></div>
          <span>Carregando mais boletins...</span>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .boletim-list-page {
        padding: 0 1rem;
      }

      .list-header {
        margin-bottom: 5rem;
        text-align: left;
      }

      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 2rem;
        flex-wrap: wrap;
      }

      .list-title {
        font-size: clamp(2rem, 5vw, 3rem);
        margin: 1rem 0;
      }

      .list-subtitle {
        max-width: 600px;
        font-size: 1.1rem;
      }

      .loading-state {
        text-align: center;
        padding: 8rem 0;
        color: var(--color-text-secondary);
      }

      .spinner {
        width: 60px;
        height: 60px;
        border: 4px solid var(--color-background-secondary);
        border-top-color: var(--color-primary);
        border-radius: 50%;
        animation: spin 1s cubic-bezier(0.5, 0, 0.5, 1) infinite;
        margin: 0 auto 2rem;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .error-state {
        text-align: center;
        padding: 4rem;
        max-width: 500px;
        margin: 2rem auto;
      }

      .error-icon {
        font-size: 3rem;
        margin-bottom: 1.5rem;
        display: block;
      }
      .error-content h3 {
        margin-bottom: 1rem;
      }
      .error-content p {
        margin-bottom: 2rem;
      }

      .boletins-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 1.5rem;
        margin-bottom: 4rem;
      }

      .boletim-card {
        display: flex;
        flex-direction: column;
        padding: 2.5rem;
        border-radius: var(--border-radius-lg);
        cursor: pointer;
        position: relative;
        overflow: hidden;
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
      }

      .card-badge {
        font-size: 0.7rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        padding: 0.4rem 1rem;
        background: rgba(var(--color-primary-rgb), 0.1);
        color: var(--color-primary);
        border-radius: var(--border-radius-full);
      }

      .card-badge.featured {
        background: rgba(var(--color-accent-rgb), 0.15);
        color: #b45309;
      }

      .card-date {
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--color-text-muted);
        text-transform: capitalize;
      }

      .card-content {
        flex: 1;
        margin-bottom: 2.5rem;
      }

      .card-title {
        font-size: 1.5rem;
        margin-bottom: 1rem;
        line-height: 1.3;
        color: var(--color-text);
        transition: color var(--transition-fast);
      }

      .boletim-card:hover .card-title {
        color: var(--color-primary);
      }

      @media (max-width: 480px) {
        .boletins-grid {
          grid-template-columns: 1fr;
        }
        .boletim-card {
          padding: 1.5rem;
        }
        .card-title {
          font-size: 1.25rem;
        }
      }

      .card-desc {
        font-size: 0.95rem;
        color: var(--color-text-secondary);
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
        line-height: 1.7;
      }

      .card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 2rem;
        border-top: 1px solid var(--color-border-light);
      }

      .status-indicator {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--color-text-muted);
      }

      .dot.active {
        background: var(--color-success);
        box-shadow: 0 0 8px var(--color-success);
      }

      .dot.draft {
        background: var(--color-warning);
        box-shadow: 0 0 8px var(--color-warning);
      }

      .status-text {
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--color-text-secondary);
      }

      .btn-read {
        background: none;
        border: none;
        font-size: 0.85rem;
        font-weight: 800;
        color: var(--color-primary);
        cursor: pointer;
        padding: 0;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        transition: transform var(--transition-fast);
      }

      .boletim-card:hover .btn-read {
        transform: translateX(5px);
      }

      .actions {
        display: flex;
        gap: 0.5rem;
      }

      .btn-action {
        background: none;
        border: 1px solid var(--color-border-light);
        border-radius: 0.5rem;
        padding: 0.5rem;
        cursor: pointer;
        font-size: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all var(--transition-fast);
        color: var(--color-text-secondary);
      }
      .btn-action:hover {
        background: var(--color-background-secondary);
        color: var(--color-text);
        border-color: var(--color-border);
      }
      .btn-action.delete:hover {
        background: rgba(var(--color-error-rgb), 0.1);
        color: var(--color-error);
        border-color: var(--color-error);
      }

      .empty-state {
        grid-column: 1 / -1;
        text-align: center;
        padding: 10rem 2rem;
      }

      .empty-visual {
        position: relative;
        width: 120px;
        height: 120px;
        margin: 0 auto 2rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .empty-icon {
        font-size: 4rem;
        z-index: 1;
      }

      .empty-ring {
        position: absolute;
        inset: 0;
        border: 2px dashed var(--color-border);
        border-radius: 50%;
        animation: spin 20s linear infinite;
      }

      .pagination-controls {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 1.5rem;
        margin-top: 3rem;
        margin-bottom: 5rem;
      }

      .btn-page {
        padding: 0.75rem 1.5rem;
        border-radius: var(--border-radius-md);
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        color: var(--color-text);
        font-weight: 600;
        cursor: pointer;
        transition: all var(--transition-fast);
      }

      .btn-page:hover:not(:disabled) {
        background: var(--color-primary);
        color: white;
        border-color: var(--color-primary);
      }

      .btn-page:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .page-info {
        font-weight: 600;
        color: var(--color-text-secondary);
      }

      .scroll-trigger {
        height: 100px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        opacity: 0;
        transition: opacity 0.3s;
        pointer-events: none;
      }

      .scroll-trigger.visible {
        opacity: 1;
      }

      .loading-more-spinner {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        color: var(--color-text-muted);
        font-weight: 600;
        font-size: 0.9rem;
      }

      .small-spinner {
        width: 30px;
        height: 30px;
        border: 3px solid var(--color-background-secondary);
        border-top-color: var(--color-primary);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      @media (max-width: 768px) {
        .boletins-grid {
          grid-template-columns: 1fr;
        }
        .boletim-card {
          padding: 2rem 1.5rem;
        }
        .header-content {
          flex-direction: column;
        }
      }
    `,
  ],
})
export class BoletimListComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly boletinsService = inject(BoletinsService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  @ViewChild('scrollTrigger') scrollTrigger!: ElementRef;

  boletins: Boletim[] = [];
  loading = false;
  loadingMore = false;
  hasMore = false;
  error = '';
  isAuthenticated = false;

  currentPage = 1;
  pageSize = 9;
  totalPages = 1;

  private authSub!: Subscription;
  private observer!: IntersectionObserver;

  ngOnInit(): void {
    this.authSub = this.authService.isAuthenticated$.subscribe((isAuth) => {
      this.isAuthenticated = isAuth;
      this.resetAndLoad();
    });
  }

  ngAfterViewInit(): void {
    this.setupIntersectionObserver();
  }

  ngOnDestroy(): void {
    if (this.authSub) this.authSub.unsubscribe();
    if (this.observer) this.observer.disconnect();
  }

  private setupIntersectionObserver(): void {
    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          !this.loading &&
          !this.loadingMore &&
          this.hasMore
        ) {
          this.loadMore();
        }
      },
      { rootMargin: '200px' }
    );

    if (this.scrollTrigger) {
      this.observer.observe(this.scrollTrigger.nativeElement);
    }
  }

  resetAndLoad(): void {
    this.currentPage = 1;
    this.boletins = [];
    this.hasMore = false;
    this.load();
  }

  load(): void {
    if (this.currentPage === 1) {
      this.loading = true;
    } else {
      this.loadingMore = true;
    }

    this.error = '';

    const obs$ = this.isAuthenticated
      ? this.boletinsService.getAdminAll(this.currentPage, this.pageSize)
      : this.boletinsService.getAll(this.currentPage, this.pageSize);

    obs$.subscribe({
      next: (res) => {
        if (this.currentPage === 1) {
          this.boletins = res.data;
        } else {
          this.boletins = [...this.boletins, ...res.data];
        }

        if (res.pagination) {
          this.totalPages = res.pagination.pages;
          this.hasMore = this.currentPage < this.totalPages;
        }

        this.loading = false;
        this.loadingMore = false;
      },
      error: (err) => {
        this.error =
          'Não foi possível estabelecer conexão com o servidor de boletins.';
        this.loading = false;
        this.loadingMore = false;
      },
    });
  }

  loadMore(): void {
    if (this.hasMore && !this.loadingMore) {
      this.currentPage++;
      this.load();
    }
  }

  openBoletim(id: number): void {
    this.router.navigate(['/boletins', id]);
  }

  createNew(): void {
    this.router.navigate(['/boletins/admin/novo']);
  }

  editBoletim(id: number, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/boletins/admin', id, 'editar']);
  }

  deleteBoletim(id: number, event: Event): void {
    event.stopPropagation();
    if (
      confirm(
        'Tem certeza que deseja excluir este boletim? Esta ação não pode ser desfeita.'
      )
    ) {
      this.boletinsService.delete(id).subscribe({
        next: () => {
          this.load();
        },
        error: () => {
          alert('Erro ao excluir o boletim.');
        },
      });
    }
  }
}
