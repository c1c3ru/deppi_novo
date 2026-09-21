import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { Component } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-privacy',
  template: `
    <main class="page-container">
      <section class="split-section">
        <div class="content-col full-width">
          <span class="subtitle">TRANSPARÊNCIA E SEGURANÇA</span>
          <h1 class="title">Política de Privacidade</h1>
          <p class="description">
            O Departamento de Extensão, Pesquisa, Pós-Graduação e Inovação
            (DEPPI) do IFCE Maracanaú garante a proteção dos seus dados.
            <span class="highlight"
              >Não coletamos informações de navegação, como cookies, e seguimos
              as diretrizes da Lei Geral de Proteção de Dados (LGPD).</span
            >
          </p>
        </div>
      </section>

      <section class="policy-section">
        <div class="article-block">
          <h2>Coleta de Dados</h2>
          <p>
            O portal do DEPPI Maracanaú tem o intuito de apresentar de forma
            clara e acessível as informações sobre Projetos de Pesquisa,
            Extensão, Inovação e Pós-Graduação do nosso campus. Por determinação
            de nossas políticas internas, nosso sistema de visualização de
            conteúdo aberto não realiza a inserção de rastreadores
            comportamentais ("cookies") nos dispositivos daqueles que o acessam,
            zelando pela privacidade total de quem está apenas buscando
            informações institucionais.
          </p>
        </div>

        <div class="article-block">
          <h2>Adequação à LGPD</h2>
          <p>
            A Lei Geral de Proteção de Dados (Lei nº 13.709/2018) estabelece
            parâmetros rigorosos para a coleta e tratamento de dados pessoais. O
            IFCE atua em total consonância com as normas estabelecidas por esta
            diretriz legal.
          </p>
          <ul class="article-list">
            <li>
              Nenhuma informação pessoal sensível é armazenada sem o
              consentimento livre, expresso e informado do usuário nos
              formulários ou serviços em que seja explicitamente solicitado o
              preenchimento de dados.
            </li>
            <li>
              Quando o usuário estabelece algum canal de contato através dos
              e-mails institucionais fornecidos, os dados associados a essas
              mensagens são mantidos com total sigilo e não são compartilhados
              com entidades comerciais.
            </li>
            <li>
              O acesso a dados restritos em sistemas internos do IFCE por parte
              de servidores e gestores tem o único propósito de viabilizar a
              administração pública e educacional do próprio Instituto.
            </li>
          </ul>
        </div>

        <div class="article-block">
          <h2>Políticas do IFCE</h2>
          <p>
            Se você deseja entender mais sobre de que forma a Reitoria e todos
            os campi integrados lidam com a questão da transparência da
            informação e a proteção de dados segundo as políticas públicas do
            Governo Federal, convidamos para que leia a Política de Privacidade
            Oficial do Portal IFCE.
          </p>
        </div>

        <div class="actions">
          <a
            href="https://ifce.edu.br/politica-de-privacidade"
            target="_blank"
            class="btn btn-primary"
            >Política Oficial do IFCE</a
          >
        </div>
      </section>
    </main>
  `,
  styles: [
    `
      /* .page-container, .highlight e o link padrão herdam de main.scss com
         os tokens institucionais (compatíveis com o modo escuro). */
      .split-section {
        grid-template-columns: 1fr;
        gap: 2rem;
        max-width: 900px;
        padding: 4rem 2rem 2rem;
        text-align: center;
      }
      .subtitle {
        justify-content: center;
        margin-bottom: 1rem;
      }
      .subtitle::before,
      .subtitle::after {
        content: '';
        display: inline-block;
        width: 30px;
        height: 2px;
        background-color: var(--color-primary);
        margin: 0 15px;
      }
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

      .policy-section {
        max-width: 900px;
        margin: 2rem auto 0;
        padding: 0 2rem;
      }
      .article-block {
        margin-bottom: 3rem;
      }
      .article-block h2 {
        font-size: 2rem;
        font-weight: 800;
        margin-bottom: 1.5rem;
      }
      .article-block p {
        font-size: 1.05rem;
        line-height: 1.8;
        margin: 0 0 1.5rem;
      }
      .article-list {
        list-style-type: none;
        padding: 0;
        margin: 0;
      }
      .article-list li {
        position: relative;
        padding-left: 1.5rem;
        margin-bottom: 1rem;
        font-size: 1.05rem;
        line-height: 1.8;
      }
      .article-list li::before {
        content: '•';
        color: var(--color-primary);
        font-size: 1.5rem;
        position: absolute;
        left: 0;
        top: -4px;
      }
      .actions {
        display: flex;
        justify-content: center;
        gap: 1.5rem;
        margin-top: 4rem;
      }

      @media (max-width: 768px) {
        .split-section {
          padding: 2rem 1.5rem;
        }
        .title {
          font-size: 2.5rem;
        }
        .subtitle::before,
        .subtitle::after {
          display: none;
        }
      }
    `,
  ],
})
export class PrivacyComponent {}

const routes: Routes = [{ path: '', component: PrivacyComponent }];

@NgModule({
  declarations: [PrivacyComponent],
  imports: [CommonModule, RouterModule.forChild(routes), SharedModule],
})
export class PrivacyModule {}
