import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { Component } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-research',
  template: `
    <main class="page-container">
      <section class="split-section">
        <div class="content-col">
          <span class="subtitle">IDEIAS DE INOVAÇÃO</span>
          <h1 class="title">Pesquisa</h1>
          <p class="description">
            A pesquisa institucional é um dos pilares que suportam a evolução de
            nossa comunidade (docentes, discentes, técnicos administrativos e
            toda a sociedade).
            <span class="highlight"
              >A PRPI existe para fomentar e direcionar as ações de pesquisa
              para que haja harmonia nessa evolução.</span
            >
            Como Instituto de Tecnologia, o IFCE se destaca na forte aplicação
            da pesquisa acadêmica desenvolvida em seus laboratórios. Neste
            contexto, ações que objetivam a transferência de produtos,
            protótipos e/ou processos para o mercado têm sido alvo de diversas
            iniciativas internas bem como na busca de fomento externo.
          </p>
        </div>
        <div class="image-col">
          <img
            src="assets/introduction/laboratory.jpg"
            alt="Pesquisa - Laboratório"
          />
        </div>
      </section>

      <section class="split-section reverse-mobile">
        <div class="image-col">
          <img src="assets/pesquisa/managers.jpg" alt="Gestor de Pesquisa" />
        </div>
        <div class="content-col">
          <span class="subtitle">IDEIAS DE INOVAÇÃO</span>
          <h1 class="title">Gestor de pesquisa</h1>
          <p class="description">
            Conjuntamente com a equipe da PRPI, os gestores de pesquisa,
            pós-graduação e inovação são os servidores designados em seus campi
            para coordenar as atividades de pesquisa, pós-graduação e inovação.
            Dependendo da estrutura organizacional de cada campus eles podem ser
            representados por chefes de departamentos de pesquisa, diretores de
            pesquisa, coordenadores de pesquisa ou funções equivalentes.
            <span class="highlight"
              >Cada gestor dos campi do IFCE tem como papel fundamental fomentar
              e incentivar as ações e oportunidades na área de pesquisa,
              pós-graduação e inovação no âmbito interno e externo do IFCE além
              de relacionar-se com as políticas e informações disponibilizadas
              pela PRPI.</span
            >
          </p>
        </div>
      </section>
    </main>
  `,
  styles: [
    `
      /* Layout, subtítulo, destaque e link herdam de main.scss
         (.page-container, .split-section, .subtitle, .highlight,
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
export class ResearchComponent {}

const routes: Routes = [{ path: '', component: ResearchComponent }];

@NgModule({
  declarations: [ResearchComponent],
  imports: [CommonModule, RouterModule.forChild(routes), SharedModule],
})
export class ResearchModule {}
