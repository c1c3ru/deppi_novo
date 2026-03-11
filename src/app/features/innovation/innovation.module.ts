import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { Component } from '@angular/core';

@Component({
  selector: 'app-innovation',
  template: `
    <main class="page-container">
      <section class="split-section">
        <div class="content-col">
          <span class="subtitle">O QUE NOS MOVE</span>
          <h1 class="title">Inovação</h1>
          <p class="description">
            A Inovação no IFCE acontece de forma integrada, promovendo mudanças
            que impactam vidas, negócios e a sociedade. Aqui,
            <span class="highlight"
              >instituição e a ciência caminham juntas para transformar
              realidades e abrir novos horizontes para o desenvolvimento
              tecnológico e social.</span
            >
          </p>
        </div>
        <div class="image-col">
          <img
            src="assets/inovacao/materiais.jpg"
            alt="Inovação - Estudante Cadeirante no Esporte"
          />
        </div>
      </section>

      <section class="obligations-section">
        <div class="obligations-header">
          <h2>Obrigações contratuais</h2>
          <p>Segundo a <a href="#">RESOLUÇÃO Nº 129</a> -</p>
        </div>

        <div class="article-block">
          <span class="article-title">— ART 4°</span>
          <p>
            A Política de Inovação Tecnológica do IFCE visa estabelecer
            diretrizes e medidas de incentivo à pesquisa aplicada à inovação,
            extensão tecnológica, à gestão da propriedade intelectual,
            negociação e transferência de tecnologias, ao desenvolvimento de
            ambientes e atividades promotoras do empreendedorismo e de negócios
            sociais e cooperados, com vistas à capacitação e à formação
            profissional e tecnológica; à inserção de egressos e ao alcance da
            autonomia tecnológica e desenvolvimento dos Arranjos Produtivos,
            Sociais e Culturais em nível estadual ou regional, nacional e
            internacional.
          </p>
        </div>

        <div class="article-block">
          <span class="article-title">— ART 5°</span>
          <p>A Política de Inovação Tecnológica do IFCE tem como objetivos:</p>
          <ul class="article-list">
            <li>
              I - promover a cultura da inovação, empreendedorismo e proteção à
              propriedade intelectual, zelando pela adequada proteção das
              inovações geradas pela comunidade interna e externa;
            </li>
            <li>
              II - definir as ações de inovação tecnológica nas esferas da
              ciência e da tecnologia, no âmbito do IFCE, em alinhamento com os
              campos do saber;
            </li>
            <li>
              III - estabelecer diretrizes e regras quanto ao processo de
              inovação tecnológica, criação e transferência de tecnologias,
              licenciamento, produção, distribuição e exploração;
            </li>
            <li>
              IV - fomentar a inovação no IFCE, em âmbito científico e
              tecnológico, e o desenvolvimento de projetos de cooperação,
              visando à geração de produtos e processos inovadores;
            </li>
            <li>
              V - fomentar a criação, a expansão e viabilizar o acesso a
              ambientes de inovação por meio de incubadoras, empresas juniores e
              parques tecnológicos, startups, spin-off, aceleradoras,
              Instituições de Ciência, Tecnologia e Inovação (ICTs), entidades
              representativas dos setores público, privado e afins;
            </li>
            <li>
              VI - fomentar e estabelecer parcerias e buscar financiamento junto
              a órgãos governamentais, empresas e outras instituições da
              sociedade, para o desenvolvimento da inovação;
            </li>
            <li>
              VII - regulamentar o compartilhamento e o uso de laboratórios,
              instrumentos, materiais e instalações, no âmbito do IFCE, por
              pesquisadores e instituições externas, em suporte à atividade de
              pesquisa científica e tecnológica interna ou externa;
            </li>
            <li>
              VIII - fomentar e regular a transferência de tecnologia e
              inventos, oriundos de pesquisas do IFCE, ao setor produtivo local,
              nacional ou estrangeiro;
            </li>
            <li>
              IX - realizar parcerias com empresas para projetos cooperados de
              pesquisa aplicada à inovação;
            </li>
            <li>
              X - promover o apoio, incentivo e integração dos inventores
              independentes às atividades da instituição e do sistema produtivo;
            </li>
            <li>
              XI - promover o apoio e incentivo aos pesquisadores através de
              mecanismos de estímulo à pesquisa, desenvolvimento, inovação e
              intercâmbio de pesquisadores e atividades de ensino em temas
              correlacionados à inovação.
            </li>
          </ul>
        </div>

        <div class="actions">
          <a href="#" class="btn-solid">Ver Resolução 129</a>
          <a href="#" class="btn-solid">Outros documentos</a>
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

      .obligations-section {
        max-width: 1100px;
        margin: 4rem auto 0;
        padding: 0 2rem;
      }
      .obligations-header {
        text-align: center;
        margin-bottom: 4rem;
      }
      .obligations-header h2 {
        font-size: 2.5rem;
        font-weight: 800;
        color: #1a1a1a;
        margin: 0 0 0.5rem;
      }
      .obligations-header p {
        font-size: 1.1rem;
        color: #4a4a4a;
        margin: 0;
      }
      .obligations-header a {
        color: #00d97e;
        text-decoration: none;
        font-weight: 600;
      }
      .article-block {
        margin-bottom: 2.5rem;
      }
      .article-title {
        color: #00d97e;
        font-weight: 700;
        font-size: 0.9rem;
        text-transform: uppercase;
        margin-bottom: 1rem;
        display: block;
      }
      .article-block p {
        font-size: 1rem;
        line-height: 1.8;
        color: #333;
        margin: 0 0 1rem;
      }
      .article-list {
        list-style-type: none;
        padding: 0;
        margin: 0;
      }
      .article-list li {
        margin-bottom: 1rem;
        font-size: 1rem;
        line-height: 1.8;
        color: #333;
      }
      .actions {
        display: flex;
        justify-content: center;
        gap: 1.5rem;
        margin-top: 4rem;
      }
      .btn-solid {
        background-color: #00a650;
        color: #fff;
        padding: 0.8rem 2rem;
        border-radius: 50px;
        text-decoration: none;
        font-weight: 600;
        font-size: 0.95rem;
        transition: background 0.3s;
      }
      .btn-solid:hover {
        background-color: #008a42;
      }

      @media (max-width: 768px) {
        .split-section {
          grid-template-columns: 1fr;
          gap: 2rem;
        }
        .title {
          font-size: 2.5rem;
        }
        .actions {
          flex-direction: column;
          align-items: center;
        }
      }
    `,
  ],
})
export class InnovationComponent {}

const routes: Routes = [{ path: '', component: InnovationComponent }];

@NgModule({
  declarations: [InnovationComponent],
  imports: [CommonModule, RouterModule.forChild(routes), SharedModule],
})
export class InnovationModule {}
