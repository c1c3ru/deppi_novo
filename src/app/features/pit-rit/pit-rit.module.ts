import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';

import { PitFormComponent } from './components/pit-form.component';
import { RitFormComponent } from './components/rit-form.component';

@Component({
  standalone: false,
  selector: 'app-pit-rit',
  template: `
    <main class="page-container">
      <section class="split-section hero-section">
        <div class="content-col">
          <span class="subtitle">{{ 'pitRit.subtitle' | translate }}</span>
          <h1 class="title">{{ 'pitRit.title' | translate }}</h1>
          <p
            class="description"
            [innerHTML]="'pitRit.description' | translate"
          ></p>
          <div class="action-buttons tabs">
            <button
              class="tab-btn"
              [class.active]="activeTab === 'pit'"
              (click)="activeTab = 'pit'; scrollToForm()"
            >
              <span class="btn-icon">📝</span> Plano (PIT)
            </button>
            <button
              class="tab-btn"
              [class.active]="activeTab === 'rit'"
              (click)="activeTab = 'rit'; scrollToForm()"
            >
              <span class="btn-icon">📊</span> Relatório (RIT)
            </button>
          </div>
        </div>
        <div class="image-col">
          <img src="assets/cargahoraria/pit-rit.jpg" alt="PIT / RIT" />
        </div>
      </section>

      <section id="pit-rit-form-section" class="form-section-wrapper">
        <div class="container-narrow">
          <ng-container [ngSwitch]="activeTab">
            <app-pit-form *ngSwitchCase="'pit'"></app-pit-form>
            <app-rit-form *ngSwitchCase="'rit'"></app-rit-form>
          </ng-container>
        </div>
      </section>

      <section class="split-section reverse-mobile">
        <div class="image-col">
          <img src="assets/cargahoraria/pit.jpg" alt="PIT" />
        </div>
        <div class="content-col">
          <span class="subtitle">{{ 'pitRit.pit.subtitle' | translate }}</span>
          <h1 class="title">{{ 'pitRit.pit.title' | translate }}</h1>
          <p class="description">
            {{ 'pitRit.pit.description' | translate }}
            <span class="highlight">{{
              'pitRit.pit.highlight' | translate
            }}</span>
          </p>
        </div>
      </section>

      <section class="split-section">
        <div class="content-col">
          <span class="subtitle">{{ 'pitRit.rit.subtitle' | translate }}</span>
          <h1 class="title">{{ 'pitRit.rit.title' | translate }}</h1>
          <p class="description">
            {{ 'pitRit.rit.description' | translate }}
            <span class="highlight">{{
              'pitRit.rit.highlight' | translate
            }}</span>
          </p>
        </div>
        <div class="image-col">
          <img src="assets/cargahoraria/rit.jpg" alt="RIT" />
        </div>
      </section>

      <section class="cta-section">
        <div class="cta-content">
          <h2>{{ 'pitRit.access.title' | translate }}</h2>
          <p>{{ 'pitRit.access.description' | translate }}</p>
          <div class="cta-btns">
            <a
              href="https://suap.ifce.edu.br"
              target="_blank"
              class="btn btn-outline"
            >
              {{ 'pitRit.access.button' | translate }}
            </a>
          </div>
        </div>
      </section>
    </main>
  `,
  styles: [
    `
      /* Layout, subtítulo, destaque e imagem herdam de main.scss
         (.page-container, .split-section, .subtitle, .highlight,
         .image-col img), assim como .btn/.btn-outline (verde institucional) —
         todos já compatíveis com o modo escuro. Aqui só o específico desta
         página: as abas PIT/RIT e a seção de CTA. */
      .title {
        font-size: 3.5rem;
        font-weight: 800;
        margin: 0 0 1.5rem;
        line-height: 1.1;
      }
      .description {
        font-size: 1.1rem;
        line-height: 1.8;
        margin-bottom: 2.5rem;
      }

      .action-buttons.tabs {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
      }
      .tab-btn {
        padding: 1rem 2rem;
        border-radius: 12px;
        border: 1px solid var(--color-border);
        background: var(--color-background);
        font-weight: 600;

        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        align-items: center;
        gap: 10px;
        color: var(--color-text-secondary);
      }
      .tab-btn.active {
        background: var(--color-primary);
        border-color: var(--color-primary);
        color: var(--color-on-primary);
        box-shadow: 0 10px 20px rgba(var(--color-primary-rgb), 0.25);
        transform: translateY(-2px);
      }
      .btn-icon {
        font-size: 1.2rem;
      }

      .form-section-wrapper {
        background: var(--color-background);
        padding: 5rem 0;
        border-top: 1px solid var(--color-border-light);
        border-bottom: 1px solid var(--color-border-light);
      }
      .container-narrow {
        max-width: 1100px;
        margin: 0 auto;
        padding: 0 1rem;
      }

      .cta-section {
        background: linear-gradient(
          135deg,
          var(--color-primary) 0%,
          var(--color-primary-dark) 100%
        );
        color: var(--color-on-primary);
        padding: 6rem 2rem;
        text-align: center;
        margin-top: 4rem;
      }
      .cta-content {
        max-width: 800px;
        margin: 0 auto;
      }
      .cta-content h2 {
        font-size: 2.5rem;
        font-weight: 700;
        margin-bottom: 1.5rem;
        color: var(--color-on-primary);
      }
      .cta-content p {
        font-size: 1.2rem;
        opacity: 0.9;
        margin-bottom: 2.5rem;
      }
      /* Botão "recortado" com a cor de fundo da página — funciona sobre o
         gradiente institucional em qualquer tema, sem depender de branco fixo. */
      .cta-section .btn-outline {
        background: var(--color-background);
        color: var(--color-primary-dark);
        border-color: var(--color-background);
      }
      .cta-section .btn-outline:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
      }

      @media (max-width: 768px) {
        .title {
          font-size: 2.5rem;
        }
        .cta-content h2 {
          font-size: 2rem;
        }
        .action-buttons.tabs {
          flex-direction: column;
        }
      }
    `,
  ],
})
export class PitRitComponent {
  activeTab: 'pit' | 'rit' = 'pit';

  scrollToForm() {
    setTimeout(() => {
      const el = document.getElementById('pit-rit-form-section');
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 120;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 50);
  }
}

const routes: Routes = [{ path: '', component: PitRitComponent }];

@NgModule({
  declarations: [PitRitComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    TranslateModule,
    FormsModule,
    PitFormComponent,
    RitFormComponent,
    NgxMaskDirective,
    NgxMaskPipe,
  ],
  providers: [],
})
export class PitRitModule {}
