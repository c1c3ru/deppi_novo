import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  template: `
    <header class="header" [ngClass]="headerClass">
      <nav class="nav-container">
        <div class="nav-brand">
          <a routerLink="/home" class="brand-link">
            <img src="assets/images/logo-deppi.png" alt="DEPPI Logo" class="brand-logo" *ngIf="showLogo">
            <span class="brand-text">DEPPI</span>
          </a>
        </div>

        <div class="nav-menu">
          <a routerLink="/home" class="nav-link" [class.active]="isActive('/home')">
            Início
          </a>
          <a routerLink="/research" class="nav-link" [class.active]="isActive('/research')">
            Pesquisa
          </a>
          <a routerLink="/extension" class="nav-link" [class.active]="isActive('/extension')">
            Extensão
          </a>
          <a routerLink="/innovation" class="nav-link" [class.active]="isActive('/innovation')">
            Inovação
          </a>
          <a routerLink="/post-graduation" class="nav-link" [class.active]="isActive('/post-graduation')">
            Pós-Graduação
          </a>
          <a routerLink="/boletins" class="nav-link" [class.active]="isActive('/boletins')">
            Boletins
          </a>
          <a routerLink="/contact" class="nav-link" [class.active]="isActive('/contact')">
            Contato
          </a>
        </div>

        <div class="nav-actions">
          <button class="theme-toggle" (click)="toggleTheme()" aria-label="Alternar tema">
            <span class="theme-icon">{{ isDarkTheme ? '☀️' : '🌙' }}</span>
          </button>
        </div>
      </nav>
    </header>
  `,
  styles: [`
    .header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      background: var(--color-background);
      border-bottom: 1px solid var(--color-border);
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
    }

    .nav-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 80px;
    }

    .nav-brand {
      display: flex;
      align-items: center;
    }

    .brand-link {
      display: flex;
      align-items: center;
      text-decoration: none;
      color: var(--color-text);
      font-weight: 700;
      font-size: 1.5rem;
    }

    .brand-logo {
      height: 40px;
      margin-right: 0.5rem;
    }

    .nav-menu {
      display: flex;
      gap: 2rem;
    }

    .nav-link {
      color: var(--color-text-secondary);
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      transition: all 0.2s ease;
      font-weight: 500;
    }

    .nav-link:hover {
      color: var(--color-primary);
      background: var(--color-background-hover);
    }

    .nav-link.active {
      color: var(--color-primary);
      background: var(--color-primary-light);
    }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .theme-toggle {
      background: none;
      border: none;
      padding: 0.5rem;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .theme-toggle:hover {
      background: var(--color-background-hover);
    }

    .theme-icon {
      font-size: 1.2rem;
    }

    @media (max-width: 768px) {
      .nav-menu {
        display: none;
      }

      .nav-container {
        padding: 0 0.5rem;
      }

      .brand-text {
        display: none;
      }
    }
  `]
})
export class HeaderComponent implements OnInit {
  currentRoute = '';
  isDarkTheme = false;
  showLogo = true;
  headerClass = '';

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Monitorar mudanças de rota
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.urlAfterRedirects;
        this.updateHeaderStyle();
      });

    // Verificar tema inicial
    this.isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
  }

  isActive(route: string): boolean {
    return this.currentRoute.startsWith(route);
  }

  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    document.documentElement.setAttribute('data-theme', this.isDarkTheme ? 'dark' : 'light');
    localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');
  }

  private updateHeaderStyle(): void {
    // Lógica para alterar estilo do header baseado na rota
    // Por exemplo: header transparente na home, sólido em outras páginas
  }
}
