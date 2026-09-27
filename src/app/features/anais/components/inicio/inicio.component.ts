import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { AnaisService } from '../../services/anais.service';
import { AuthService } from '../../../../core/services/auth.service';
import { RevistaArtigo, RevistaEdicao } from '../../../../shared/models';
import { ANAIS_BASE_STYLES } from '../../anais.styles';
import { ANAIS_INFO } from '../../anais.utils';

/**
 * Página inicial dos anais: Apresentação (texto aprovado pela Comissão), a
 * edição atual já com a lista dos trabalhos mais recentes, as edições
 * anteriores e, ao lado, os dados da publicação.
 */
@Component({
  standalone: false,
  selector: 'app-anais-inicio',
  template: `
    <div class="anais-grid">
      <section>
        <article class="anais-card">
          <h2>Apresentação</h2>
          <p>
            Os Anais da Mostra Científica do IFCE Campus Maracanaú constituem
            uma publicação eletrônica de periodicidade anual destinada ao
            registro, à preservação e à divulgação dos trabalhos apresentados na
            Mostra Científica do Instituto Federal de Educação, Ciência e
            Tecnologia do Ceará - Campus Maracanaú.
          </p>
          <p>
            A Mostra Científica integra a programação da Semana de Integração
            Científica (SIC) e constitui espaço de socialização de
            conhecimentos, experiências e resultados produzidos por estudantes,
            docentes, pesquisadores, servidores técnico-administrativos e
            participantes de instituições parceiras e da sociedade civil.
          </p>
          <p>
            Os Anais reúnem trabalhos vinculados aos diferentes campos
            contemplados pela Mostra Científica, organizados nos grupos
            temáticos definidos para o evento: Iniciação Científica e
            Tecnológica; Iniciação à Docência e Monitoria; Extensão;
            Empreendedorismo; Arte e Cultura; e Diversidade e Inclusão.
          </p>
          <p>
            A publicação dos Anais busca ampliar a visibilidade da produção
            apresentada no evento, preservar sua memória acadêmica e
            institucional e favorecer a circulação do conhecimento produzido no
            âmbito do IFCE e de instituições participantes.
          </p>
          <p>
            Integram cada volume os trabalhos aprovados no processo de avaliação
            e efetivamente apresentados na respectiva edição da Mostra
            Científica, observadas as normas estabelecidas no edital do evento e
            as normas editoriais desta publicação.
          </p>
        </article>

        <article class="anais-card vol" data-testid="edicao-atual">
          <p class="anais-kicker">Edição atual</p>
          <ng-container *ngIf="loading">
            <p class="anais-muted">Carregando...</p>
          </ng-container>
          <ng-container *ngIf="!loading && atual">
            <h2>Vol. {{ atual.volume }} ({{ atual.ano }})</h2>
            <p>{{ atual.title }}</p>

            <h3>Trabalhos publicados</h3>
            <app-anais-trabalhos-list
              *ngIf="recentes.length > 0"
              [artigos]="recentes"
              [canEdit]="isLoggedIn"
              (excluir)="excluirTrabalho($event)"
            ></app-anais-trabalhos-list>
            <p class="anais-muted" *ngIf="recentes.length === 0">
              A inserir após aprovação, apresentação e preparação editorial dos
              trabalhos.
            </p>

            <p class="acoes">
              <a class="anais-button" routerLink="/anais/edicao-atual">
                {{
                  totalAtual > recentes.length
                    ? 'Ver os ' + totalAtual + ' trabalhos'
                    : 'Acessar edição'
                }}
              </a>
              <a
                *ngIf="isLoggedIn"
                class="anais-button secondary"
                [routerLink]="[
                  '/anais/admin/edicoes',
                  atual.id,
                  'artigos',
                  'novo',
                ]"
                >+ Adicionar trabalho</a
              >
            </p>
          </ng-container>
          <ng-container *ngIf="!loading && !atual">
            <h2>Em preparação</h2>
            <p>
              O volume da edição atual será publicado após a conclusão da Mostra
              Científica.
            </p>
          </ng-container>
        </article>

        <article class="anais-card" *ngIf="anteriores.length > 0">
          <h2>Edições anteriores</h2>
          <ng-container *ngFor="let e of anteriores.slice(0, 3)">
            <h3>Vol. {{ e.volume }} ({{ e.ano }})</h3>
            <p>{{ e.title }}</p>
          </ng-container>
          <a class="anais-button secondary" routerLink="/anais/edicoes"
            >Consultar coleção</a
          >
        </article>
      </section>

      <aside>
        <div class="anais-card">
          <h2>Sobre a publicação</h2>
          <dl class="anais-dl">
            <dt>Periodicidade</dt>
            <dd>{{ info.periodicidade }}</dd>
            <dt>Formato</dt>
            <dd>{{ info.formato }}</dd>
            <dt>Acesso</dt>
            <dd>{{ info.acesso }}</dd>
            <dt>Idioma</dt>
            <dd>{{ info.idioma }}</dd>
            <dt>ISSN</dt>
            <dd>{{ info.issn }}</dd>
          </dl>
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
      .acoes {
        margin-top: 1rem;
      }

      .anais-card p a {
        color: var(--color-primary-dark);
        font-weight: 700;
        text-decoration: none;
      }

      .anais-card p a.anais-button {
        color: var(--color-on-primary);
      }

      .anais-card p a.anais-button.secondary {
        color: var(--color-primary-dark);
      }

      .anais-card p a:hover {
        text-decoration: underline;
      }
    `,
  ],
})
export class AnaisInicioComponent implements OnInit, OnDestroy {
  private readonly anaisService = inject(AnaisService);
  private readonly authService = inject(AuthService);
  private readonly sub = new Subscription();

  readonly info = ANAIS_INFO;
  readonly quantidadeRecentes = 5;

  atual: RevistaEdicao | null = null;
  anteriores: RevistaEdicao[] = [];
  recentes: RevistaArtigo[] = [];
  totalAtual = 0;
  isLoggedIn = false;
  loading = true;

  ngOnInit(): void {
    this.sub.add(
      this.authService.isAuthenticated$.subscribe((logged) => {
        this.isLoggedIn = logged;
      })
    );
    this.carregar();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
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
      next: () => this.carregar(),
    });
  }

  private carregar(): void {
    this.loading = true;
    // A página inicial mostra só o que está publicado, logado ou não.
    this.anaisService.getEdicoes().subscribe({
      next: (res) => {
        const publicadas = res.data ?? [];
        this.atual = publicadas[0] ?? null;
        this.anteriores = publicadas.slice(1);
        if (!this.atual) {
          this.loading = false;
          return;
        }
        this.anaisService.getEdicaoById(this.atual.id).subscribe({
          next: (edicao) => {
            const artigos = edicao.artigos ?? [];
            this.totalAtual = artigos.length;
            this.recentes = artigos.slice(0, this.quantidadeRecentes);
            this.loading = false;
          },
          error: () => (this.loading = false),
        });
      },
      error: () => (this.loading = false),
    });
  }
}
