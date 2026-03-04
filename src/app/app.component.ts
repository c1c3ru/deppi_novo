import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <!-- Header -->
      <app-header></app-header>

      <!-- Main Content -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .main-content {
      flex: 1;
      margin-top: 80px; /* header height */
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'DEPPI - IFCE Maracanaú';

  constructor(
    private store: Store,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    // Inicializar tema do sistema
    this.themeService.initTheme();

    // Log de inicialização
    console.log('🚀 DEPPI Application Started');
  }
}
