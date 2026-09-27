import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { AnaisService } from '../../services/anais.service';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { RevistaEdicao } from '../../../../shared/models';
import { ANAIS_BASE_STYLES } from '../../anais.styles';

/**
 * Coleção de volumes. O volume publicado mais recente é a "edição atual" e
 * fica no topo; os demais aparecem como edições anteriores. Logado, a pessoa
 * vê também os rascunhos e os controles de edição.
 */
@Component({
  standalone: false,
  selector: 'app-anais-edicoes-list',
  template: `
    <div class="loading-state" *ngIf="loading">
      <div class="spinner"></div>
      <p>Carregando edições...</p>
    </div>

    <div class="anais-card" *ngIf="!loading && error">
      <p>{{ error }}</p>
    </div>

    <section class="anais-card" *ngIf="!loading && !error">
      <div class="topo">
        <h2>Edições anteriores</h2>
        <a
          *ngIf="isLoggedIn"
          routerLink="/anais/admin/edicoes/nova"
          class="anais-button"
          data-testid="nova-edicao-lista"
          >+ Nova edição</a
        >
      </div>

      <p class="anais-muted" *ngIf="edicoes.length === 0">
        Ainda não há volumes publicados.
      </p>

      <article
        class="anais-card vol"
        *ngFor="let e of edicoes"
        data-testid="volume"
      >
        <p class="anais-kicker">
          {{ e.id === atualId ? 'Edição atual' : 'Volume ' + e.volume }}
        </p>
        <h3>
          Vol. {{ e.volume }} ({{ e.ano }})
          <span class="draft-badge" *ngIf="e.status === 'draft'">Rascunho</span>
        </h3>
        <p>{{ e.title }}</p>
        <p *ngIf="e.description" class="descricao">{{ e.description }}</p>
        <p class="acoes">
          <a
            class="anais-button secondary"
            [routerLink]="['/anais/edicoes', e.id]"
            >Acessar volume</a
          >
          <ng-container *ngIf="isLoggedIn">
            <a
              class="anais-button secondary"
              [routerLink]="['/anais/admin/edicoes', e.id, 'editar']"
              >Editar</a
            >
            <button
              type="button"
              class="anais-button danger"
              (click)="excluir(e)"
            >
              Excluir
            </button>
          </ng-container>
        </p>
      </article>
    </section>
  `,
  styles: [
    ANAIS_BASE_STYLES,
    `
      .topo {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 0.9rem;
      }

      .topo h2 {
        margin: 0;
      }

      .anais-card .anais-card {
        box-shadow: none;
        margin-bottom: 1rem;
      }

      .anais-card .anais-card:last-child {
        margin-bottom: 0;
      }

      .vol h3 {
        margin-top: 0;
      }

      .descricao {
        white-space: pre-line;
      }

      .acoes {
        margin-top: 0.4rem;
      }
    `,
  ],
})
export class AnaisEdicoesListComponent implements OnInit, OnDestroy {
  private readonly anaisService = inject(AnaisService);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly sub = new Subscription();

  edicoes: RevistaEdicao[] = [];
  atualId: number | null = null;
  isLoggedIn = false;
  loading = false;
  error = '';

  ngOnInit(): void {
    this.sub.add(
      this.authService.isAuthenticated$.subscribe((logged) => {
        this.isLoggedIn = logged;
        this.load();
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    const lista$ = this.isLoggedIn
      ? this.anaisService.getAdminEdicoes()
      : this.anaisService.getEdicoes();
    lista$.subscribe({
      next: (res) => {
        this.edicoes = res.data ?? [];
        this.atualId =
          this.edicoes.find((e) => e.status === 'published')?.id ?? null;
        this.loading = false;
      },
      error: () => {
        this.error = 'Não foi possível carregar as edições dos anais.';
        this.loading = false;
      },
    });
  }

  excluir(edicao: RevistaEdicao): void {
    const aviso =
      `Excluir o Vol. ${edicao.volume} (${edicao.ano})? ` +
      'Todos os trabalhos dele também serão apagados.';
    if (!confirm(aviso)) return;
    this.anaisService.deleteEdicao(edicao.id).subscribe({
      next: () => {
        this.notificationService.showSuccess('Edição excluída.');
        this.load();
      },
      error: () =>
        this.notificationService.showError(
          'Não foi possível excluir a edição.'
        ),
    });
  }
}
