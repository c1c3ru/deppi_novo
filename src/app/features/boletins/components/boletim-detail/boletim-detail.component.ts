import { Component, OnInit, HostListener, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
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
          <button (click)="goBack()" class="btn btn-primary">
            Voltar ao Arquivo
          </button>
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
            <span class="detail-date">{{
              boletim.publicationDate | date: 'fullDate'
            }}</span>
          </div>

          <h1 class="detail-title">{{ boletim.title }}</h1>
          <p class="detail-desc">{{ boletim.description }}</p>

          <div
            class="detail-main-content ql-editor"
            *ngIf="safeContent"
            [innerHTML]="safeContent"
          ></div>

          <div class="header-actions">
            <a
              *ngIf="boletim.fileUrl"
              [href]="boletim.fileUrl"
              target="_blank"
              class="btn btn-primary"
            >
              Baixar Edição Completa (PDF)
            </a>
            <div class="view-count" *ngIf="boletim.viewCount">
              <span class="icon">👁</span>
              <span>{{ boletim.viewCount }} visualizações</span>
            </div>
          </div>

          <div class="detail-signature" *ngIf="boletim.authorName">
            <div class="signature-content">
              <span class="author-label">Postado por:</span>
              <span class="author-name">{{ boletim.authorName }}</span>
              <span class="post-date">{{
                boletim.publicationDate | date: 'dd/MM/yyyy HH:mm'
              }}</span>
            </div>
          </div>
        </header>

        <section class="news-section" *ngIf="boletim.news?.length">
          <div class="section-header">
            <h2 class="section-title">Conteúdo Destaque</h2>
            <div class="section-divider"></div>
          </div>

          <div class="news-grid">
            <div
              class="news-card surface"
              *ngFor="let n of boletim.news"
              [class.main]="n.isMain"
            >
              <div class="news-visual" *ngIf="n.imageUrl">
                <img
                  [src]="n.imageUrl"
                  [alt]="n.title"
                  class="news-img"
                  onerror="this.parentElement.style.display='none'"
                />
              </div>
              <div class="news-body">
                <span class="news-type-badge" *ngIf="n.isMain"
                  >Destaque Principal</span
                >
                <h3 class="news-title">{{ n.title }}</h3>
                <p class="news-content">{{ n.content }}</p>
              </div>
            </div>
          </div>
        </section>

        <footer class="detail-footer-actions">
          <button (click)="goBack()" class="btn-back">
            <span>&larr;</span> Voltar para a lista
          </button>
        </footer>
      </div>

      <!-- Botão Flutuante para subir -->
      <button
        class="float-btn glass"
        [class.visible]="showScrollBtn"
        (click)="scrollToTop()"
        title="Voltar ao topo"
      >
        <span class="icon">↑</span>
      </button>
    </div>
  `,
  styles: [
    `
      .boletim-detail-page {
        max-width: 900px;
        margin: 0 auto;
        padding-bottom: 5rem;
        position: relative;
      }

      .detail-nav {
        margin-bottom: 2rem;
      }

      .detail-footer-actions {
        margin-top: 5rem;
        padding-top: 2rem;
        border-top: 1px solid var(--color-border-light);
        display: flex;
        justify-content: center;
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
        padding: 3rem 4rem;
        margin-bottom: 2rem;
        border-radius: var(--border-radius-xl);
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
        padding-top: 2.5rem;
        margin-top: 2rem;
        border-top: 1px solid var(--color-border-light);
      }

      .detail-signature {
        margin-top: 2rem;
        display: flex;
        justify-content: flex-end;
        text-align: right;
        padding: 1rem 0;
      }

      .signature-content {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
        color: var(--color-text-secondary);
        font-size: 0.9rem;
      }

      .author-label {
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        opacity: 0.7;
      }

      .author-name {
        font-weight: 700;
        color: var(--color-primary);
      }

      .post-date {
        font-size: 0.8rem;
        opacity: 0.8;
      }

      .detail-main-content {
        margin-top: 2rem;
        font-size: 1.15rem;
        line-height: 1.8;
        color: var(--color-text);
        overflow-wrap: break-word;
        word-wrap: break-word;
      }
      .detail-main-content img {
        max-width: 100%;
        border-radius: var(--border-radius-md);
        margin: 1.5rem 0;
      }
      .detail-main-content iframe {
        width: 100%;
        min-height: 400px;
        border-radius: var(--border-radius-md);
        margin: 1.5rem 0;
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

      .float-btn {
        position: fixed;
        right: 30px;
        bottom: 30px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: var(--color-primary);
        color: white;
        border: none;
        box-shadow: var(--shadow-xl);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        z-index: 1000;
        opacity: 0;
        transform: translateY(20px);
        pointer-events: none;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }

      .float-btn.visible {
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
      }

      .float-btn:hover {
        background: var(--color-secondary);
        transform: scale(1.1);
      }

      @media (max-width: 768px) {
        .detail-header {
          padding: 2rem 1.5rem;
        }
        .detail-title {
          font-size: 2rem;
        }
        .detail-desc {
          font-size: 1.1rem;
        }
        .news-card {
          grid-template-columns: 1fr;
        }
        .news-visual {
          height: 200px;
        }
        .news-body {
          padding: 1.5rem;
        }
        .header-actions {
          flex-direction: column;
          align-items: flex-start;
          gap: 1.5rem;
        }
        .float-btn {
          right: 20px;
          bottom: 20px;
          width: 44px;
          height: 44px;
        }
      }
    `,
  ],
})
export class BoletimDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly boletinsService = inject(BoletinsService);
  private readonly sanitizer = inject(DomSanitizer);

  boletim: Boletim | null = null;
  safeContent: SafeHtml | null = null;
  loading = false;
  error = '';
  showScrollBtn = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.showScrollBtn = window.scrollY > 400;
  }

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
        // Sanitize HTML content from Quill to prevent XSS
        this.safeContent = b.content
          ? this.sanitizer.bypassSecurityTrustHtml(b.content)
          : null;
        this.loading = false;
      },
      error: () => {
        this.error =
          'O boletim solicitado não foi encontrado em nossa base de dados.';
        this.loading = false;
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/boletins']);
  }

  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }
}
