import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  standalone: false,
  selector: 'app-revista-shell',
  template: `
    <div class="revista-page animate-in">
      <header class="revista-header">
        <div class="header-inner">
          <div class="badge">Recurso Contínuo Online &middot; ISSN em processo</div>
          <h1 class="revista-title">
            Revista <span class="highlight">DEPPI</span>
          </h1>
          <p class="revista-subtitle">
            Publicação online de divulgação técnico-científica do
            Departamento de Extensão, Pesquisa, Pós-Graduação e Inovação do
            IFCE Campus Maracanaú.
          </p>

          <nav class="revista-tabs">
            <a
              routerLink="/revista"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: true }"
              class="tab-item"
              >Apresentação</a
            >
            <a
              routerLink="/revista/expediente"
              routerLinkActive="active"
              class="tab-item"
              >Expediente</a
            >
            <a
              routerLink="/revista/edicoes"
              routerLinkActive="active"
              class="tab-item"
              >Edição Atual</a
            >
            <a
              routerLink="/revista/edicoes"
              [queryParams]="{ secao: 'anteriores' }"
              routerLinkActive="active"
              class="tab-item"
              >Edições Anteriores</a
            >
            <a
              *ngIf="isAdmin"
              routerLink="/revista/admin/edicoes/nova"
              routerLinkActive="active"
              class="tab-item tab-admin"
              >+ Nova Edição</a
            >
          </nav>
        </div>
      </header>

      <main class="revista-main">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [
    `
      .revista-header {
        background: var(--color-background-secondary);
        border-bottom: 1px solid var(--color-border-light);
        padding: 3rem 1.5rem 0;
      }

      .header-inner {
        max-width: 1000px;
        margin: 0 auto;
      }

      .revista-title {
        font-size: clamp(2rem, 5vw, 3rem);
        margin: 1rem 0;
      }

      .highlight {
        color: var(--color-primary);
      }

      .revista-subtitle {
        max-width: 650px;
        font-size: 1.05rem;
        color: var(--color-text-secondary);
        margin-bottom: 2.5rem;
      }

      .revista-tabs {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
        overflow-x: auto;
      }

      .tab-item {
        padding: 0.9rem 1.4rem;
        font-weight: 700;
        font-size: 0.9rem;
        color: var(--color-text-secondary);
        text-decoration: none;
        border-bottom: 3px solid transparent;
        white-space: nowrap;
        transition: all var(--transition-fast);
      }

      .tab-item:hover {
        color: var(--color-primary);
      }

      .tab-item.active {
        color: var(--color-primary);
        border-bottom-color: var(--color-primary);
      }

      .tab-admin {
        margin-left: auto;
        color: var(--color-secondary);
      }

      .revista-main {
        max-width: 1000px;
        margin: 0 auto;
        padding: 3rem 1.5rem 5rem;
      }

      @media (max-width: 640px) {
        .revista-header {
          padding: 2rem 1rem 0;
        }
        .revista-main {
          padding: 2rem 1rem 4rem;
        }
        .tab-admin {
          margin-left: 0;
        }
      }
    `,
  ],
})
export class RevistaShellComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  isAdmin = false;
  private sub = new Subscription();

  ngOnInit(): void {
    this.sub.add(
      this.authService.isAuthenticated$.subscribe(() => {
        this.isAdmin = this.authService.hasRole('admin');
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
