import { Component } from '@angular/core';
import { ANAIS_BASE_STYLES } from '../../anais.styles';

interface SecaoNorma {
  titulo: string;
  paragrafos: string[];
}

/** Texto aprovado pela Comissão (protótipo "normas.html"), sem alterações. */
const NORMAS: SecaoNorma[] = [
  {
    titulo: '1. Escopo',
    paragrafos: [
      'Os Anais da Mostra Científica do IFCE Campus Maracanaú destinam-se à publicação dos trabalhos aprovados e apresentados na Mostra Científica do Instituto Federal de Educação, Ciência e Tecnologia do Ceará - Campus Maracanaú.',
      'A publicação contempla trabalhos relacionados aos seguintes grupos temáticos: Iniciação Científica e Tecnológica; Iniciação à Docência e Monitoria; Extensão; Empreendedorismo; Arte e Cultura; e Diversidade e Inclusão.',
      'Os grupos temáticos poderão ser atualizados em edições futuras da Mostra Científica, conforme estabelecido no edital correspondente.',
    ],
  },
  {
    titulo: '2. Condições para publicação',
    paragrafos: [
      'Serão publicados nos Anais os trabalhos que: (a) tenham sido submetidos à Mostra Científica em conformidade com o edital da respectiva edição; (b) tenham sido aprovados no processo de avaliação; (c) tenham atendido, quando aplicável, às solicitações de correção encaminhadas pela Comissão responsável; (d) tenham sido efetivamente apresentados durante a Mostra Científica por pelo menos um de seus autores; e (e) estejam em conformidade com as normas editoriais aplicáveis à publicação.',
      'A aprovação do trabalho, isoladamente, não assegura sua publicação nos Anais. A apresentação durante o evento constitui requisito para publicação.',
    ],
  },
  {
    titulo: '3. Modalidade de publicação',
    paragrafos: [
      'Os trabalhos serão publicados na modalidade de resumo simples, reunidos em volume correspondente à respectiva edição anual da Mostra Científica.',
      'Os resumos deverão possuir entre 200 e 300 palavras, ser redigidos em língua portuguesa e apresentar, conforme aplicável: título; autoria e orientação; identificação institucional e agência de fomento, quando houver; introdução e objetivo(s); metodologia; resultados esperados ou obtidos; conclusão ou contribuições potenciais; e de três a cinco palavras-chave.',
      'Não serão admitidas figuras, tabelas, gráficos ou imagens no corpo do resumo.',
    ],
  },
  {
    titulo: '4. Autoria',
    paragrafos: [
      'Cada trabalho poderá possuir até seis autores e um orientador.',
      'Um dos autores deverá ser identificado como autor responsável, constituindo o contato oficial do trabalho junto à organização da Mostra Científica.',
      'A ordem, a identificação e a grafia dos nomes dos autores constantes da publicação serão aquelas apresentadas na versão definitiva do trabalho aprovada para publicação.',
    ],
  },
  {
    titulo: '5. Originalidade e responsabilidade dos autores',
    paragrafos: [
      'Os trabalhos deverão ser originais, não sendo admitidos plágio, autoplágio ou qualquer outra forma de apropriação indevida.',
      'Não poderão ser publicados nos Anais resumos previamente publicados em outros anais ou periódicos.',
      'O conteúdo dos trabalhos, a veracidade das informações apresentadas, a indicação adequada de autoria e a observância das normas éticas e legais aplicáveis são de responsabilidade de seus autores.',
      'A revisão do texto submetido é igualmente responsabilidade dos autores, sem prejuízo da revisão editorial realizada durante a preparação dos Anais.',
    ],
  },
  {
    titulo: '6. Avaliação e preparação editorial',
    paragrafos: [
      'Os trabalhos submetidos à Mostra Científica serão avaliados conforme os procedimentos e critérios definidos no edital da respectiva edição.',
      'Após a aprovação, poderão ser solicitadas correções ou adequações necessárias à publicação.',
      'A preparação editorial dos Anais poderá compreender procedimentos de revisão linguística, normalização, padronização de autoria, identificação institucional, palavras-chave e demais elementos editoriais, sem alteração do conteúdo técnico-científico dos trabalhos.',
      'A responsabilidade pelo conteúdo permanece com os respectivos autores.',
    ],
  },
  {
    titulo: '7. Autorização para publicação',
    paragrafos: [
      'A submissão de trabalho à Mostra Científica implica, quando atendidas as condições para publicação, autorização para sua divulgação nos Anais da Mostra Científica do IFCE Campus Maracanaú, sem ônus para o Instituto Federal de Educação, Ciência e Tecnologia do Ceará ou para a organização do evento.',
    ],
  },
  {
    titulo: '8. Organização dos volumes',
    paragrafos: [
      'Os Anais constituem publicação eletrônica de periodicidade anual.',
      'Cada volume corresponderá aos trabalhos publicados em uma edição anual da Mostra Científica e será identificado por número de volume e ano de publicação.',
      'Inicialmente, a coleção será organizada como Vol. 1 (2025), correspondente à I Mostra Científica do IFCE Campus Maracanaú, e Vol. 2 (2026), correspondente à Mostra Científica realizada em 2026.',
      'Os volumes publicados permanecerão disponíveis para consulta na seção Edições Anteriores.',
    ],
  },
  {
    titulo: '9. Normas específicas de cada edição',
    paragrafos: [
      'Os procedimentos de submissão, prazos, modelos de arquivo, critérios de avaliação, cronograma, modalidade e duração das apresentações e demais disposições operacionais serão definidos no edital correspondente a cada edição da Mostra Científica.',
      'Os editais e demais documentos de cada edição permanecerão disponíveis para consulta juntamente com o respectivo volume ou em seção específica da página dos Anais.',
    ],
  },
];

@Component({
  standalone: false,
  selector: 'app-anais-normas',
  template: `
    <article class="anais-card">
      <h2>Normas de publicação</h2>
      <section *ngFor="let secao of normas">
        <h3>{{ secao.titulo }}</h3>
        <p *ngFor="let paragrafo of secao.paragrafos">{{ paragrafo }}</p>
      </section>
    </article>
  `,
  styles: [ANAIS_BASE_STYLES],
})
export class AnaisNormasComponent {
  readonly normas = NORMAS;
}
