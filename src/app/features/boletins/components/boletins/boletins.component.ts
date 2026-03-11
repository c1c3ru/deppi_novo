import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-boletins',
  template: `
    <div class="boletins-shell" [class.authenticated]="isAuthenticated">
      <!-- Sidebar Administrativa -->
      <aside class="boletins-sidebar glass" *ngIf="isAuthenticated">
        <div class="sidebar-header">
          <div class="sidebar-logo-group">
            <span class="logo-box">B</span>
            <div class="logo-text">
              <span class="main-text">DEPPI</span>
              <span class="sub-text">Boletins</span>
            </div>
          </div>
        </div>

        <nav class="sidebar-nav">
          <a
            routerLink="/boletins"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
            class="nav-item"
          >
            <span class="nav-icon">📋</span>
            <span class="nav-label">Lista de Boletins</span>
          </a>
          <a
            routerLink="/boletins/admin/novo"
            routerLinkActive="active"
            *ngIf="isAdmin"
            class="nav-item"
          >
            <span class="nav-icon">➕</span>
            <span class="nav-label">Criar Novo</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <div class="user-profile">
            <div class="avatar">👤</div>
            <div class="user-info">
              <span class="user-name">Pesquisador</span>
              <span class="user-role">{{
                isAdmin ? 'Administrador' : 'Membro'
              }}</span>
            </div>
          </div>
          <button (click)="logout()" class="logout-btn" title="Sair do sistema">
            <span class="icon">🚪</span>
            <span>Sair</span>
          </button>
        </div>
      </aside>

      <!-- Área de Conteúdo Principal -->
      <main class="boletins-main" [class.full-width]="!isAuthenticated">
        <div class="main-content-wrapper">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [
    `
      .boletins-shell {
        display: flex;
        min-height: 100vh;
        background: var(--color-background-secondary);
        padding-top: var(--header-height);
      }

      /* Padding adjustment to not overlap with sidebar on desktop */
      .authenticated .boletins-main {
        padding-top: 1rem;
      }

      .boletins-sidebar {
        width: 280px;
        display: flex;
        flex-direction: column;
        position: fixed;
        top: 100px;
        left: 20px;
        bottom: 20px;
        z-index: 100;
        border-radius: var(--border-radius-xl);
        box-shadow: var(--shadow-xl);
        padding: 2rem 0;
        border: 1px solid var(--glass-border);
      }

      .sidebar-header {
        padding: 0 2rem 2.5rem;
        border-bottom: 1px solid var(--color-border-light);
      }

      .sidebar-logo-group {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .logo-box {
        width: 40px;
        height: 40px;
        background: var(--color-primary);
        color: white;
        border-radius: var(--border-radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 1.2rem;
      }

      .logo-text {
        display: flex;
        flex-direction: column;
      }

      .main-text {
        font-family: var(--font-display);
        font-weight: 800;
        font-size: 1.1rem;
        color: var(--color-text);
        letter-spacing: -0.01em;
      }

      .sub-text {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--color-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.1em;
      }

      .sidebar-nav {
        flex: 1;
        padding: 2rem 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .nav-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.9rem 1.2rem;
        border-radius: var(--border-radius-lg);
        color: var(--color-text-secondary);
        text-decoration: none;
        font-weight: 600;
        font-size: 0.9rem;
        transition: all var(--transition-fast);
      }

      .nav-item:hover {
        background: rgba(var(--color-primary-rgb), 0.05);
        color: var(--color-primary);
        transform: translateX(5px);
      }

      .nav-item.active {
        background: var(--color-primary);
        color: white;
        box-shadow: var(--shadow-primary);
      }

      .nav-icon {
        font-size: 1.1rem;
      }

      .sidebar-footer {
        padding: 1.5rem;
        margin: 0 1rem;
        background: var(--color-background-hover);
        border-radius: var(--border-radius-lg);
      }

      .user-profile {
        display: flex;
        align-items: center;
        gap: 0.8rem;
        margin-bottom: 1.5rem;
      }

      .avatar {
        width: 40px;
        height: 40px;
        background: var(--color-border);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
      }

      .user-info {
        display: flex;
        flex-direction: column;
      }

      .user-name {
        font-weight: 700;
        font-size: 0.9rem;
        color: var(--color-text);
      }

      .user-role {
        font-size: 0.75rem;
        color: var(--color-text-muted);
      }

      .logout-btn {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.8rem;
        padding: 0.8rem;
        background: rgba(var(--color-secondary-rgb), 0.1);
        border: 1px solid rgba(var(--color-secondary-rgb), 0.1);
        color: var(--color-secondary);
        border-radius: var(--border-radius-md);
        cursor: pointer;
        font-weight: 700;
        font-size: 0.85rem;
        transition: all var(--transition-fast);
      }

      .logout-btn:hover {
        background: var(--color-secondary);
        color: white;
      }

      .boletins-main {
        flex: 1;
        margin-left: 320px;
        padding: 2rem;
        transition: all var(--transition-normal);
      }

      .boletins-main.full-width {
        margin-left: 0;
      }

      .main-content-wrapper {
        max-width: 1100px;
        margin: 0 auto;
      }

      @media (max-width: 1200px) {
        .boletins-sidebar {
          width: 240px;
          left: 10px;
        }
        .boletins-main {
          margin-left: 260px;
        }
      }

      @media (max-width: 1024px) {
        .boletins-sidebar {
          display: none;
        }
        .boletins-main {
          margin-left: 0;
          padding: 1.5rem;
        }
      }
    `,
  ],
})
export class BoletinsComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  isAuthenticated = false;
  isAdmin = false;
  private sub: any;

  ngOnInit(): void {
    this.sub = this.authService.isAuthenticated$.subscribe((isAuth) => {
      this.isAuthenticated = isAuth;
      this.isAdmin = this.authService.hasRole('admin');
    });
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  logout(): void {
    this.authService.logout('/home');
  }
}
