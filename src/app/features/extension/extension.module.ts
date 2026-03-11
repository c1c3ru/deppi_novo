import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { Component } from '@angular/core';

@Component({
  selector: 'app-extension',
  template: `
    <main class="page-container">
      <section class="split-section">
        <div class="content-col">
          <span class="subtitle">TRANSFORMAÇÃO SOCIAL</span>
          <h1 class="title">Extensão Universitária</h1>
          <p class="description">
            O Plano Nacional de Extensão Universitária define extensão como um
            processo educativo, cultural e científico que articula o ensino e
            pesquisa de forma indissociável,
            <span class="highlight"
              >viabilizando uma relação transformadora entre a instituição de
              ensino superior (IES) e a sociedade.</span
            >
          </p>
        </div>
        <div class="image-col">
          <img src="assets/extensao/projeto.jpg" alt="Extensão Universitária" />
        </div>
      </section>

      <section class="split-section reverse-mobile">
        <div class="image-col">
          <img
            src="assets/extensao/gestores.jpg"
            alt="Atribuições dos Gestores de Extensão"
          />
        </div>
        <div class="content-col">
          <span class="subtitle">COMPROMISSO</span>
          <h1 class="title">Atribuições dos Gestores de Extensão</h1>
          <p class="description">
            Gestores de extensão são os servidores docente ou técnico
            administrativo designados através de portaria, para
            <span class="highlight"
              >cuidar das ações de extensão em seu campus de atuação.</span
            >
          </p>
        </div>
      </section>

      <section class="attributes-section">
        <h2 class="section-title-center">Atribuições</h2>
        <ul class="numbered-list">
          <li>
            <span class="num">1</span>
            <p>Disseminar os conhecimentos sobre extensão</p>
          </li>
          <li>
            <span class="num">2</span>
            <p>Acompanhar as ações de extensão</p>
          </li>
          <li>
            <span class="num">3</span>
            <p>
              Acompanhar os processos de certificação das ações, desde que sejam
              assinados por eventuais parcerias externas.
            </p>
          </li>
          <li>
            <span class="num">4</span>
            <p>
              Participar dos planos e diretrizes relacionadas à extensão no
              campus
            </p>
          </li>
          <li>
            <span class="num">5</span>
            <p>
              Prestar orientações gerais aos extensionistas sobre elaboração,
              execução e avaliação das ações;
            </p>
          </li>
          <li>
            <span class="num">6</span>
            <p>
              Atuar, de forma sistêmica, colaborando para garantir a
              indissociabilidade entre ensino, pesquisa, extensão e os demais
              propósitos educacionais.
            </p>
          </li>
          <li>
            <span class="num">7</span>
            <p>
              Articular ações de desenvolvimento regional e social, mediado pela
              ciência e tecnologia, para construção de novas possibilidades
              associativas e estratégicas de inclusão social
            </p>
          </li>
          <li>
            <span class="num">8</span>
            <p>Organizar e divulgar calendário das ações de extensão</p>
          </li>
          <li>
            <span class="num">9</span>
            <p>
              Incentivar a promoção de eventos que contribuam para a intercâmbio
              de experiências entre a Instituição, Empresa e a Comunidade, e
              manter informações e publicações atualizadas, além de registros
              fotográficos, para elaboração de matérias, informativos,
              catálogos, cartilhas e ou outras publicações.
            </p>
          </li>
        </ul>
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
        padding: 4rem 2rem;
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
        font-size: 3.5rem;
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

      .attributes-section {
        max-width: 900px;
        margin: 2rem auto;
        padding: 0 2rem;
      }
      .section-title-center {
        text-align: center;
        font-size: 2rem;
        font-weight: 800;
        color: #1a1a1a;
        margin-bottom: 3rem;
      }
      .numbered-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      .numbered-list li {
        display: flex;
        align-items: flex-start;
        gap: 1.5rem;
        margin-bottom: 1.5rem;
      }
      .numbered-list .num {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 35px;
        height: 35px;
        border: 2px solid #00d97e;
        border-radius: 50%;
        color: #333;
        font-weight: 700;
        font-size: 1rem;
      }
      .numbered-list p {
        margin: 0;
        font-size: 1rem;
        line-height: 1.6;
        color: #4a4a4a;
        padding-top: 5px;
      }

      @media (max-width: 768px) {
        .split-section {
          grid-template-columns: 1fr;
          gap: 2rem;
        }
        .reverse-mobile .image-col {
          order: 2;
        }
        .reverse-mobile .content-col {
          order: 1;
        }
        .title {
          font-size: 2.5rem;
        }
      }
    `,
  ],
})
export class ExtensionComponent {}

const routes: Routes = [{ path: '', component: ExtensionComponent }];

@NgModule({
  declarations: [ExtensionComponent],
  imports: [CommonModule, RouterModule.forChild(routes), SharedModule],
})
export class ExtensionModule {}
