import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  template: `
    <div class="login-page">
      <div class="login-visual reveal-up">
        <div class="visual-content">
          <div class="badge">Acesso Restrito</div>
          <h1 class="visual-title">
            Portal do Pesquisador <span class="highlight">DEPPI</span>
          </h1>
          <p class="visual-desc">
            Acesse editais, publique boletins e gerencie sua produção acadêmica
            no IFCE Maracanaú.
          </p>
        </div>
        <div class="visual-bg"></div>
      </div>

      <div class="login-container reveal-up" style="animation-delay: 0.1s">
        <div class="login-card surface">
          <div class="login-header">
            <div class="login-icon">🔐</div>
            <h2 class="login-title">Bem-vindo</h2>
            <p class="login-subtitle">Entre com sua conta Institucional</p>
          </div>

          <form
            [formGroup]="loginForm"
            (ngSubmit)="onSubmit()"
            class="login-form"
          >
            <div class="form-group">
              <label for="registration">Matrícula</label>
              <div class="input-wrapper">
                <span class="input-icon">👤</span>
                <input
                  id="registration"
                  type="text"
                  formControlName="registration"
                  placeholder="Ex: 202412345"
                  autocomplete="username"
                />
              </div>
              <div
                class="field-error"
                *ngIf="
                  loginForm.get('registration')?.touched &&
                  loginForm.get('registration')?.invalid
                "
              >
                Por favor, informe sua matrícula
              </div>
            </div>

            <div class="form-group">
              <label for="password">Senha</label>
              <div class="input-wrapper">
                <span class="input-icon">🔑</span>
                <input
                  id="password"
                  [type]="showPassword ? 'text' : 'password'"
                  formControlName="password"
                  placeholder="Sua senha institucional"
                  autocomplete="current-password"
                />
                <button
                  type="button"
                  class="toggle-password"
                  (click)="showPassword = !showPassword"
                >
                  {{ showPassword ? '🙈' : '👁' }}
                </button>
              </div>
              <div
                class="field-error"
                *ngIf="
                  loginForm.get('password')?.touched &&
                  loginForm.get('password')?.invalid
                "
              >
                A senha é obrigatória
              </div>
            </div>

            <div class="error-toast" *ngIf="loginError">
              <span class="error-icon">⚠️</span>
              <p>{{ loginError }}</p>
            </div>

            <button
              type="submit"
              class="btn btn-primary login-btn"
              [disabled]="loginForm.invalid || loading"
            >
              <span *ngIf="!loading">Entrar no Sistema</span>
              <span *ngIf="loading" class="btn-spinner">Autenticando...</span>
            </button>

            <div class="divider">
              <span>OU</span>
            </div>

            <button
              type="button"
              class="btn btn-glass request-btn"
              [disabled]="loading || requesting"
              (click)="onRequestAccess()"
            >
              <span *ngIf="!requesting">Primeiro Acesso / Gerar Senha</span>
              <span *ngIf="requesting">Processando...</span>
            </button>
          </form>

          <div class="login-footer">
            <p>
              Problemas com acesso?
              <a href="mailto:deppi.maracanau@ifce.edu.br" class="link"
                >Suporte Técnico</a
              >
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .login-page {
        min-height: 100vh;
        display: grid;
        grid-template-columns: 1.1fr 1fr;
        background: var(--color-background);
      }

      .login-visual {
        position: relative;
        background: var(--color-primary-dark);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 4rem;
        color: white;
        overflow: hidden;
      }

      .visual-bg {
        position: absolute;
        inset: 0;
        background: url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000')
          center/cover;
        opacity: 0.15;
        mix-blend-mode: overlay;
      }

      .visual-content {
        position: relative;
        z-index: 10;
        max-width: 500px;
      }

      .visual-title {
        font-size: 3.5rem;
        margin-bottom: 1.5rem;
        line-height: 1.1;
      }

      .visual-desc {
        font-size: 1.25rem;
        color: rgba(255, 255, 255, 0.8);
        line-height: 1.6;
      }

      .login-container {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
      }

      .login-card {
        width: 100%;
        max-width: 480px;
        padding: 3.5rem;
        box-shadow: var(--shadow-xl);
      }

      .login-header {
        text-align: center;
        margin-bottom: 3rem;
      }

      .login-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
      }

      .login-title {
        font-size: 2.2rem;
        margin-bottom: 0.5rem;
      }

      .login-subtitle {
        color: var(--color-text-secondary);
        font-size: 1rem;
      }

      .input-wrapper {
        position: relative;
        display: flex;
        align-items: center;
      }

      .input-icon {
        position: absolute;
        left: 1rem;
        color: var(--color-text-muted);
        font-size: 1.2rem;
      }

      input {
        padding-left: 3rem !important;
      }

      .toggle-password {
        position: absolute;
        right: 1rem;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1.2rem;
        color: var(--color-text-muted);
      }

      .field-error {
        color: var(--color-error);
        font-size: 0.8rem;
        font-weight: 500;
        margin-top: 0.5rem;
      }

      .error-toast {
        display: flex;
        gap: 0.8rem;
        background: rgba(var(--color-secondary-rgb), 0.1);
        border: 1px solid rgba(var(--color-secondary-rgb), 0.2);
        padding: 1rem;
        border-radius: var(--border-radius-md);
        color: var(--color-secondary);
        margin-bottom: 1.5rem;
        font-size: 0.9rem;
        animation: shake 0.5s ease-in-out;
      }

      @keyframes shake {
        0%,
        100% {
          transform: translateX(0);
        }
        25% {
          transform: translateX(-5px);
        }
        75% {
          transform: translateX(5px);
        }
      }

      .login-btn,
      .request-btn {
        width: 100%;
        justify-content: center;
        padding: 1rem;
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 0.1em;
      }

      .divider {
        display: flex;
        align-items: center;
        text-align: center;
        margin: 1.5rem 0;
        color: var(--color-text-muted);
        font-size: 0.75rem;
        font-weight: 700;
      }

      .divider::before,
      .divider::after {
        content: '';
        flex: 1;
        border-bottom: 1px solid var(--color-border);
      }

      .divider:not(:empty)::before {
        margin-right: 0.5em;
      }

      .divider:not(:empty)::after {
        margin-left: 0.5em;
      }

      .login-footer {
        margin-top: 2.5rem;
        text-align: center;
        font-size: 0.9rem;
        color: var(--color-text-secondary);
      }

      .link {
        color: var(--color-primary);
        text-decoration: none;
        font-weight: 700;
        transition: opacity 0.2s;
      }

      .link:hover {
        opacity: 0.7;
      }

      @media (max-width: 1024px) {
        .login-page {
          grid-template-columns: 1fr;
        }
        .login-visual {
          display: none;
        }
      }

      @media (max-width: 640px) {
        .login-card {
          padding: 2.5rem 1.5rem;
        }
      }
    `,
  ],
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  loginForm = new FormBuilder().group({
    registration: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  loading = false;
  requesting = false;
  loginError = '';
  showPassword = false;

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.loginError = '';

    const { registration, password } = this.loginForm.value as {
      registration: string;
      password: string;
    };

    this.authService.login({ registration, password }).subscribe({
      next: () => {
        const returnUrl =
          this.route.snapshot.queryParams['returnUrl'] ?? '/boletins';
        this.router.navigateByUrl(returnUrl);
        this.loading = false;
      },
      error: (err) => {
        this.loginError =
          err?.error?.message ??
          'Credenciais inválidas. Verifique sua matrícula e senha.';
        this.loading = false;
      },
    });
  }

  onRequestAccess(): void {
    const registration = this.loginForm.get('registration')?.value;

    if (!registration) {
      this.loginError = 'Por favor, informe sua matrícula SIAPE primeiro.';
      this.loginForm.get('registration')?.markAsTouched();
      return;
    }

    this.requesting = true;
    this.loginError = '';

    this.authService.requestAccess(registration).subscribe({
      next: () => {
        this.requesting = false;
      },
      error: (err) => {
        this.loginError =
          err?.error?.message || 'Erro ao processar solicitação.';
        this.requesting = false;
      },
    });
  }
}
