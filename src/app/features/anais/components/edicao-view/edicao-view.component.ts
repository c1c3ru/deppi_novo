import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, combineLatest } from 'rxjs';
import { AnaisService } from '../../services/anais.service';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { RevistaArtigo, RevistaEdicao } from '../../../../shared/models';
import { ANAIS_BASE_STYLES } from '../../anais.styles';
import { filtrarTrabalhos } from '../../anais.utils';

/**
 * Página de um volume dos anais. Em /anais/edicao-atual mostra o volume
 * publicado mais recente; em /anais/edicoes/:id, o volume pedido (URL
 * permanente). Visitantes veem só o catálogo; usuários logados veem a mesma
 * tela com os controles de edição.
 */
@Component({
  standalone: false,
  selector: 'app-anais-edicao-view',
  template: `
    <div class="loading-state" *ngIf="loading">
      <div class="spinner"></div>
      <p>Carregando edição...</p>
    </div>

    <div class="anais-card" *ngIf="!loading && error">
      <p>{{ error }}</p>
      <a routerLink="/anais/edicoes" class="anais-button secondary"
        >Ver edições anteriores</a
      >
    </div>

    <div class="anais-card vol" *ngIf="!loading && !error && !edicao">
      <p class="anais-kicker">Edição atual</p>
      <h2>Nenhum volume publicado ainda</h2>
      <p>
        Os trabalhos serão publicados aqui após a conclusão da edição da Mostra
        Científica.
      </p>
      <a
        *ngIf="isLoggedIn"
        routerLink="/anais/admin/edicoes/nova"
        class="anais-button"
        >Criar primeira edição</a
      >
    </div>

    <div class="anais-grid" *ngIf="!loading && !error && edicao">
      <section>
        <article class="anais-card vol" data-testid="cabecalho-edicao">
          <p class="anais-kicker">
            {{ ehAtual ? 'Edição atual' : 'Volume ' + edicao.volume }}
          </p>
          <h2>
            Vol. {{ edicao.volume }} ({{ edicao.ano }})
            <span class="draft-badge" *ngIf="edicao.status === 'draft'"
              >Rascunho</span
            >
          </h2>
          <p>
            <strong>{{ edicao.title }}</strong>
          </p>
          <p *ngIf="edicao.description" class="descricao">
            {{ edicao.description }}
          </p>

          <div class="admin-bar" *ngIf="isLoggedIn" data-testid="admin-edicao">
            <a
              class="anais-button"
              [routerLink]="[
                '/anais/admin/edicoes',
                edicao.id,
                'artigos',
                'novo',
              ]"
              data-testid="adicionar-trabalho"
              >+ Adicionar trabalho</a
            >
            <a
              class="anais-button secondary"
              [routerLink]="['/anais/admin/edicoes', edicao.id, 'editar']"
              >Editar edição</a
            >
            <button
              type="button"
              class="anais-button danger"
              (click)="excluirEdicao(edicao)"
            >
              Excluir edição
            </button>
          </div>
        </article>

        <section class="anais-card">
          <div class="lista-topo">
            <h2>Trabalhos publicados</h2>
            <span class="contagem" data-testid="contagem">
              {{ filtrados.length }}
              {{ filtrados.length === 1 ? 'trabalho' : 'trabalhos' }}
              {{ busca ? 'encontrados' : 'disponíveis' }}
            </span>
          </div>

          <label class="busca" *ngIf="artigos.length > 0">
            <span class="sr-only">Buscar trabalhos</span>
            <input
              type="search"
              [value]="busca"
              (input)="buscar($any($event.target).value)"
              placeholder="Buscar por título, autor ou palavra do resumo"
            />
          </label>

          <p class="anais-muted" *ngIf="artigos.length === 0">
            A inserir após aprovação, apresentação e preparação editorial dos
            trabalhos.
          </p>
          <p
            class="anais-muted"
            *ngIf="artigos.length > 0 && filtrados.length === 0"
          >
            Nenhum trabalho encontrado para "{{ busca }}".
          </p>

          <app-anais-trabalhos-list
            *ngIf="paginaAtual.length > 0"
            [artigos]="paginaAtual"
            [canEdit]="isLoggedIn"
            [startIndex]="(pagina - 1) * porPagina"
            (excluir)="excluirTrabalho($event)"
          ></app-anais-trabalhos-list>

          <nav
            class="paginacao"
            *ngIf="totalPaginas > 1"
            aria-label="Paginação dos trabalhos"
          >
            <button
              type="button"
              [disabled]="pagina === 1"
              (click)="irPara(pagina - 1)"
              aria-label="Página anterior"
            >
              &lsaquo;
            </button>
            <button
              type="button"
              *ngFor="let p of paginas"
              [class.ativa]="p === pagina"
              [attr.aria-current]="p === pagina ? 'page' : null"
              (click)="irPara(p)"
            >
              {{ p }}
            </button>
            <button
              type="button"
              [disabled]="pagina === totalPaginas"
              (click)="irPara(pagina + 1)"
              aria-label="Próxima página"
            >
              &rsaquo;
            </button>
          </nav>
        </section>
      </section>

      <aside>
        <div class="anais-card">
          <h2>Volumes</h2>
          <ul class="volumes">
            <li *ngFor="let e of edicoes">
              <a
                [routerLink]="['/anais/edicoes', e.id]"
                [class.atual]="e.id === edicao.id"
                >Vol. {{ e.volume }} ({{ e.ano }})</a
              >
              <span class="draft-badge" *ngIf="e.status === 'draft'"
                >Rascunho</span
              >
            </li>
          </ul>
        </div>
        <div class="anais-card">
          <h2>Acesso rápido</h2>
          <p><a routerLink="/anais/normas">Normas de publicação</a></p>
          <p><a routerLink="/anais/corpo-editorial">Corpo editorial</a></p>
          <p><a routerLink="/anais/expediente">Expediente</a></p>
        </div>
      </aside>
    </div>
  `,
  styles: [
    ANAIS_BASE_STYLES,
    `
      .descricao {
        white-space: pre-line;
      }

      .admin-bar {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px dashed var(--color-border);
      }

      .lista-topo {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: baseline;
        gap: 0.5rem;
      }

      .contagem {
        font-size: 0.85rem;
        color: var(--color-text-muted);
      }

      .busca {
        display: block;
        margin: 0.4rem 0 1.2rem;
      }

      .busca input {
        width: 100%;
        font: inherit;
        padding: 0.65rem 0.9rem;
        border-radius: var(--border-radius-sm);
        border: 1px solid var(--color-border);
        background: var(--color-background);
        color: var(--color-text);
      }

      .busca input:focus {
        outline: 2px solid rgba(var(--color-primary-rgb), 0.35);
        border-color: var(--color-primary);
      }

      .paginacao {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 0.35rem;
        margin-top: 1.4rem;
      }

      .paginacao button {
        min-width: 2.2rem;
        padding: 0.35rem 0.6rem;
        font: inherit;
        font-weight: 700;
        border-radius: var(--border-radius-sm);
        border: 1px solid var(--color-border);
        background: var(--color-surface);
        color: var(--color-text);
        cursor: pointer;
      }

      .paginacao button.ativa {
        background: var(--color-primary);
        border-color: var(--color-primary);
        color: var(--color-on-primary);
      }

      .paginacao button:disabled {
        opacity: 0.4;
        cursor: default;
      }

      .volumes {
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .volumes li {
        padding: 0.35rem 0;
      }

      .volumes a,
      .anais-card p a {
        color: var(--color-primary-dark);
        font-weight: 700;
        text-decoration: none;
      }

      .volumes a:hover,
      .anais-card p a:hover {
        text-decoration: underline;
      }

      .volumes a.atual {
        color: var(--color-text);
      }

      .volumes a.atual::before {
        content: '▸ ';
        color: var(--color-primary);
      }

      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip: rect(0 0 0 0);
        white-space: nowrap;
      }
    `,
  ],
})
export class AnaisEdicaoViewComponent implements OnInit, OnDestroy {
  private readonly anaisService = inject(AnaisService);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sub = new Subscription();

