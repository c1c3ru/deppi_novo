import { Component, OnInit, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  template: `
    <header class="header" [ngClass]="headerClass" [class.scrolled]="isScrolled">
      <nav class="nav-container glass">
        <div class="nav-brand">
          <a routerLink="/home" class="brand-link">
            <div class="logo-wrapper">
              <span class="logo-circle">IF</span>
              <span class="brand-text">DEPPI</span>
            </div>
          </a>
        </div>

        <div class="nav-menu">
          <a routerLink="/home" class="nav-link" [class.active]="isActive('/home')" (mouseenter)="setHoverPos($event)" (mouseleave)="clearHoverPos()">
            <span>Início</span>
          </a>
          <a routerLink="/research" class="nav-link" [class.active]="isActive('/research')" (mouseenter)="setHoverPos($event)" (mouseleave)="clearHoverPos()">
            <span>Pesquisa</span>
          </a>
          <a routerLink="/extension" class="nav-link" [class.active]="isActive('/extension')" (mouseenter)="setHoverPos($event)" (mouseleave)="clearHoverPos()">
            <span>Extensão</span>
          </a>
          <a routerLink="/innovation" class="nav-link" [class.active]="isActive('/innovation')" (mouseenter)="setHoverPos($event)" (mouseleave)="clearHoverPos()">
            <span>Inovação</span>
          </a>
          <a routerLink="/post-graduation" class="nav-link" [class.active]="isActive('/post-graduation')" (mouseenter)="setHoverPos($event)" (mouseleave)="clearHoverPos()">
            <span>Pós</span>
          </a>
          <a routerLink="/boletins" class="nav-link" [class.active]="isActive('/boletins')" (mouseenter)="setHoverPos($event)" (mouseleave)="clearHoverPos()">
            <span>Boletins</span>
          </a>
          <a routerLink="/contact" class="nav-link" [class.active]="isActive('/contact')" (mouseenter)="setHoverPos($event)" (mouseleave)="clearHoverPos()">
            <span>Contato</span>
          </a>
          <div class="nav-indicator" [style.transform]="indicatorTransform" [style.opacity]="indicatorOpacity"></div>
        </div>

        <div class="nav-actions">
          <button class="theme-toggle" (click)="toggleTheme()" aria-label="Alternar tema">
            <span class="theme-icon">{{ isDarkTheme ? '🔆' : '🌙' }}</span>
          </button>
          <a routerLink="/boletins/login" class="btn btn-primary login-btn">
             Acesso
          </a>
        </div>
      </nav>
    </header>
  `,
  styles: [`
    .header {
      position: fixed;
      top: 1.5rem;
      left: 0;
      right: 0;
      z-index: 1000;
      transition: all var(--transition-normal);
      padding: 0 1.5rem;
    }

    .header.scrolled {
      top: 0.5rem;
    }

    .nav-container {
      max-width: var(--container-max-width);
      margin: 0 auto;
      padding: 0.6rem 1.2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 64px;
      border-radius: var(--border-radius-full);
      box-shadow: var(--shadow-lg);
    }

    .nav-brand {
      display: flex;
      align-items: center;
    }

    .logo-wrapper {
      display: flex;
      align-items: center;
      gap: 0.8rem;
    }

    .logo-circle {
      width: 36px;
      height: 36px;
      background: var(--color-primary);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 0.9rem;
      box-shadow: 0 4px 12px rgba(var(--color-primary-rgb), 0.3);
    }

    .brand-text {
      font-family: var(--font-display);
      font-weight: 800;
      font-size: 1.4rem;
      letter-spacing: -0.03em;
      color: var(--color-text);
      background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .nav-menu {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      position: relative;
    }

    .nav-link {
      color: var(--color-text-secondary);
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: var(--border-radius-full);
      transition: color var(--transition-fast);
      font-weight: 600;
      font-size: var(--font-size-sm);
      position: relative;
      z-index: 1;
    }

    .nav-link:hover {
      color: var(--color-primary);
    }

    .nav-link.active {
      color: var(--color-primary);
    }

    .nav-indicator {
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      background: rgba(var(--color-primary-rgb), 0.1);
      border-radius: var(--border-radius-full);
      transition: all var(--transition-normal);
      pointer-events: none;
      z-index: 0;
    }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .theme-toggle {
      background: rgba(var(--color-primary-rgb), 0.05);
      border: 1px solid var(--color-border);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-fast);
    }

    .theme-toggle:hover {
      transform: rotate(15deg) scale(1.1);
      background: rgba(var(--color-primary-rgb), 0.1);
    }

    .login-btn {
      padding: 0.6rem 1.4rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-size: 0.75rem;
    }

    @media (max-width: 1024px) {
      .nav-menu {
        display: none;
      }
    }
  `]
})
export class HeaderComponent implements OnInit {
  currentRoute = '';
  isDarkTheme = false;
  headerClass = '';
  isScrolled = false;
  indicatorTransform = 'scaleX(0)';
  indicatorOpacity = '0';

  constructor(private router: Router) { }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 20;
  }

  ngOnInit(): void {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.urlAfterRedirects;
      });

    this.isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
  }

  isActive(route: string): boolean {
    return this.currentRoute === route || (route !== '/' && this.currentRoute.startsWith(route));
  }

  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    document.documentElement.setAttribute('data-theme', this.isDarkTheme ? 'dark' : 'light');
    localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');
  }

  setHoverPos(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    const parentRect = target.parentElement?.getBoundingClientRect() || { left: 0 };

    this.indicatorTransform = `translateX(${target.offsetLeft}px) scaleX(1)`;
    const indicator = document.querySelector('.nav-indicator') as HTMLElement;
    if (indicator) {
      indicator.style.width = `${target.offsetWidth}px`;
    }
    this.indicatorOpacity = '1';
  }

  clearHoverPos(): void {
    this.indicatorOpacity = '0';
  }
}
