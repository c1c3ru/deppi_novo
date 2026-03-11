import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, timer } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import {
  User,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from '../../shared/models';
import { StorageService } from './storage.service';
import { NotificationService } from './notification.service';
import { AnalyticsService } from './analytics.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly storageService = inject(StorageService);
  private readonly notificationService = inject(NotificationService);
  private readonly analyticsService = inject(AnalyticsService);

  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  private readonly isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private readonly tokenRefreshTimer$ = new BehaviorSubject<number | null>(
    null
  );

  // Observables públicos
  public readonly currentUser$ = this.currentUserSubject.asObservable();
  public readonly isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  // URL da API
  private readonly apiUrl = `${environment.apiUrl}/api`;
  private readonly tokenKey = 'auth_token';
  private readonly userKey = 'current_user';
  private readonly refreshKey = 'refresh_token';

  constructor() {
    this.initializeAuthFromStorage();
    this.setupTokenRefresh();
  }

  /**
   * Obtém o usuário atual
   */
  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Verifica se o usuário está autenticado
   */
  get isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Obtém o token de autenticação
   */
  get token(): string | null {
    return this.storageService.getItem(this.tokenKey);
  }

  /**
   * Realiza login do usuário
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap((response) => {
          this.handleAuthSuccess(response);
          this.analyticsService.trackEvent(
            'login',
            'auth',
            'user_login_success'
          );
        }),
        catchError((error) => {
          this.analyticsService.trackEvent('login', 'auth', 'user_login_error');
          return this.handleAuthError(error, 'Erro ao fazer login');
        })
      );
  }

  /**
   * Realiza logout do usuário
   */
  logout(redirectUrl: string = '/home'): void {
    const refreshToken = this.storageService.getItem(this.refreshKey);

    if (refreshToken) {
      this.http.post(`${this.apiUrl}/auth/logout`, { refreshToken }).subscribe({
        next: () => this.clearAuthData(),
        error: () => this.clearAuthData(),
      });
    } else {
      this.clearAuthData();
    }

    this.analyticsService.trackEvent('logout', 'auth', 'user_logout');
    this.router.navigate([redirectUrl]);
  }

  /**
   * Registra um novo usuário
   */
  register(userData: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/auth/register`, userData).pipe(
      tap((user) => {
        this.notificationService.showSuccess('Conta criada com sucesso!');
        this.analyticsService.trackEvent(
          'register',
          'auth',
          'user_registration_success'
        );
      }),
      catchError((error) => {
        this.analyticsService.trackEvent(
          'register',
          'auth',
          'user_registration_error'
        );
        return this.handleAuthError(error, 'Erro ao criar conta');
      })
    );
  }

  /**
   * Atualiza o token de acesso
   */
  refreshToken(): Observable<LoginResponse> {
    const refreshToken = this.storageService.getItem(this.refreshKey);

    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http
      .post<LoginResponse>(`${this.apiUrl}/auth/refresh`, { refreshToken })
      .pipe(
        tap((response) => {
          this.updateTokens(response);
        }),
        catchError((error) => {
          this.clearAuthData();
          return throwError(() => error);
        })
      );
  }

  /**
   * Solicita credenciais de acesso via SIAPE
   */
  requestAccess(registration: string): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/auth/request-access`, { registration })
      .pipe(
        tap((res) => {
          this.notificationService.showSuccess(res.message);
          this.analyticsService.trackEvent(
            'request_access',
            'auth',
            'request_access_success'
          );
        }),
        catchError((error) => {
          return this.handleAuthError(error, 'Erro ao solicitar acesso');
        })
      );
  }

  /**
   * Solicita redefinição de senha
   */
  requestPasswordReset(email: string): Observable<void> {
    return this.http
      .post<void>(`${this.apiUrl}/auth/forgot-password`, { email })
      .pipe(
        tap(() => {
          this.notificationService.showSuccess('Email de redefinição enviado!');
          this.analyticsService.trackEvent(
            'password_reset',
            'auth',
            'password_reset_request'
          );
        }),
        catchError((error) => {
          return this.handleAuthError(
            error,
            'Erro ao solicitar redefinição de senha'
          );
        })
      );
  }

  /**
   * Redefine a senha
   */
  resetPassword(token: string, newPassword: string): Observable<void> {
    return this.http
      .post<void>(`${this.apiUrl}/auth/reset-password`, {
        token,
        newPassword,
      })
      .pipe(
        tap(() => {
          this.notificationService.showSuccess('Senha redefinida com sucesso!');
          this.analyticsService.trackEvent(
            'password_reset',
            'auth',
            'password_reset_success'
          );
        }),
        catchError((error) => {
          return this.handleAuthError(error, 'Erro ao redefinir senha');
        })
      );
  }

  /**
   * Verifica se o usuário tem uma role específica
   */
  hasRole(role: string): boolean {
    const user = this.currentUser;
    return user?.roles?.includes(role) ?? false;
  }

  /**
   * Verifica se o usuário tem alguma das roles especificadas
   */
  hasAnyRole(roles: string[]): boolean {
    const user = this.currentUser;
    if (!user?.roles) return false;
    return roles.some((role) => user.roles.includes(role));
  }

  /**
   * Atualiza dados do usuário
   */
  updateProfile(userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/auth/profile`, userData).pipe(
      tap((updatedUser) => {
        this.currentUserSubject.next(updatedUser);
        this.storageService.setItem(this.userKey, JSON.stringify(updatedUser));
        this.notificationService.showSuccess('Perfil atualizado com sucesso!');
      }),
      catchError((error) => {
        return this.handleAuthError(error, 'Erro ao atualizar perfil');
      })
    );
  }

  /**
   * Altera senha do usuário
   */
  changePassword(
    currentPassword: string,
    newPassword: string
  ): Observable<void> {
    return this.http
      .post<void>(`${this.apiUrl}/auth/change-password`, {
        currentPassword,
        newPassword,
      })
      .pipe(
        tap(() => {
          this.notificationService.showSuccess('Senha alterada com sucesso!');
        }),
        catchError((error) => {
          return this.handleAuthError(error, 'Erro ao alterar senha');
        })
      );
  }

  /**
   * Inicializa autenticação a partir do storage
   */
  private initializeAuthFromStorage(): void {
    const token = this.storageService.getItem(this.tokenKey);
    const userStr = this.storageService.getItem(this.userKey);

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      } catch (error) {
        this.clearAuthData();
      }
    }
  }

  /**
   * Configura refresh automático do token
   */
  private setupTokenRefresh(): void {
    this.isAuthenticated$.subscribe((isAuth) => {
      if (isAuth) {
        this.scheduleTokenRefresh();
      } else {
        this.cancelTokenRefresh();
      }
    });
  }

  /**
   * Agenda refresh do token
   */
  private scheduleTokenRefresh(): void {
    this.cancelTokenRefresh();

    // Agenda refresh 5 minutos antes da expiração
    const refreshTime = 4 * 60 * 1000; // 4 minutos

    const timerId = window.setTimeout(() => {
      this.refreshToken().subscribe({
        error: () => {
          this.clearAuthData();
          this.router.navigate(['/login']);
        },
      });
    }, refreshTime);

    this.tokenRefreshTimer$.next(timerId);
  }

  /**
   * Cancela refresh do token
   */
  private cancelTokenRefresh(): void {
    const timerId = this.tokenRefreshTimer$.value;
    if (timerId) {
      clearTimeout(timerId);
      this.tokenRefreshTimer$.next(null);
    }
  }

  /**
   * Manipula sucesso na autenticação
   */
  private handleAuthSuccess(response: LoginResponse): void {
    this.updateTokens(response);
    this.currentUserSubject.next(response.user);
    this.isAuthenticatedSubject.next(true);
    this.notificationService.showSuccess('Login realizado com sucesso!');
  }

  /**
   * Atualiza tokens no storage
   */
  private updateTokens(response: LoginResponse): void {
    this.storageService.setItem(this.tokenKey, response.accessToken);
    this.storageService.setItem(this.refreshKey, response.refreshToken);
    this.storageService.setItem(this.userKey, JSON.stringify(response.user));
  }

  /**
   * Limpa dados de autenticação
   */
  private clearAuthData(): void {
    this.storageService.removeItem(this.tokenKey);
    this.storageService.removeItem(this.refreshKey);
    this.storageService.removeItem(this.userKey);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.cancelTokenRefresh();
  }

  /**
   * Manipula erros de autenticação
   */
  private handleAuthError(
    error: HttpErrorResponse,
    defaultMessage: string
  ): Observable<never> {
    let message = defaultMessage;

    if (error.error?.message) {
      message = error.error.message;
    } else if (error.status === 401) {
      message = 'Credenciais inválidas';
    } else if (error.status === 403) {
      message = 'Acesso negado';
    } else if (error.status === 429) {
      message = 'Muitas tentativas. Tente novamente mais tarde.';
    }

    this.notificationService.showError(message);
    return throwError(() => error);
  }
}
