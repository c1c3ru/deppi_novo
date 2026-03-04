import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
    selector: 'app-contact',
    template: `
    <main class="page-container">
      <div class="page-hero">
        <div class="page-icon">📬</div>
        <h1 class="page-title">Contato</h1>
        <p class="page-subtitle">Entre em contato com o DEPPI do IFCE Maracanaú</p>
      </div>
      <div class="content-area">
        <div class="contact-grid">
          <div class="contact-info">
            <h2>Informações de Contato</h2>
            <ul class="contact-list">
              <li>📧 <strong>E-mail:</strong> deppi.maracanau&#64;ifce.edu.br</li>
              <li>📞 <strong>Telefone:</strong> (85) 3307-3700</li>
              <li>📍 <strong>Endereço:</strong> Av. Dr. Sá, 2481 — Maracanaú, CE</li>
              <li>🕐 <strong>Horário:</strong> Seg–Sex, 8h–18h</li>
            </ul>
          </div>
          <div class="contact-form-wrapper">
            <h2>Envie uma Mensagem</h2>
            <form [formGroup]="form" (ngSubmit)="submit()" class="contact-form">
              <div class="form-group">
                <label for="name">Nome</label>
                <input id="name" type="text" formControlName="name" placeholder="Seu nome completo">
              </div>
              <div class="form-group">
                <label for="email">E-mail</label>
                <input id="email" type="email" formControlName="email" placeholder="seu@email.com">
              </div>
              <div class="form-group">
                <label for="subject">Assunto</label>
                <input id="subject" type="text" formControlName="subject" placeholder="Assunto da mensagem">
              </div>
              <div class="form-group">
                <label for="message">Mensagem</label>
                <textarea id="message" formControlName="message" rows="5" placeholder="Digite sua mensagem..."></textarea>
              </div>
              <button type="submit" [disabled]="form.invalid" class="btn-submit">
                {{ submitted ? '✅ Enviado!' : 'Enviar Mensagem' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  `,
    styles: [`
    .page-container { min-height: 100vh; padding-top: 80px; }
    .page-hero { text-align: center; padding: 4rem 2rem 2rem; background: linear-gradient(135deg,#f0fffe,#ccfbf1); }
    .page-icon { font-size: 4rem; margin-bottom: 1rem; }
    .page-title { font-size: 2.5rem; font-weight: 800; color: #1a1a2e; margin: 0 0 1rem; }
    .page-subtitle { font-size: 1.1rem; color: #6b7280; max-width: 600px; margin: 0 auto; }
    .content-area { max-width: 1000px; margin: 3rem auto; padding: 0 2rem; }
    .contact-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 3rem; }
    .contact-info h2, .contact-form-wrapper h2 { font-size: 1.4rem; font-weight: 700; color: #1a1a2e; margin: 0 0 1.5rem; }
    .contact-list { list-style: none; padding: 0; margin: 0; }
    .contact-list li { padding: 0.75rem 0; border-bottom: 1px solid #f3f4f6; color: #374151; }
    .form-group { margin-bottom: 1.25rem; }
    label { display: block; margin-bottom: 0.4rem; font-weight: 600; color: #374151; font-size: 0.9rem; }
    input, textarea { width: 100%; padding: 0.75rem 1rem; border: 1.5px solid #e5e7eb; border-radius: 0.5rem; font-size: 1rem; transition: border-color 0.2s; box-sizing: border-box; }
    input:focus, textarea:focus { outline: none; border-color: #0066b3; box-shadow: 0 0 0 3px rgba(0,102,179,0.1); }
    .btn-submit { width: 100%; padding: 0.9rem; background: #0066b3; color: white; border: none; border-radius: 0.5rem; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .btn-submit:hover:not(:disabled) { background: #0052a3; transform: translateY(-1px); }
    .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
    @media (max-width: 768px) { .contact-grid { grid-template-columns: 1fr; } }
  `]
})
export class ContactComponent {
    form = new FormBuilder().group({
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        subject: ['', Validators.required],
        message: ['', [Validators.required, Validators.minLength(10)]]
    });
    submitted = false;

    submit() {
        if (this.form.valid) {
            this.submitted = true;
            console.log('Mensagem enviada:', this.form.value);
        }
    }
}

const routes: Routes = [{ path: '', component: ContactComponent }];

@NgModule({
    declarations: [ContactComponent],
    imports: [CommonModule, ReactiveFormsModule, RouterModule.forChild(routes), SharedModule]
})
export class ContactModule { }
