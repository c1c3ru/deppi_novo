import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../../core/services/loading.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-overlay" *ngIf="isLoading$ | async">
      <div class="loading-spinner">
        <div class="spinner-ring"></div>
        <div class="spinner-core"></div>
        <div class="loading-text">DEPPI</div>
      </div>
    </div>
  `,
  styles: [
    `
      .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        z-index: 10000;
        pointer-events: auto;
      }

      .loading-spinner {
        position: relative;
        width: 120px;
        height: 120px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .spinner-ring {
        position: absolute;
        width: 100%;
        height: 100%;
        border: 4px solid transparent;
        border-top: 4px solid #0066b3;
        border-radius: 50%;
        animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
      }

      .spinner-core {
        position: absolute;
        width: 70%;
        height: 70%;
        border: 4px solid transparent;
        border-bottom: 4px solid #ffcc00;
        border-radius: 50%;
        animation: spin-reverse 1.5s linear infinite;
      }

      .loading-text {
        font-size: 1.1rem;
        font-weight: 800;
        color: white;
        text-transform: uppercase;
        letter-spacing: 2px;
        animation: pulse 1.5s ease-in-out infinite;
        text-shadow: 0 0 10px rgba(0, 102, 179, 0.5);
      }

      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      @keyframes spin-reverse {
        0% {
          transform: rotate(360deg);
        }
        100% {
          transform: rotate(0deg);
        }
      }

      @keyframes pulse {
        0%,
        100% {
          opacity: 0.6;
          transform: scale(0.95);
        }
        50% {
          opacity: 1;
          transform: scale(1.05);
        }
      }
    `,
  ],
})
export class LoadingComponent {
  private readonly loadingService = inject(LoadingService);
  readonly isLoading$: Observable<boolean> = this.loadingService.loading$;
}
