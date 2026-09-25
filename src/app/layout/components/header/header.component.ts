import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  ElementRef,
  inject,
} from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../../core/services/theme.service';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: false,
  selector: 'app-header',
  template: `
    <header
      class="header"
      [ngClass]="headerClass"
      [class.scrolled]="isScrolled"
      [class.menu-open]="isMenuOpen"
    >
      <nav class="nav-container glass">
        <div class="nav-brand">
          <a routerLink="/home" class="brand-link" (click)="closeMenu()">
            <div class="logo-wrapper">
              <span class="logo-circle">IF</span>
              <span class="brand-text">DEPPI</span>
            </div>
          </a>
        </div>

        <div class="nav-menu" [class.mobile-open]="isMenuOpen">
          <a
            routerLink="/home"
            class="nav-link"
            [class.active]="isActive('/home')"
            (mouseenter)="setHoverPos($event)"
            (mouseleave)="clearHoverPos()"
            (click)="closeMenu()"
          >
            <span>Início</span>
          </a>
          <a
            routerLink="/research"
            class="nav-link"
            [class.active]="isActive('/research')"
            (mouseenter)="setHoverPos($event)"
            (mouseleave)="clearHoverPos()"
            (click)="closeMenu()"
          >
            <span>Pesquisa</span>
          </a>
          <a
            routerLink="/extension"
            class="nav-link"
            [class.active]="isActive('/extension')"
            (mouseenter)="setHoverPos($event)"
            (mouseleave)="clearHoverPos()"
            (click)="closeMenu()"
          >
            <span>Extensão</span>
          </a>
          <a
            routerLink="/innovation"
            class="nav-link"
            [class.active]="isActive('/innovation')"
            (mouseenter)="setHoverPos($event)"
            (mouseleave)="clearHoverPos()"
            (click)="closeMenu()"
          >
            <span>Inovação</span>
          </a>
          <a
            routerLink="/post-graduation"
            class="nav-link"
            [class.active]="isActive('/post-graduation')"
            (mouseenter)="setHoverPos($event)"
            (mouseleave)="clearHoverPos()"
            (click)="closeMenu()"
          >
            <span>Pós</span>
          </a>
          <a
            routerLink="/laboratorios"
            class="nav-link"
            [class.active]="isActive('/laboratorios')"
            (mouseenter)="setHoverPos($event)"
            (mouseleave)="clearHoverPos()"
            (click)="closeMenu()"
          >
            <span>Vitrine</span>
          </a>

          <!-- Dropdown Mais -->
          <div
            class="dropdown-container"
            (mouseenter)="onDropdownEnter($event)"
            (mouseleave)="onDropdownLeave()"
          >
            <button
              type="button"
              class="nav-link dropdown-toggle"
              [class.active]="isDropdownActive()"
              [attr.aria-expanded]="isDropdownOpen"
              aria-haspopup="true"
              aria-controls="nav-dropdown-mais"
              (click)="toggleDropdown()"
            >
              <span>Mais</span>
              <span
                class="dropdown-arrow"
                [class.open]="isDropdownOpen"
                aria-hidden="true"
                >▼</span
              >
            </button>
            <div
              id="nav-dropdown-mais"
              class="dropdown-menu glass"
              [class.show]="isDropdownOpen"
            >
              <a
                routerLink="/boletins"
                class="dropdown-item"
                [class.active]="isActive('/boletins')"
                (click)="closeMenu()"
                >Boletins</a
              >
              <a
                routerLink="/revista"
                class="dropdown-item"
                [class.active]="isActive('/revista')"
                (click)="closeMenu()"
                >Anais da Mostra Científica</a
              >
              <a
                routerLink="/pit-rit"
                class="dropdown-item"
                [class.active]="isActive('/pit-rit')"
                (click)="closeMenu()"
                >PIT/RIT</a
              >
              <a
                routerLink="/talentos"
                class="dropdown-item"
                [class.active]="isActive('/talentos')"
                (click)="closeMenu()"
                >Hub de Talentos</a
              >
              <a
                routerLink="/visitas"
                class="dropdown-item"
                [class.active]="isActive('/visitas')"
                (click)="closeMenu()"
                >Agendar Visita</a
              >
              <a
                routerLink="/contact"
                class="dropdown-item"
                [class.active]="isActive('/contact')"
                (click)="closeMenu()"
                >Contato</a
              >
            </div>
          </div>
          <div
            class="nav-indicator"
            [style.transform]="indicatorTransform"
            [style.opacity]="indicatorOpacity"
          ></div>
        </div>

        <div class="nav-actions">
          <button
            class="theme-toggle"
            (click)="toggleTheme()"
            [attr.aria-label]="
              isDarkTheme
                ? 'Alternar para tema claro'
                : 'Alternar para tema escuro'
            "
            [attr.aria-pressed]="isDarkTheme"
          >
            <span class="theme-icon" aria-hidden="true">{{
              isDarkTheme ? '🔆' : '🌙'
            }}</span>
          </button>

          <ng-container *ngIf="!isAuthenticated; else userMenu">
            <a
              routerLink="/boletins/login"
              class="btn btn-primary login-btn"
              (click)="closeMenu()"
            >
              Acesso
            </a>
          </ng-container>

          <ng-template #userMenu>
            <div class="user-chip" routerLink="/boletins" (click)="closeMenu()">
              <span class="user-avatar">👤</span>
              <span class="user-name-abbr">{{ userFirstLetter }}</span>
            </div>
          </ng-template>

          <button
            class="mobile-menu-toggle"
            (click)="toggleMenu()"
            [attr.aria-expanded]="isMenuOpen"
            aria-label="Menu principal"
          >
            <div class="hamburger">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
        </div>
      </nav>
    </header>
  `,
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly themeService = inject(ThemeService);
  private readonly authService = inject(AuthService);
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  currentRoute = '';
  isDarkTheme = false;
  headerClass = '';
  isScrolled = false;
  isMenuOpen = false;
  isDropdownOpen = false;
  indicatorTransform = 'scaleX(0)';
  indicatorOpacity = '0';

  isAuthenticated = false;
  userFirstLetter = '';
  private sub = new Subscription();

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 20;
  }

  /** Fecha o dropdown "Mais" ao clicar fora dele. */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isDropdownOpen) return;
    const dropdown = this.elementRef.nativeElement.querySelector(
      '.dropdown-container'
    );
    if (dropdown && !dropdown.contains(event.target as Node)) {
      this.isDropdownOpen = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isMenuOpen || this.isDropdownOpen) {
      this.closeMenu();
    }
  }

  /** Ao voltar para o layout desktop, desfaz o estado do menu mobile. */
  @HostListener('window:resize')
  onResize(): void {
    if (this.isMenuOpen && this.isDesktop()) {
      this.closeMenu();
    }
  }

  ngOnInit(): void {
    this.sub.add(
      this.router.events
        .pipe(
          filter(
            (event): event is NavigationEnd => event instanceof NavigationEnd
          )
        )
        .subscribe((event: NavigationEnd) => {
          this.currentRoute = event.urlAfterRedirects;
        })
    );

    this.sub.add(
      this.themeService.currentTheme$.subscribe((theme) => {
        this.isDarkTheme = theme === 'dark';
      })
    );

    this.sub.add(
      this.authService.isAuthenticated$.subscribe((isAuth) => {
        this.isAuthenticated = isAuth;
        const user = this.authService.currentUser;
        this.userFirstLetter = user?.name
          ? user.name.charAt(0).toUpperCase()
          : 'U';
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  isActive(route: string): boolean {
    return (
      this.currentRoute === route ||
      (route !== '/' && this.currentRoute.startsWith(route))
    );
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    // No mobile o "Mais" já vem aberto quando a página atual está nele
    this.isDropdownOpen = this.isMenuOpen && this.isDropdownActive();
    if (this.isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  closeMenu(): void {
    this.isMenuOpen = false;
    this.isDropdownOpen = false;
    document.body.style.overflow = '';
  }

  toggleDropdown(): void {
    // No desktop o hover já abre; o clique (ou Enter no teclado) só garante
    // que fique aberto, sem fechar o que o mouse acabou de abrir
    this.isDropdownOpen = this.isDesktop() ? true : !this.isDropdownOpen;
  }

  // Hover só controla o dropdown no desktop; no toque, o clique decide
  onDropdownEnter(event: MouseEvent): void {
    if (!this.isDesktop()) return;
    this.isDropdownOpen = true;
    this.setHoverPos(event);
  }

  onDropdownLeave(): void {
    if (!this.isDesktop()) return;
    this.isDropdownOpen = false;
    this.clearHoverPos();
  }

  private isDesktop(): boolean {
    return window.matchMedia('(min-width: 1025px)').matches;
  }

  isDropdownActive(): boolean {
    return (
      this.isActive('/boletins') ||
      this.isActive('/revista') ||
      this.isActive('/pit-rit') ||
      this.isActive('/talentos') ||
      this.isActive('/visitas') ||
      this.isActive('/contact')
    );
  }

  setHoverPos(event: MouseEvent): void {
    const target = event.currentTarget as HTMLElement;
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
