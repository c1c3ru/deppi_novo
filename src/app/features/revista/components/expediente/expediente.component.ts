import { Component } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-revista-expediente',
  template: `
    <section class="expediente">
      <article class="surface expediente-card">
        <h2>Expediente</h2>

        <dl class="info-list">
          <div class="info-row">
            <dt>Título</dt>
            <dd>Revista DEPPI</dd>
          </div>
          <div class="info-row">
            <dt>ISSN</dt>
            <dd>Em processo de solicitação junto ao IBICT</dd>
          </div>
          <div class="info-row">
            <dt>Periodicidade</dt>
            <dd>[A definir pela coordenação editorial &mdash; ex.: anual, 1 volume por ano civil]</dd>
          </div>
          <div class="info-row">
            <dt>Editora / Instituição responsável</dt>
            <dd>
              Instituto Federal de Educação, Ciência e Tecnologia do Ceará
              (IFCE) &mdash; Campus Maracanaú &mdash; Departamento de
              Extensão, Pesquisa, Pós-Graduação e Inovação (DEPPI)
            </dd>
          </div>
          <div class="info-row">
            <dt>Endereço</dt>
            <dd>
              Av. Parque Central, S/N &mdash; Distrito Industrial I,
              Maracanaú &mdash; CE &mdash; Brasil
            </dd>
          </div>
          <div class="info-row">
            <dt>Contato</dt>
            <dd>
              deppi.maracanau&#64;ifce.edu.br &middot; (85) 3401.2233
            </dd>
          </div>
        </dl>
      </article>

      <article class="surface expediente-card">
        <h2>Corpo Editorial</h2>
        <p class="section-note">
          Composição do corpo editorial responsável pela publicação.
        </p>

        <div class="board-group">
          <h3>Coordenação Editorial</h3>
          <ul class="board-list">
            <li>[Nome do(a) Coordenador(a) Editorial] &mdash; DEPPI/IFCE Maracanaú</li>
          </ul>
        </div>

        <div class="board-group">
          <h3>Conselho Editorial</h3>
          <ul class="board-list">
            <li>[Nome do(a) Conselheiro(a) 1] &mdash; [Área/Instituição]</li>
            <li>[Nome do(a) Conselheiro(a) 2] &mdash; [Área/Instituição]</li>
            <li>[Nome do(a) Conselheiro(a) 3] &mdash; [Área/Instituição]</li>
          </ul>
        </div>

        <div class="board-group">
          <h3>Revisão e Diagramação</h3>
          <ul class="board-list">
            <li>[Nome do(a) responsável pela revisão]</li>
            <li>[Nome do(a) responsável pela diagramação]</li>
          </ul>
        </div>
      </article>
    </section>
  `,
  styles: [
    `
      .expediente-card {
        padding: 2.5rem;
        margin-bottom: 2rem;
      }

      .expediente-card h2 {
        margin-bottom: 1.5rem;
      }

      .section-note {
        color: var(--color-text-secondary);
        font-size: 0.9rem;
        margin-bottom: 1.5rem;
      }

      .info-list {
        display: flex;
        flex-direction: column;
        gap: 1.3rem;
      }

      .info-row {
        display: grid;
        grid-template-columns: 220px 1fr;
        gap: 1rem;
        padding-bottom: 1.3rem;
        border-bottom: 1px solid var(--color-border-light);
      }

      .info-row:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }

      dt {
        font-weight: 700;
        color: var(--color-text);
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }

      dd {
        margin: 0;
        color: var(--color-text-secondary);
        line-height: 1.7;
      }

      .board-group {
        margin-bottom: 2rem;
      }

      .board-group:last-child {
        margin-bottom: 0;
      }

      .board-group h3 {
        font-size: 1rem;
        margin-bottom: 0.8rem;
        color: var(--color-text);
      }

      .board-list {
        list-style: none;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .board-list li {
        color: var(--color-text-secondary);
        font-size: 0.95rem;
        padding: 0.6rem 1rem;
        background: var(--color-background-secondary);
        border-radius: var(--border-radius-md);
      }

      @media (max-width: 640px) {
        .expediente-card {
          padding: 1.5rem;
        }
        .info-row {
          grid-template-columns: 1fr;
          gap: 0.3rem;
        }
      }
    `,
  ],
})
export class RevistaExpedienteComponent {}
