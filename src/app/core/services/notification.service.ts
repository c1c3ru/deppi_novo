import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { NotificationMessage } from '../../shared/models';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly notifications$ = new BehaviorSubject<NotificationMessage[]>(
    []
  );

  /** Observable com lista de notificações ativas */
  readonly messages$ = this.notifications$.asObservable();

  private generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }

  /**
   * Exibe uma notificação de sucesso
   */
  showSuccess(message: string, duration = 4000): void {
    this.add({ type: 'success', message, duration });
  }

  /**
   * Exibe uma notificação de erro
   */
  showError(message: string, duration = 6000): void {
    this.add({ type: 'error', message, duration });
  }

  /**
   * Exibe uma notificação de aviso
   */
  showWarning(message: string, duration = 5000): void {
    this.add({ type: 'warning', message, duration });
  }

  /**
   * Exibe uma notificação informativa
   */
  showInfo(message: string, duration = 4000): void {
    this.add({ type: 'info', message, duration });
  }

  /**
   * Remove uma notificação pelo ID
   */
  dismiss(id: string): void {
    const current = this.notifications$.value;
    this.notifications$.next(current.filter((n) => n.id !== id));
  }

  private add(config: Omit<NotificationMessage, 'id'>): void {
    const notification: NotificationMessage = {
      id: this.generateId(),
      ...config,
    };

    const current = this.notifications$.value;
    this.notifications$.next([...current, notification]);

    // Auto-dismiss após duração
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => this.dismiss(notification.id), notification.duration);
    }
  }
}
