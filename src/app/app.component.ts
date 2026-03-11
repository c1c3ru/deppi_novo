import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { ThemeService } from './core/services/theme.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <!-- Loading Indicators -->
      <app-loading></app-loading>

      <!-- Feedback Notifications -->
      <app-notification></app-notification>

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
  styles: [
    `
      .app-container {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }

      .main-content {
        flex: 1;
        margin-top: 80px; /* header height */
      }
    `,
  ],
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

    // Suprimir logs em produção para evitar vazamento de informação
    if (environment.production) {
      console.log = () => {};
      console.debug = () => {};
      console.info = () => {};
    }
  }
}
