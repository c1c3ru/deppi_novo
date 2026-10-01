import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  DomSanitizer,
  SafeHtml,
  SafeResourceUrl,
} from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { AnaisService } from '../../services/anais.service';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { HtmlSanitizerService } from '../../../../core/services/html-sanitizer.service';
import { RevistaArtigo } from '../../../../shared/models';
import { ANAIS_BASE_STYLES } from '../../anais.styles';
import {
  ANAIS_INFO,
  ANAIS_TITULO,
  extrairLinkPdf,
  sugestaoDeCitacao,
} from '../../anais.utils';

/**
 * Página de um trabalho, no modelo da Editora Realize: caminho de navegação,
 * título e evento, autores, resumo, PDF (embutido quando está no próprio
 * site), texto completo, sugestão de citação e outros trabalhos do volume.
 */
@Component({
  standalone: false,
  selector: 'app-anais-artigo-detail',
  template: `
    <div class="loading-state" *ngIf="loading">
      <div class="spinner"></div>
      <p>Carregando trabalho...</p>
    </div>

    <div class="anais-card" *ngIf="!loading && error">
      <p>{{ error }}</p>
      <a routerLink="/anais/edicoes" class="anais-button secondary"
        >Voltar às edições</a
      >
    </div>

    <ng-container *ngIf="!loading && !error && artigo">
      <nav class="breadcrumb" aria-label="Caminho">
        <a routerLink="/anais">Anais</a>
        <span aria-hidden="true">›</span>
        <a
          *ngIf="artigo.edicao"
          [routerLink]="['/anais/edicoes', artigo.edicaoId]"
          >Vol. {{ artigo.edicao.volume }} ({{ artigo.edicao.ano }})</a
        >
        <span aria-hidden="true" *ngIf="artigo.edicao">›</span>
        <span class="atual">Trabalho</span>
      </nav>

      <div class="anais-grid">
        <section>
          <article class="anais-card vol">
            <p class="anais-kicker">
              {{ titulo }}
              <ng-container *ngIf="artigo.edicao">
                &middot; Vol. {{ artigo.edicao.volume }} ({{
                  artigo.edicao.ano
                }})
              </ng-container>
            </p>
            <h1 class="titulo">{{ artigo.title }}</h1>
            <p class="autores" *ngIf="artigo.authors">{{ artigo.authors }}</p>
            <p class="anais-muted">ISSN: {{ issn }}</p>

            <div class="botoes">
              <a
                *ngIf="pdfUrl"
                class="anais-button"
                [href]="pdfUrl"
                target="_blank"
                rel="noopener"
                download
                >Baixar PDF</a
              >
              <ng-container *ngIf="isLoggedIn">
                <a
                  class="anais-button secondary"
                  [routerLink]="['/anais/admin/artigos', artigo.id, 'editar']"
                  data-testid="editar-trabalho"
                  >Editar</a
                >
                <button
                  type="button"
                  class="anais-button danger"
                  data-testid="excluir-trabalho"
                  (click)="excluir()"
                >
                  Excluir
                </button>
              </ng-container>
            </div>
          </article>

          <section class="anais-card" *ngIf="artigo.summary">
            <h2>Resumo</h2>
            <p class="resumo">{{ artigo.summary }}</p>
          </section>

          <section class="anais-card" *ngIf="pdfEmbutido">
            <h2>Arquivo do trabalho</h2>
            <iframe
              class="pdf-frame"
              [src]="pdfEmbutido"
              title="PDF do trabalho"
              loading="lazy"
            ></iframe>
          </section>

          <section class="anais-card" *ngIf="temConteudo">
            <h2>Texto completo</h2>
            <div class="artigo-content" [innerHTML]="sanitizedContent"></div>
          </section>

          <section class="anais-card">
            <h2>Como citar</h2>
            <p class="citacao">{{ citacao }}</p>
            <button
              type="button"
              class="anais-button secondary"
              (click)="copiarCitacao()"
            >
              {{ citacaoCopiada ? 'Citação copiada' : 'Copiar citação' }}
            </button>
          </section>
        </section>

        <aside>
          <div class="anais-card" *ngIf="relacionados.length > 0">
            <h2>Outros trabalhos deste volume</h2>
            <ul class="relacionados">
              <li *ngFor="let r of relacionados">
                <a [routerLink]="['/anais/artigos', r.id]">{{ r.title }}</a>
                <span class="anais-muted" *ngIf="r.authors">{{
                  r.authors
                }}</span>
              </li>
            </ul>
            <a
              *ngIf="artigo.edicaoId"
              class="anais-button secondary"
              [routerLink]="['/anais/edicoes', artigo.edicaoId]"
              >Ver todos</a
            >
          </div>
        </aside>
      </div>
    </ng-container>
  `,
  styles: [
    ANAIS_BASE_STYLES,
    `
      .breadcrumb {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
        align-items: center;
        font-size: 0.85rem;
        color: var(--color-text-muted);
        margin-bottom: 1rem;
      }

      .breadcrumb a {
        color: var(--color-primary-dark);
        font-weight: 700;
        text-decoration: none;
      }

      .breadcrumb a:hover {
        text-decoration: underline;
      }

      .titulo {
        font-size: clamp(1.4rem, 3.5vw, 1.9rem);
        line-height: 1.3;
        color: var(--color-text);
        margin: 0 0 0.6rem;
      }

      .autores {
        text-transform: uppercase;
        letter-spacing: 0.02em;
        font-size: 0.9rem;
      }

      .botoes {
        margin-top: 0.6rem;
      }

      .resumo {
        white-space: pre-line;
        text-align: justify;
      }

      .pdf-frame {
        width: 100%;
        height: 70vh;
        min-height: 420px;
        border: 1px solid var(--color-border);
        border-radius: var(--border-radius-sm);
        background: var(--color-background-secondary);
      }

      .artigo-content {
        line-height: 1.8;
        color: var(--color-text);
        overflow-wrap: anywhere;
      }

      ::ng-deep .artigo-content img,
      ::ng-deep .artigo-content iframe,
      ::ng-deep .artigo-content video {
        max-width: 100%;
        height: auto;
        border-radius: var(--border-radius-md);
      }

      ::ng-deep .artigo-content iframe {
        aspect-ratio: 16 / 9;
        width: 100%;
      }

      ::ng-deep .artigo-content pre {
        white-space: pre-wrap;
        overflow-x: auto;
      }

      ::ng-deep .artigo-content table {
        display: block;
        max-width: 100%;
        overflow-x: auto;
      }

      .citacao {
        font-family: Georgia, 'Times New Roman', serif;
        background: var(--color-background-secondary);
        padding: 0.9rem 1rem;
        border-radius: var(--border-radius-sm);
      }

      .relacionados {
        list-style: none;
        margin: 0 0 1rem;
        padding: 0;
      }

      .relacionados li {
        padding: 0.6rem 0;
        border-bottom: 1px solid var(--color-border);
      }

      .relacionados li:last-child {
        border-bottom: none;
      }

      .relacionados a {
        display: block;
        color: var(--color-text);
        font-weight: 700;
        text-decoration: none;
        line-height: 1.35;
      }

      .relacionados a:hover {
        color: var(--color-primary);
      }

      .relacionados .anais-muted {
        font-size: 0.78rem;
        text-transform: uppercase;
      }
    `,
  ],
})
export class AnaisArtigoDetailComponent implements OnInit, OnDestroy {
  private readonly anaisService = inject(AnaisService);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly htmlSanitizer = inject(HtmlSanitizerService);
  private readonly domSanitizer = inject(DomSanitizer);
  private readonly sub = new Subscription();

