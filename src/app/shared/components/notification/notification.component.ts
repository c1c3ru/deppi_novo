import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { NotificationMessage } from '../../../shared/models';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-container">
      <div
        *ngFor="let msg of messages$ | async"
        class="notification-card"
        [ngClass]="msg.type"
        [@slideIn]="'in'"
      >
        <div class="notification-icon">
          <span *ngIf="msg.type === 'success'">✅</span>
          <span *ngIf="msg.type === 'error'">❌</span>
          <span *ngIf="msg.type === 'warning'">⚠️</span>
          <span *ngIf="msg.type === 'info'">ℹ️</span>
        </div>
        <div class="notification-content">
          <p class="notification-message">{{ msg.message }}</p>
        </div>
        <button class="notification-close" (click)="dismiss(msg.id)">
          &times;
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .notification-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 12px;
        pointer-events: none;
      }

      .notification-card {
        pointer-events: auto;
        min-width: 320px;
        max-width: 450px;
        padding: 16px 20px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 16px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        position: relative;
        overflow: hidden;
      }

      .notification-card.success {
        background: rgba(var(--color-success-rgb), 0.15);
        border-left: 4px solid var(--color-success);
      }
      .notification-card.error {
        background: rgba(var(--color-error-rgb), 0.15);
        border-left: 4px solid var(--color-error);
      }
      .notification-card.warning {
        background: rgba(var(--color-warning-rgb), 0.15);
        border-left: 4px solid var(--color-warning);
      }
      .notification-card.info {
        background: rgba(var(--color-info-rgb), 0.15);
        border-left: 4px solid var(--color-info);
      }

      .notification-icon {
        font-size: 1.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .notification-content {
        flex: 1;
      }

      .notification-message {
        margin: 0;
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--color-text);
        line-height: 1.4;
      }

      .notification-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        color: var(--color-text-secondary);

        padding: 4px;
        line-height: 1;
        opacity: 0.6;
        transition: opacity 0.2s;
      }

      .notification-close:hover {
        opacity: 1;
        color: var(--color-text);
      }

      .notification-card::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        height: 3px;
        width: 100%;
        background: currentColor;
        opacity: 0.3;
        transform-origin: left;
        animation: progress-shrink 4000ms linear forwards;
      }

      @keyframes progress-shrink {
        from {
          transform: scaleX(1);
        }
        to {
          transform: scaleX(0);
        }
      }
    `,
  ],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate(
          '0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          style({ transform: 'translateX(0)', opacity: 1 })
        ),
      ]),
      transition(':leave', [
        animate(
          '0.2s ease-in',
          style({ transform: 'translateX(100%)', opacity: 0 })
        ),
      ]),
    ]),
  ],
})
export class NotificationComponent {
  private readonly notificationService = inject(NotificationService);
  readonly messages$ = this.notificationService.messages$;

  dismiss(id: string): void {
    this.notificationService.dismiss(id);
  }
}
