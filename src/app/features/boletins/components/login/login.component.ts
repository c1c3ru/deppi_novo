import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ValidationService } from '../../../../core/services/validation.service';

@Component({
    selector: 'app-login',
    template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <img src="assets/icons/ifce-logo.svg" alt="IFCE" class="login-logo" onerror="this.style.display='none'">
          <h1 class="login-title">Área Restrita</h1>
          <p class="login-subtitle">Acesse os boletins do DEPPI</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label for="registration">Matrícula</label>
            <input
              id="registration"
              type="text"
              formControlName="registration"
              placeholder="Ex: 12345"
              autocomplete="username"
            >
            <span class="field-error" *ngIf="loginForm.get('registration')?.touched && loginForm.get('registration')?.invalid">
              Matrícula obrigatória
            </span>
          </div>

          <div class="form-group">
            <label for="password">Senha</label>
            <div class="password-input">
              <input
                id="password"
                [type]="showPassword ? 'text' : 'password'"
                formControlName="password"
                placeholder="Sua senha"
                autocomplete="current-password"
              >
              <button type="button" class="toggle-password" (click)="showPassword = !showPassword">
                {{ showPassword ? '🙈' : '👁' }}
              </button>
            </div>
            <span class="field-error" *ngIf="loginForm.get('password')?.touched && loginForm.get('password')?.invalid">
              Senha obrigatória
            </span>
          </div>

          <div class="error-alert" *ngIf="loginError">
            ⚠️ {{ loginError }}
          </div>

          <button
            type="submit"
            class="login-btn"
            [disabled]="loginForm.invalid || loading"
          >
            <span *ngIf="!loading">Entrar</span>
            <span *ngIf="loading" class="btn-loading">⏳ Autenticando...</span>
          </button>
        </form>

        <div class="login-hint">
          <small>Use sua matrícula institucional e senha do SUAP/IFCE</small>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .login-container {
      min-height: calc(100vh - 80px);
      display: flex; align-items: center; justify-content: center;
      padding: 2rem;
      background: linear-gradient(135deg, #0a0a1e 0%, #0d1b4b 50%, #0a0a1e 100%);
    }
    .login-card {
      background: rgba(255,255,255,0.05);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 1.5rem;
      padding: 3rem;
      width: 100%; max-width: 420px;
      box-shadow: 0 25px 50px rgba(0,0,0,0.5);
    }
    .login-header { text-align: center; margin-bottom: 2.5rem; }
    .login-logo { height: 60px; margin-bottom: 1rem; filter: brightness(10); }
    .login-title { font-size: 1.75rem; font-weight: 800; color: white; margin: 0 0 0.5rem; }
    .login-subtitle { color: rgba(255,255,255,0.6); margin: 0; }
    .form-group { margin-bottom: 1.25rem; }
    label { display: block; color: rgba(255,255,255,0.8); font-size: 0.9rem; font-weight: 600; margin-bottom: 0.4rem; }
    input {
      width: 100%; padding: 0.85rem 1rem; background: rgba(255,255,255,0.08);
      border: 1.5px solid rgba(255,255,255,0.15); border-radius: 0.6rem;
      color: white; font-size: 1rem; transition: border-color 0.2s; box-sizing: border-box;
    }
    input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
    input::placeholder { color: rgba(255,255,255,0.3); }
    .password-input { position: relative; }
    .toggle-password {
      position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%);
      background: none; border: none; cursor: pointer; font-size: 1rem;
    }
    .field-error { color: #fca5a5; font-size: 0.8rem; margin-top: 0.3rem; display: block; }
    .error-alert { background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3); border-radius: 0.5rem; padding: 0.75rem 1rem; color: #fca5a5; font-size: 0.9rem; margin-bottom: 1rem; }
    .login-btn {
      width: 100%; padding: 0.9rem; background: #0066b3; color: white;
      border: none; border-radius: 0.6rem; font-size: 1rem; font-weight: 700;
      cursor: pointer; transition: all 0.2s; margin-top: 0.5rem;
    }
    .login-btn:hover:not(:disabled) { background: #0052a3; transform: translateY(-1px); box-shadow: 0 8px 20px rgba(0,102,179,0.4); }
    .login-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .login-hint { text-align: center; margin-top: 1.5rem; color: rgba(255,255,255,0.4); font-size: 0.85rem; }
  `]
})
export class LoginComponent {
    private readonly authService = inject(AuthService);
    private readonly notificationService = inject(NotificationService);
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);

    loginForm = new FormBuilder().group({
        registration: ['', Validators.required],
        password: ['', Validators.required]
    });

    loading = false;
    loginError = '';
    showPassword = false;

    onSubmit(): void {
        if (this.loginForm.invalid) return;

        this.loading = true;
        this.loginError = '';

        const { registration, password } = this.loginForm.value as { registration: string; password: string };

        this.authService.login({ registration, password }).subscribe({
            next: () => {
                const returnUrl = this.route.snapshot.queryParams['returnUrl'] ?? '/boletins';
                this.router.navigateByUrl(returnUrl);
                this.loading = false;
            },
            error: (err) => {
                this.loginError = err?.error?.message ?? 'Matrícula ou senha incorretos.';
                this.loading = false;
            }
        });
    }
}