  readonly titulo = ANAIS_TITULO;
  readonly issn = ANAIS_INFO.issn;
  readonly maxRelacionados = 6;

  artigo: RevistaArtigo | null = null;
  sanitizedContent: SafeHtml = '';
  temConteudo = false;
  pdfUrl: string | null = null;
  pdfEmbutido: SafeResourceUrl | null = null;
  citacao = '';
  citacaoCopiada = false;
  relacionados: RevistaArtigo[] = [];
  isLoggedIn = false;
  loading = false;
  error = '';

  ngOnInit(): void {
    this.sub.add(
      this.authService.isAuthenticated$.subscribe((logged) => {
        this.isLoggedIn = logged;
      })
    );
    this.sub.add(
      this.route.paramMap.subscribe((params) => {
        const id = Number(params.get('id'));
        if (id) this.load(id);
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  load(id: number): void {
    this.loading = true;
    this.error = '';
    this.citacaoCopiada = false;
    this.anaisService.getArtigoById(id).subscribe({
      next: (artigo) => {
        this.artigo = artigo;
        // HTML do Quill passa pelo DOMPurify antes de virar SafeHtml
        this.sanitizedContent =
          this.htmlSanitizer.sanitizeRichText(artigo.content) ?? '';
        this.temConteudo = this.textoVisivel(artigo.content).length > 0;
        this.pdfUrl = extrairLinkPdf(artigo.content);
        this.pdfEmbutido = this.urlEmbutivel(this.pdfUrl);
        this.citacao = sugestaoDeCitacao(artigo, artigo.edicao);
        this.loading = false;
        this.carregarRelacionados(artigo);
      },
      error: () => {
        this.error = 'Trabalho não encontrado.';
        this.loading = false;
      },
    });
  }

  copiarCitacao(): void {
    navigator.clipboard?.writeText(this.citacao).then(
      () => (this.citacaoCopiada = true),
      () => (this.citacaoCopiada = false)
    );
  }

  excluir(): void {
    const artigo = this.artigo;
    if (!artigo) return;
    if (
      !confirm(
        `Excluir o trabalho "${artigo.title}"? Essa ação não pode ser desfeita.`
      )
    ) {
      return;
    }
    this.anaisService.deleteArtigo(artigo.id).subscribe({
      next: () => {
        this.notificationService.showSuccess('Trabalho excluído.');
        this.router.navigate(
          artigo.edicaoId ? ['/anais/edicoes', artigo.edicaoId] : ['/anais']
        );
      },
      error: () =>
        this.notificationService.showError(
          'Não foi possível excluir o trabalho.'
        ),
    });
  }

  private carregarRelacionados(artigo: RevistaArtigo): void {
    this.relacionados = [];
    if (!artigo.edicaoId) return;
    this.anaisService.getEdicaoById(artigo.edicaoId).subscribe({
      next: (edicao) => {
        this.relacionados = (edicao.artigos ?? [])
          .filter((a) => a.id !== artigo.id)
          .slice(0, this.maxRelacionados);
      },
      error: () => (this.relacionados = []),
    });
  }

  /**
   * Só embute PDFs servidos pelo próprio site (/uploads/...): o CSP bloqueia
   * iframes de outros domínios, e aí basta o botão de download.
   */
  private urlEmbutivel(url: string | null): SafeResourceUrl | null {
    if (
      !url ||
      !/^\/uploads\/[\w./-]+\.pdf$/i.test(url) ||
      url.includes('..')
    ) {
      return null;
    }
    return this.domSanitizer.bypassSecurityTrustResourceUrl(url);
  }

  private textoVisivel(html: string | null | undefined): string {
    return (html ?? '')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim();
  }
}