  readonly porPagina = 10;

  edicoes: RevistaEdicao[] = [];
  edicao: RevistaEdicao | null = null;
  artigos: RevistaArtigo[] = [];
  filtrados: RevistaArtigo[] = [];
  busca = '';
  pagina = 1;
  ehAtual = false;
  isLoggedIn = false;
  loading = false;
  error = '';

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.filtrados.length / this.porPagina));
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  get paginaAtual(): RevistaArtigo[] {
    const inicio = (this.pagina - 1) * this.porPagina;
    return this.filtrados.slice(inicio, inicio + this.porPagina);
  }

  ngOnInit(): void {
    this.sub.add(
      combineLatest([
        this.route.paramMap,
        this.authService.isAuthenticated$,
      ]).subscribe(([params, logged]) => {
        this.isLoggedIn = logged;
        const id = Number(params.get('id')) || null;
        this.carregar(id);
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  buscar(termo: string): void {
    this.busca = termo;
    this.filtrados = filtrarTrabalhos(this.artigos, termo);
    this.pagina = 1;
  }

  irPara(pagina: number): void {
    this.pagina = Math.min(Math.max(1, pagina), this.totalPaginas);
  }

  excluirTrabalho(artigo: RevistaArtigo): void {
    if (
      !confirm(
        `Excluir o trabalho "${artigo.title}"? Essa ação não pode ser desfeita.`
      )
    ) {
      return;
    }
    this.anaisService.deleteArtigo(artigo.id).subscribe({
      next: () => {
        this.artigos = this.artigos.filter((a) => a.id !== artigo.id);
        this.buscar(this.busca);
        this.notificationService.showSuccess('Trabalho excluído.');
      },
      error: () =>
        this.notificationService.showError(
          'Não foi possível excluir o trabalho.'
        ),
    });
  }

  excluirEdicao(edicao: RevistaEdicao): void {
    const aviso =
      `Excluir o Vol. ${edicao.volume} (${edicao.ano})? ` +
      `Todos os ${this.artigos.length} trabalhos dele também serão apagados.`;
    if (!confirm(aviso)) return;
    this.anaisService.deleteEdicao(edicao.id).subscribe({
      next: () => {
        this.notificationService.showSuccess('Edição excluída.');
        this.router.navigate(['/anais/edicoes']);
      },
      error: () =>
        this.notificationService.showError(
          'Não foi possível excluir a edição.'
        ),
    });
  }

  private carregar(id: number | null): void {
    this.loading = true;
    this.error = '';
    const lista$ = this.isLoggedIn
      ? this.anaisService.getAdminEdicoes()
      : this.anaisService.getEdicoes();

    lista$.subscribe({
      next: (res) => {
        this.edicoes = res.data ?? [];
        const atual =
          this.edicoes.find((e) => e.status === 'published') ?? null;
        const alvo = id ?? atual?.id ?? null;
        this.ehAtual = !!atual && alvo === atual.id;
        if (alvo === null) {
          this.edicao = null;
          this.artigos = [];
          this.buscar('');
          this.loading = false;
          return;
        }
        this.carregarEdicao(alvo);
      },
      error: () => {
        this.error = 'Não foi possível carregar as edições.';
        this.loading = false;
      },
    });
  }

  private carregarEdicao(id: number): void {
    this.anaisService.getEdicaoById(id).subscribe({
      next: (edicao) => {
        this.edicao = edicao;
        this.artigos = edicao.artigos ?? [];
        this.buscar('');
        this.loading = false;
      },
      error: () => {
        this.edicao = null;
        this.error = 'Edição não encontrada.';
        this.loading = false;
      },
    });
  }
}
