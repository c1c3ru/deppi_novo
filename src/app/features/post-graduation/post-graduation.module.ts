import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { Component } from '@angular/core';

@Component({
  selector: 'app-post-graduation',
  template: `
    <main class="page-container">
      <section class="split-section">
        <div class="content-col">
          <span class="subtitle">SEMPRE EM CRESCIMENTO</span>
          <h1 class="title">Pós-Graduação</h1>
          <p class="description">
            Os cursos de pós-graduação (lato sensu) são destinados a todos que
            concluíram o ensino superior e desejam
            <span class="highlight"
              >obter atualização acadêmica ou profissional e o consequente
              progresso das competências obtidas na graduação.</span
            >
          </p>
        </div>
        <div class="image-col">
          <img
            src="assets/pos-graduacao/colecao-grau.jpg"
            alt="Colação de Grau"
          />
        </div>
      </section>

      <section class="tabs-section">
        <div class="tabs-nav">
          <button
            [class.active]="activeTab === 'acadêmico'"
            (click)="activeTab = 'acadêmico'"
          >
            Mestrado Acadêmico
          </button>
          <button
            [class.active]="activeTab === 'profissional'"
            (click)="activeTab = 'profissional'"
          >
            Mestrado Profissional
          </button>
          <button
            [class.active]="activeTab === 'doutorado'"
            (click)="activeTab = 'doutorado'"
          >
            Doutorado
          </button>
        </div>

        <div class="tab-content" *ngIf="activeTab === 'acadêmico'">
          <p>
            O mestrado acadêmico é destinado a todos que tenham concluído o
            ensino superior e desejam obter titulação com grau de mestre, por
            meio de estudos voltados para o ensino e pesquisa direcionados para
            a carreira acadêmica.
          </p>
        </div>
        <div class="tab-content" *ngIf="activeTab === 'profissional'">
          <p>
            O mestrado profissional é voltado para a capacitação de
            profissionais nas diversas áreas do conhecimento, mediante estudo de
            técnicas e processos com foco na aplicação prática no mercado de
            trabalho ou no desenvolvimento de inovações.
          </p>
        </div>
        <div class="tab-content" *ngIf="activeTab === 'doutorado'">
          <p>
            O doutorado visa a formação de pesquisadores de alto nível, com
            capacidade para realizar estudos originais e independentes que
            contribuam para o avanço do conhecimento em sua área de atuação.
          </p>
        </div>
      </section>
    </main>
  `,
  styles: [
    `
      .page-container {
        min-height: 100vh;
        padding-top: 120px;
        padding-bottom: 60px;
        background-color: #ffffff;
        font-family: var(--font-display, 'Inter', sans-serif);
        color: #333;
      }
      .split-section {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 4rem;
        max-width: 1100px;
        margin: 0 auto;
        padding: 2rem;
        align-items: center;
      }
      .subtitle {
        color: #00d97e;
        font-weight: 700;
        font-size: 0.85rem;
        text-transform: uppercase;
        letter-spacing: 1.5px;
        display: flex;
        align-items: center;
        margin-bottom: 1rem;
      }
      .subtitle::before {
        content: '';
        display: inline-block;
        width: 30px;
        height: 2px;
        background-color: #00d97e;
        margin-right: 15px;
      }
      .title {
        font-size: 4rem;
        font-weight: 800;
        color: #1a1a1a;
        margin: 0 0 1.5rem;
        line-height: 1.1;
      }
      .description {
        font-size: 1.1rem;
        line-height: 1.8;
        color: #4a4a4a;
      }
      .highlight {
        background-color: #00e676;
        color: #000;
        font-weight: 600;
        padding: 0 0.2rem;
      }
      .image-col img {
        width: 100%;
        height: auto;
        object-fit: cover;
        border-radius: 4px;
      }

      .tabs-section {
        max-width: 900px;
        margin: 4rem auto 0;
        padding: 0 2rem;
      }
      .tabs-nav {
        display: flex;
        justify-content: center;
        gap: 1rem;
        margin-bottom: 2rem;
        border: 1px solid #ccc;
        border-radius: 50px;
        padding: 0.5rem;
      }
      .tabs-nav button {
        background: transparent;
        border: none;
        padding: 0.8rem 2rem;
        font-size: 1rem;
        font-weight: 600;
        color: #333;
        border-radius: 50px;
        cursor: pointer;
        transition: all 0.3s;
      }
      .tabs-nav button.active {
        background-color: #00a650;
        color: #fff;
      }
      .tab-content {
        border: 1px solid #ccc;
        border-radius: 20px;
        padding: 2.5rem 3rem;
        font-size: 1.1rem;
        line-height: 1.8;
        color: #4a4a4a;
        text-align: center;
      }

      @media (max-width: 768px) {
        .split-section {
          grid-template-columns: 1fr;
          gap: 2rem;
        }
        .title {
          font-size: 2.5rem;
        }
        .tabs-nav {
          flex-direction: column;
          border-radius: 20px;
        }
        .tabs-nav button {
          border-radius: 10px;
        }
      }
    `,
  ],
})
export class PostGraduationComponent {
  activeTab = 'acadêmico';
}

const routes: Routes = [{ path: '', component: PostGraduationComponent }];

@NgModule({
  declarations: [PostGraduationComponent],
  imports: [CommonModule, RouterModule.forChild(routes), SharedModule],
})
export class PostGraduationModule {}
