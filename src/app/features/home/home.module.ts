import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { Component } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-home',
  template: `
    <main class="page-container">
      <section class="split-section">
        <div class="content-col">
          <span class="subtitle">INÍCIO</span>
          <h1 class="title">Quem somos?</h1>
          <p class="description">
            O Departamento de Extensão, Pesquisa, Pós-Graduação e Inovação
            (DEPPI) tem como objetivo fomentar a
            <span class="highlight"
              >pesquisa, extensão e as novas tecnologias, a busca da atualização
              sistemática de dados da Pesquisa e da Inovação Tecnológica,</span
            >
            divulgando-as por meio de periódicos e incentivando a ética na
            pesquisa do Instituto, bem como promover a interface do IFCE com
            empresas e entidades, para implantação de cursos e atividades da
            extensão na área de atuação do IFCE.
          </p>
        </div>
        <div class="image-col">
          <img
            src="assets/introduction/laboratory.jpg"
            alt="Quem somos - Laboratório"
          />
        </div>
      </section>

      <section class="split-section reverse-mobile">
        <div class="image-col">
          <img
            src="assets/introduction/investiments.jpg"
            alt="O que fazemos - Equipe"
          />
        </div>
        <div class="content-col">
          <span class="subtitle">NOSSAS AÇÕES</span>
          <h1 class="title">O que fazemos?</h1>
          <p class="description">
            <span class="highlight"
              >Possibilitamos meios para captação de recursos externos para a
              pesquisa básica e aplicada, convocamos pesquisadores para
              elaboração conjunta de projetos institucionais, e mantemos
              atualizados os dados junto a órgãos de fomento.</span
            >
            Promovemos a coleta sistemática de dados para avaliação da pesquisa
            científica e incentivamos parcerias com a sociedade civil para o
            desenvolvimento de pesquisa e extensão. Supervisionamos ações do
            NEABI, coordenamos cursos de Extensão e a Semana de Integração
            Científica, além de disseminar a cultura empreendedora através de
            empresas júnior e grupos estudantis, dentre outros. Para mais
            informações, clique <a href="#" class="link">aqui</a>.
          </p>
        </div>
      </section>
    </main>
  `,
  styles: [
    `
      /* Layout, subtítulo, destaque e link herdam de main.scss
         (.page-container, .split-section, .subtitle, .highlight, .link,
         .image-col img) — usam os tokens institucionais e já respondem ao
         modo escuro. Aqui só o ajuste de tamanho específico desta página. */
      .title {
        font-size: 3.5rem;
        font-weight: 800;
        margin: 0 0 1.5rem;
        line-height: 1.1;
      }
      .description {
        font-size: 1.1rem;
        line-height: 1.8;
      }

      @media (max-width: 768px) {
        .title {
          font-size: 2.5rem;
        }
      }
    `,
  ],
})
export class HomeComponent {}

const routes: Routes = [{ path: '', component: HomeComponent }];

@NgModule({
  declarations: [HomeComponent],
  imports: [CommonModule, RouterModule.forChild(routes), SharedModule],
})
export class HomeModule {}
