import { Component } from '@angular/core';
import { ANAIS_BASE_STYLES } from '../../anais.styles';
import { ANAIS_INFO, ANAIS_TITULO } from '../../anais.utils';

@Component({
  standalone: false,
  selector: 'app-anais-expediente',
  template: `
    <article class="anais-card">
      <h2>Expediente</h2>
      <dl class="anais-dl">
        <dt>Título</dt>
        <dd>{{ titulo }}</dd>
        <dt>Instituição</dt>
        <dd>
          Instituto Federal de Educação, Ciência e Tecnologia do Ceará — IFCE
        </dd>
        <dt>Campus</dt>
        <dd>Maracanaú</dd>
        <dt>Unidade</dt>
        <dd>
          Departamento de Extensão, Pesquisa, Pós-Graduação e Inovação — DEPPI
        </dd>
        <dt>Periodicidade</dt>
        <dd>{{ info.periodicidade }}</dd>
        <dt>Formato</dt>
        <dd>{{ info.formato }}</dd>
        <dt>Acesso</dt>
        <dd>{{ info.acesso }}</dd>
        <dt>Idioma</dt>
        <dd>{{ info.idioma }}</dd>
        <dt>ISSN</dt>
        <dd>{{ info.issn }}</dd>
        <dt>Coordenação</dt>
        <dd>{{ info.coordenacao }}</dd>
        <dt>Revisão</dt>
        <dd>{{ info.revisao.join('; ') }}</dd>
        <dt>Contato</dt>
        <dd>
          <a [href]="'mailto:' + info.contato">{{ info.contato }}</a>
        </dd>
      </dl>

      <h3>Comissão Científica e Editorial</h3>
      <p>{{ info.comissao.join('; ') }}.</p>
    </article>
  `,
  styles: [
    ANAIS_BASE_STYLES,
    `
      .anais-dl a {
        color: var(--color-primary-dark);
        font-weight: 700;
      }
    `,
  ],
})
export class AnaisExpedienteComponent {
  readonly titulo = ANAIS_TITULO;
  readonly info = ANAIS_INFO;
}
