import { Component } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-revista-apresentacao',
  template: `
    <section class="apresentacao">
      <article class="surface intro-card">
        <h2>Sobre a publicação</h2>
        <p>
          A <strong>Revista DEPPI</strong> é o recurso contínuo online de
          divulgação técnico-científica do Departamento de Extensão,
          Pesquisa, Pós-Graduação e Inovação (DEPPI) do Instituto Federal do
          Ceará &mdash; Campus Maracanaú. A publicação reúne, de forma
          periódica, artigos, relatos de experiência, resultados de projetos
          e boas práticas produzidos pela comunidade acadêmica do campus,
          com o objetivo de dar visibilidade e permanência às ações de
          pesquisa, extensão, pós-graduação e inovação desenvolvidas na
          instituição.
        </p>
        <p>
          Cada número reúne artigos organizados por
          <strong>volume (Vol.) e ano civil</strong>, conforme a
          periodicidade da publicação, e fica permanentemente disponível
          nesta seção do site, junto às edições anteriores.
        </p>
      </article>

      <div class="scope-grid">
        <div class="scope-card surface">
          <span class="scope-icon">🔬</span>
          <h3>Pesquisa</h3>
          <p>
            Resultados de projetos, grupos de pesquisa e iniciação
            científica do DEPPI.
          </p>
        </div>
        <div class="scope-card surface">
          <span class="scope-icon">🌱</span>
          <h3>Extensão</h3>
          <p>
            Relatos de programas, projetos e ações de extensão junto à
            comunidade.
          </p>
        </div>
        <div class="scope-card surface">
          <span class="scope-icon">🎓</span>
          <h3>Pós-Graduação</h3>
          <p>
            Produções e experiências dos programas de pós-graduação do
            campus.
          </p>
        </div>
        <div class="scope-card surface">
          <span class="scope-icon">💡</span>
          <h3>Inovação</h3>
          <p>
            Iniciativas de inovação, empreendedorismo e transferência de
            tecnologia (PIT/RIT).
          </p>
        </div>
      </div>

      <div class="cta-row">
        <a routerLink="/revista/expediente" class="cta-card surface">
          <span class="cta-icon">📋</span>
          <div>
            <h4>Expediente</h4>
            <p>Corpo editorial, periodicidade e dados da instituição.</p>
          </div>
        </a>
        <a routerLink="/revista/edicoes" class="cta-card surface">
          <span class="cta-icon">📰</span>
          <div>
            <h4>Edição Atual</h4>
            <p>Confira o volume mais recente publicado.</p>
          </div>
        </a>
        <a
          routerLink="/revista/edicoes"
          [queryParams]="{ secao: 'anteriores' }"
          class="cta-card surface"
        >
          <span class="cta-icon">🗂️</span>
          <div>
            <h4>Edições Anteriores</h4>
            <p>Acesse o histórico de volumes já publicados.</p>
          </div>
        </a>
      </div>
    </section>
  `,
  styles: [
    `
      .intro-card {
        padding: 2.5rem;
        margin-bottom: 2.5rem;
        line-height: 1.8;
      }

      .intro-card h2 {
        margin-bottom: 1.2rem;
      }

      .intro-card p {
        color: var(--color-text-secondary);
        margin-bottom: 1rem;
      }

      .intro-card p:last-child {
        margin-bottom: 0;
      }

      .scope-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2.5rem;
      }

      .scope-card {
        padding: 1.8rem;
        text-align: center;
      }

      .scope-icon {
        font-size: 2rem;
        display: block;
        margin-bottom: 0.8rem;
      }

      .scope-card h3 {
        font-size: 1.1rem;
        margin-bottom: 0.5rem;
      }

      .scope-card p {
        font-size: 0.9rem;
        color: var(--color-text-secondary);
      }

      .cta-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 1.5rem;
      }

      .cta-card {
        display: flex;
        gap: 1rem;
        align-items: flex-start;
        padding: 1.6rem;
        text-decoration: none;
        color: inherit;
        transition: all var(--transition-fast);
      }

      .cta-card:hover {
        transform: translateY(-3px);
        border-color: var(--color-primary);
        box-shadow: var(--shadow-md);
      }

      .cta-icon {
        font-size: 1.6rem;
      }

      .cta-card h4 {
        margin-bottom: 0.3rem;
        color: var(--color-text);
      }

      .cta-card p {
        font-size: 0.85rem;
        color: var(--color-text-secondary);
        margin: 0;
      }
    `,
  ],
})
export class RevistaApresentacaoComponent {}
