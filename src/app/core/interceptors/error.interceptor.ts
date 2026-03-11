import { Injectable, inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Ocorreu um erro inesperado.';

        if (error.status === 0) {
          errorMessage = 'Sem conexão com o servidor. Verifique sua internet.';
        } else if (error.status === 401) {
          // Token inválido/expirado — faz logout (apenas se nao for endpoint de autenticacao como login)
          const isAuthEndpoint = request.url.includes('/auth/');
          if (!isAuthEndpoint) {
            this.authService.logout('/boletins/login');
          }
          errorMessage = 'Credenciais inválidas ou Sessão expirada.';
        } else if (error.status === 403) {
          errorMessage = 'Você não tem permissão para esta ação.';
          this.router.navigate(['/home']);
        } else if (error.status === 404) {
          errorMessage = 'Recurso não encontrado.';
        } else if (error.status === 429) {
          errorMessage = 'Muitas requisições. Tente novamente em instantes.';
        } else if (error.status >= 500) {
          errorMessage =
            'Erro interno do servidor. Tente novamente mais tarde.';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }

        // Não exibir toast para erros de auth (já tratados no AuthService)
        const isAuthEndpoint = request.url.includes('/auth/');
        if (!isAuthEndpoint) {
          this.notificationService.showError(errorMessage);
        }

        return throwError(() => error);
      })
    );
  }
}
