import {
  EDITAL_URL_PATTERN,
  extrairLinkPdf,
  filtrarTrabalhos,
  sugestaoDeCitacao,
} from './anais.utils';
import { RevistaArtigo, RevistaEdicao } from '../../shared/models';

describe('anais.utils', () => {
  describe('extrairLinkPdf', () => {
    it('acha o primeiro link para .pdf', () => {
      expect(
        extrairLinkPdf(
          '<p><a href="/uploads/1-x.pdf">PDF</a> e <a href="/b.pdf">b</a></p>'
        )
      ).toBe('/uploads/1-x.pdf');
    });

    it('aceita link externo https e query string', () => {
      expect(extrairLinkPdf('<a href="https://ex.org/a.pdf?dl=1">a</a>')).toBe(
        'https://ex.org/a.pdf?dl=1'
      );
    });

    it('ignora javascript: e links que não são PDF', () => {
      expect(
        extrairLinkPdf('<a href="javascript:alert(1)//.pdf">x</a>')
      ).toBeNull();
      expect(extrairLinkPdf('<a href="/uploads/foto.png">x</a>')).toBeNull();
      expect(extrairLinkPdf(null)).toBeNull();
    });
  });

  describe('filtrarTrabalhos', () => {
    const artigos = [
      {
        id: 1,
        title: 'Educação ambiental',
        authors: 'José Araújo',
        content: '',
      },
      {
        id: 2,
        title: 'Robótica',
        authors: 'Maria',
        summary: 'Ensino de física',
        content: '',
      },
    ] as RevistaArtigo[];

    it('busca sem acento e sem diferenciar maiúsculas', () => {
      expect(filtrarTrabalhos(artigos, 'educacao').map((a) => a.id)).toEqual([
        1,
      ]);
      expect(filtrarTrabalhos(artigos, 'ARAUJO').map((a) => a.id)).toEqual([1]);
    });

    it('procura também no resumo e devolve tudo com termo vazio', () => {
      expect(filtrarTrabalhos(artigos, 'física').map((a) => a.id)).toEqual([2]);
      expect(filtrarTrabalhos(artigos, '  ').length).toBe(2);
    });
  });

  it('monta a sugestão de citação com sobrenome em caixa alta', () => {
    const artigo = {
      title: 'Horta no campus',
      authors: 'Ana Souza, Bruno Lima',
    } as RevistaArtigo;
    const edicao = { volume: 2, ano: 2026 } as RevistaEdicao;
    expect(sugestaoDeCitacao(artigo, edicao)).toBe(
      'SOUZA, Ana; LIMA, Bruno. Horta no campus. In: Anais da Mostra Científica do IFCE Campus Maracanaú, v. 2. Maracanaú: IFCE, 2026.'
    );
  });

  it('aceita como edital só PDF do site ou link http(s)', () => {
    expect(EDITAL_URL_PATTERN.test('/uploads/edital-2026.pdf')).toBeTrue();
    expect(
      EDITAL_URL_PATTERN.test('https://ifce.edu.br/edital.pdf')
    ).toBeTrue();
    expect(EDITAL_URL_PATTERN.test('javascript:alert(1)')).toBeFalse();
    expect(EDITAL_URL_PATTERN.test('/uploads/../.env')).toBeFalse();
    expect(EDITAL_URL_PATTERN.test('edital.pdf')).toBeFalse();
  });
});
