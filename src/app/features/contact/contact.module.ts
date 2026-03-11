import { NgModule, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { Component } from '@angular/core';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-contact',
  template: `
    <main class="page-container ifce-bg-accent">
      <section class="page-hero reveal-up">
        <div class="hero-decoration"></div>
        <div class="page-icon">📬</div>
        <h1 class="page-title">Fale Conosco</h1>
        <p class="page-subtitle">
          Tem dúvidas sobre editais, bolsas ou parcerias? Nossa equipe está
          pronta para conectar você às oportunidades do DEPPI.
        </p>
      </section>

      <div class="content-area">
        <div class="contact-grid">
          <div class="contact-sidebar reveal-up" style="animation-delay: 0.1s">
            <div class="contact-info-card surface">
              <h2 class="card-title">Informações Diretas</h2>
              <div class="contact-list-modern">
                <div class="contact-item">
                  <span class="item-icon">📧</span>
                  <div class="item-content">
                    <label>E-mail Institucional</label>
                    <p>deppi.maracanau&#64;ifce.edu.br</p>
                  </div>
                </div>
                <div class="contact-item">
                  <span class="item-icon">📞</span>
                  <div class="item-content">
                    <label>Telefone / Ramal</label>
                    <p>(85) 3401.2233</p>
                  </div>
                </div>
                <div class="contact-item">
                  <span class="item-icon">📍</span>
                  <div class="item-content">
                    <label>Presencial</label>
                    <p>Av. Parque Central, S/N - Maracanaú, CE</p>
                  </div>
                </div>
                <div class="contact-item">
                  <span class="item-icon">🕐</span>
                  <div class="item-content">
                    <label>Atendimento</label>
                    <p>Segunda a Sexta, 08h às 18h</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            class="contact-form-side reveal-up"
            style="animation-delay: 0.2s"
          >
            <div class="form-container surface">
              <h2 class="form-title">Envie sua Mensagem</h2>
              <form
                [formGroup]="form"
                (ngSubmit)="submit()"
                class="modern-form"
              >
                <div class="form-row">
                  <div class="form-group">
                    <label for="name">Nome Completo</label>
                    <input
                      id="name"
                      type="text"
                      formControlName="name"
                      placeholder="Como podemos chamar você?"
                      [class.error]="
                        form.get('name')?.invalid && form.get('name')?.touched
                      "
                    />
                    <span
                      class="field-error"
                      *ngIf="
                        form.get('name')?.invalid && form.get('name')?.touched
                      "
                      >Mínimo 3 caracteres</span
                    >
                  </div>
                  <div class="form-group">
                    <label for="email">E-mail</label>
                    <input
                      id="email"
                      type="email"
                      formControlName="email"
                      placeholder="seu@exemplo.com"
                      [class.error]="
                        form.get('email')?.invalid && form.get('email')?.touched
                      "
                    />
                    <span
                      class="field-error"
                      *ngIf="
                        form.get('email')?.invalid && form.get('email')?.touched
                      "
                      >E-mail inválido</span
                    >
                  </div>
                </div>

                <div class="form-group">
                  <label for="subject">Assunto</label>
                  <input
                    id="subject"
                    type="text"
                    formControlName="subject"
                    placeholder="Do que se trata sua mensagem?"
                    [class.error]="
                      form.get('subject')?.invalid &&
                      form.get('subject')?.touched
                    "
                  />
                  <span
                    class="field-error"
                    *ngIf="
                      form.get('subject')?.invalid &&
                      form.get('subject')?.touched
                    "
                    >Mínimo 5 caracteres</span
                  >
                </div>

                <div class="form-group">
                  <label for="message">Sua Mensagem</label>
                  <textarea
                    id="message"
                    formControlName="message"
                    rows="6"
                    placeholder="Descreva sua solicitação ou dúvida detalhadamente..."
                    [class.error]="
                      form.get('message')?.invalid &&
                      form.get('message')?.touched
                    "
                  ></textarea>
                  <span
                    class="field-error"
                    *ngIf="
                      form.get('message')?.invalid &&
                      form.get('message')?.touched
                    "
                    >Mínimo 20 caracteres</span
                  >
                </div>

                <button
                  type="submit"
                  [disabled]="isSubmitting"
                  class="btn btn-primary submit-btn"
                >
                  <span *ngIf="!isSubmitting">Enviar Mensagem</span>
                  <span *ngIf="isSubmitting">Enviando...</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  `,
  styles: [
    `
      .page-container {
        min-height: 100vh;
        padding-top: 120px;
      }
      .page-hero {
        text-align: center;
        padding: 6rem 1.5rem 4rem;
        background: linear-gradient(135deg, var(--color-primary-light), #fff);
        position: relative;
        overflow: hidden;
      }
      .hero-decoration {
        position: absolute;
        top: -50px;
        right: -50px;
        width: 300px;
        height: 300px;
        background: radial-gradient(
          circle,
          rgba(var(--color-primary-rgb), 0.1) 0%,
          transparent 70%
        );
        border-radius: 50%;
      }
      .page-icon {
        font-size: 5rem;
        margin-bottom: 2rem;
        filter: drop-shadow(0 10px 15px rgba(0, 0, 0, 0.1));
      }
      .page-title {
        font-size: clamp(2.5rem, 5vw, 3.5rem);
        color: var(--color-text);
        margin: 0 0 1.5rem;
        font-family: var(--font-display);
      }
      .page-subtitle {
        font-size: 1.25rem;
        color: var(--color-text-secondary);
        max-width: 700px;
        margin: 0 auto;
      }
      .content-area {
        max-width: var(--container-max-width);
        margin: 6rem auto;
        padding: 0 1.5rem;
      }

      .contact-grid {
        display: grid;
        grid-template-columns: 1fr 1.8fr;
        gap: 3rem;
        align-items: start;
      }

      .contact-list-modern {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        margin-top: 2rem;
      }

      .contact-item {
        display: flex;
        gap: 1.2rem;
        align-items: flex-start;
      }

      .item-icon {
        width: 44px;
        height: 44px;
        background: rgba(var(--color-primary-rgb), 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--border-radius-md);
        font-size: 1.2rem;
      }

      .item-content label {
        display: block;
        font-size: 0.75rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--color-text-muted);
        margin-bottom: 0.2rem;
      }

      .item-content p {
        font-weight: 600;
        color: var(--color-text);
        margin: 0;
        font-size: 1rem;
      }

      .form-container {
        padding: 4rem;
      }

      .form-title {
        font-family: var(--font-display);
        font-size: 2rem;
        margin-bottom: 2.5rem;
      }

      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
      }

      .submit-btn {
        width: 100%;
        height: 60px;
        font-size: 1rem;
        justify-content: center;
        margin-top: 1rem;
      }

      .field-error {
        display: block;
        color: var(--color-error);
        font-size: 0.75rem;
        font-weight: 600;
        margin-top: 0.4rem;
      }

      input.error,
      textarea.error {
        border-color: var(--color-error) !important;
      }

      @media (max-width: 1024px) {
        .contact-grid {
          grid-template-columns: 1fr;
        }
        .contact-sidebar {
          order: 2;
        }
        .contact-form-side {
          order: 1;
        }
        .form-container {
          padding: 2.5rem 1.5rem;
        }
      }

      @media (max-width: 640px) {
        .form-row {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class ContactComponent {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly notificationService = inject(NotificationService);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    subject: ['', [Validators.required, Validators.minLength(5)]],
    message: ['', [Validators.required, Validators.minLength(20)]],
  });

  isSubmitting = false;

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notificationService.showWarning(
        'Por favor, preencha todos os campos obrigatórios corretamente.'
      );
      return;
    }

    this.isSubmitting = true;

    this.http
      .post(`${environment.apiUrl}/api/contact`, this.form.value)
      .subscribe({
        next: () => {
          this.notificationService.showSuccess(
            'Sua mensagem foi enviada com sucesso! Responderemos em breve.'
          );
          this.isSubmitting = false;
          this.form.reset();
        },
        error: (err: any) => {
          console.error('Erro ao enviar mensagem', err);
          const msg =
            err?.error?.message ||
            'Ocorreu um erro ao enviar sua mensagem. Tente novamente mais tarde.';
          this.notificationService.showError(msg);
          this.isSubmitting = false;
        },
      });
  }
}

const routes: Routes = [{ path: '', component: ContactComponent }];

@NgModule({
  declarations: [ContactComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    SharedModule,
  ],
})
export class ContactModule {}
