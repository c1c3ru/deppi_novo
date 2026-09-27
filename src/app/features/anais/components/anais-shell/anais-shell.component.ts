import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { ANAIS_INFO } from '../../anais.utils';

@Component({
  standalone: false,
  selector: 'app-anais-shell',
  template: `
    <div class="anais-page animate-in">
      <header class="anais-header">
        <div class="header-inner">
          <p class="kicker">IFCE Campus Maracanaú &middot; DEPPI</p>
          <h1 class="anais-title">
            Anais da <span class="highlight">Mostra Científica</span> do IFCE
            Campus Maracanaú
          </h1>
          <p class="anais-meta">
            <span class="meta-badge">Acesso aberto</span>
            <span class="meta-badge">Periodicidade anual</span>
            <span class="meta-issn">ISSN: {{ issn }}</span>
          </p>
        </div>
      </header>

      <nav class="anais-nav" aria-label="Seções dos anais">
        <div class="nav-inner">
          <a
            *ngFor="let item of menu"
            [routerLink]="item.link"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: item.exact }"
            class="tab-item"
            >{{ item.label }}</a
          >
          <a
            *ngIf="isLoggedIn"
            routerLink="/anais/admin/edicoes/nova"
            class="tab-item tab-admin"
            data-testid="nova-edicao"
            >+ Nova edição</a
          >
        </div>
      </nav>

      <main class="anais-main">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [
    `
      .anais-page {
        background: var(--color-background);
        min-height: 60vh;
      }

      .anais-header {
        background: var(--color-background-secondary);
        border-bottom: 1px solid var(--color-border);
        padding: 2.5rem 1.5rem 0.2rem;
      }

      .header-inner {
        max-width: 1160px;
        margin: 0 auto;
      }

      .kicker {
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--color-primary);
        margin: 0 0 0.6rem;
      }

      .anais-title {
        font-size: clamp(1.8rem, 4.5vw, 2.6rem);
        margin: 0 0 0.6rem;
        color: var(--color-text);
      }

      .highlight {
        color: var(--color-primary);
      }

      .anais-meta {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.5rem;
        margin: 0 0 1.8rem;
        color: var(--color-text-secondary);
        font-size: 0.9rem;
      }

      .meta-badge {
        display: inline-block;
        padding: 0.2rem 0.7rem;
        border-radius: var(--border-radius-full);
        background: var(--color-primary-light);
        color: var(--color-primary-dark);
        font-weight: 700;
        font-size: 0.8rem;
      }

      .anais-nav {
        background: var(--color-surface);
        border-bottom: 1px solid var(--color-border);
      }

      .nav-inner {
        max-width: 1160px;
        margin: 0 auto;
        padding: 0 1.5rem;
        display: flex;
        gap: 0.25rem;
        overflow-x: auto;
      }

      .tab-item {
        padding: 0.8rem 1.2rem;
        font-weight: 700;
        font-size: 0.9rem;
        color: var(--color-text-secondary);
        text-decoration: none;
        border-bottom: 3px solid transparent;
        white-space: nowrap;
        transition:
          color var(--transition-fast),
          border-color var(--transition-fast);
      }

      .tab-item:hover,
      .tab-item.active {
        color: var(--color-primary);
      }

      .tab-item.active {
        border-bottom-color: var(--color-primary);
      }

      .tab-admin {
        margin-left: auto;
        color: var(--color-primary-dark);
      }

      .anais-main {
        max-width: 1160px;
        margin: 0 auto;
        padding: 2.5rem 1.5rem 5rem;
      }

      @media (max-width: 640px) {
        .anais-header {
          padding: 2rem 1rem 0.2rem;
        }
        .nav-inner {
          padding: 0 0.5rem;
        }
        .anais-main {
          padding: 1.5rem 1rem 4rem;
        }
        .tab-admin {
          margin-left: 0;
        }
      }
    `,
  ],
})
export class AnaisShellComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly sub = new Subscription();

  readonly issn = ANAIS_INFO.issn;
  readonly menu = [
    { label: 'Início', link: '/anais', exact: true },
    { label: 'Edição atual', link: '/anais/edicao-atual', exact: false },
    { label: 'Edições anteriores', link: '/anais/edicoes', exact: false },
    { label: 'Normas de publicação', link: '/anais/normas', exact: false },
    { label: 'Corpo editorial', link: '/anais/corpo-editorial', exact: false },
    { label: 'Expediente', link: '/anais/expediente', exact: false },
  ];

  isLoggedIn = false;

  ngOnInit(): void {
    this.sub.add(
      this.authService.isAuthenticated$.subscribe((logged) => {
        this.isLoggedIn = logged;
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
