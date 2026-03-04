import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
    selector: 'app-boletins',
    template: `
    <div class="boletins-shell">
      <aside class="boletins-sidebar" *ngIf="isAuthenticated">
        <div class="sidebar-brand">
          <img src="assets/icons/ifce-logo.svg" alt="IFCE" class="sidebar-logo">
          <span>Boletins DEPPI</span>
        </div>
        <nav class="sidebar-nav">
          <a routerLink="/boletins" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">
            📋 Lista de Boletins
          </a>
          <a routerLink="/boletins/admin/novo" routerLinkActive="active" *ngIf="isAdmin">
            ➕ Novo Boletim
          </a>
        </nav>
        <div class="sidebar-footer">
          <button (click)="logout()" class="logout-btn">🚪 Sair</button>
        </div>
      </aside>
      <main class="boletins-main">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
    styles: [`
    .boletins-shell { display: flex; min-height: 100vh; padding-top: 80px; }
    .boletins-sidebar {
      width: 240px; background: #0a0a1e; color: white;
      display: flex; flex-direction: column; padding: 1.5rem 0;
      position: fixed; top: 80px; left: 0; bottom: 0; z-index: 100;
    }
    .sidebar-brand { display: flex; align-items: center; gap: 0.75rem; padding: 0 1.5rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); font-weight: 700; font-size: 0.95rem; }
    .sidebar-logo { height: 32px; filter: brightness(10); }
    .sidebar-nav { flex: 1; padding: 1rem 0.75rem; display: flex; flex-direction: column; gap: 0.25rem; }
    .sidebar-nav a { display: block; padding: 0.75rem 1rem; border-radius: 0.5rem; color: rgba(255,255,255,0.7); text-decoration: none; font-size: 0.9rem; transition: all 0.2s; }
    .sidebar-nav a:hover, .sidebar-nav a.active { background: rgba(255,255,255,0.1); color: white; }
    .sidebar-footer { padding: 1rem 1.5rem; border-top: 1px solid rgba(255,255,255,0.1); }
    .logout-btn { width: 100%; padding: 0.6rem 1rem; background: rgba(239,68,68,0.2); border: 1px solid rgba(239,68,68,0.3); color: #fca5a5; border-radius: 0.5rem; cursor: pointer; font-size: 0.9rem; transition: all 0.2s; }
    .logout-btn:hover { background: rgba(239,68,68,0.35); color: white; }
    .boletins-main { flex: 1; margin-left: 240px; padding: 2rem; }
    @media (max-width: 768px) { .boletins-sidebar { display: none; } .boletins-main { margin-left: 0; } }
  `]
})
export class BoletinsComponent implements OnInit {
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);

    isAuthenticated = false;
    isAdmin = false;

    ngOnInit(): void {
        this.isAuthenticated = this.authService.isAuthenticated;
        this.isAdmin = this.authService.hasRole('admin');
    }

    logout(): void {
        this.authService.logout('/home');
    }
}
