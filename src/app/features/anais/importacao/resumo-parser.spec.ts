import {
  chaveDoArquivo,
  chaveDoTitulo,
  emCaixaAlta,
  extrairPalavrasChave,
  formatarAutores,
  gerarCsv,
  lerResumo,
  montarConteudo,
  nomeLegivel,
} from './resumo-parser';

const TEXTO =
  'Introdução: Este trabalho descreve uma ação de extensão com estudantes do ensino médio. ' +
  'Objetivo: avaliar o uso de jogos no ensino de química. Metodologia: oficinas semanais com ' +
  'registro em diário de campo e questionários. Resultados: houve maior participação e melhora ' +
  'nas notas. Conclusão: os jogos ajudaram a aprendizagem e serão mantidos no próximo semestre ' +
  'pela equipe do projeto, com novas turmas e escolas parceiras da região.';

describe('resumo-parser', () => {
  it('reconhece linhas em caixa alta', () => {
    expect(emCaixaAlta('JOGOS DE DOMINÓ NO ENSINO DE QUÍMICA')).toBeTrue();
    expect(emCaixaAlta('Autores: SILVA, Ana¹')).toBeFalse();
  });

  describe('formatarAutores', () => {
    it('converte "SOBRENOME, Nome¹; ..." em "Nome Sobrenome; ..."', () => {
      expect(
        formatarAutores([
          'Autores: SOUSA, Ana Maria¹; DA SILVA, João Pedro²; LIMA FILHO, Carlos³.',
        ])
      ).toBe('Ana Maria Sousa; João Pedro da Silva; Carlos Lima Filho');
    });

    it('aceita "Autor:"/"Autora:" e linhas de orientador', () => {
      expect(
        formatarAutores(['Autora: COSTA, Bia¹', 'Orientador: ROCHA, Davi¹;'])
      ).toBe('Bia Costa; Davi Rocha');
    });

    it('aceita autores separados só por vírgula', () => {
      expect(
        formatarAutores([
          'Autores: RIBEIRO, Ana Alves¹, SOUZA, Caio¹, SILVA, Gil da',
        ])
      ).toBe('Ana Alves Ribeiro; Caio Souza; Gil da Silva');
    });

    it('corrige "SOBRENOME; Nome" (ponto e vírgula no lugar da vírgula)', () => {
      expect(
        formatarAutores(['Autores: SOUZA; David Carneiro de¹; SILVA, Josué¹.'])
      ).toBe('David Carneiro de Souza; Josué Silva');
    });

    it('mantém marcas no início e abreviações', () => {
      expect(
        formatarAutores(['Autores: ¹SILVA, Ana; ²PALHANO, Bianca C.'])
      ).toBe('Ana Silva; Bianca C. Palhano');
    });
  });

  it('extrai palavras-chave nas variações do formulário', () => {
    expect(
      extrairPalavrasChave('Palavras-chave: Ensino; Jogos; Química.')
    ).toEqual(['Ensino', 'Jogos', 'Química']);
    expect(extrairPalavrasChave('Palavras-Chave: a, b')).toEqual(['a', 'b']);
    expect(extrairPalavrasChave('Palavras-chaves: a; b;')).toEqual(['a', 'b']);
    expect(extrairPalavrasChave('Palavras-chave - a; b')).toEqual(['a', 'b']);
  });

  it('lê um resumo completo no padrão', () => {
    const r = lerResumo([
      'JOGOS DE DOMINÓ COMO ESTRATÉGIA',
      'DIDÁTICA NO ENSINO DE QUÍMICA',
      'Autores: MOTA, Ana¹; PINHO, Tássia de Sousa²',
      '¹Escola Estadual de Educação Profissional. Curso Técnico em Química',
      '²Instituto Federal do Ceará – IFCE, Campus de',
      'Maracanaú. Eixo de Química',
      'RESUMO',
      TEXTO,
      'Palavras-chave: Ensino de Química; Ludicidade; Dominó.',
    ]);
    expect(r.recusa).toBeUndefined();
    expect(r.suspeitas).toEqual([]);
    expect(r.avisos).toEqual([]);
    expect(r.dados).toEqual({
      titulo: 'JOGOS DE DOMINÓ COMO ESTRATÉGIA DIDÁTICA NO ENSINO DE QUÍMICA',
      autores: 'Ana Mota; Tássia de Sousa Pinho',
      instituicoes: [
        '¹Escola Estadual de Educação Profissional. Curso Técnico em Química',
        '²Instituto Federal do Ceará – IFCE, Campus de Maracanaú. Eixo de Química',
      ],
      resumo: TEXTO,
      palavrasChave: ['Ensino de Química', 'Ludicidade', 'Dominó'],
    });
  });

  it('não confunde título com vírgula com linha de autores', () => {
    const r = lerResumo([
      'SANEAMENTO, SAÚDE E ARBOVIROSES EM FORTALEZA',
      'Autores: GOMES, Amanda¹',
      TEXTO,
      'Palavras-chave: saúde',
    ]);
    expect(r.dados?.titulo).toBe(
      'SANEAMENTO, SAÚDE E ARBOVIROSES EM FORTALEZA'
    );
    expect(r.dados?.autores).toBe('Amanda Gomes');
    expect(r.avisos).toContain('Sem instituições.');
  });

  it('separa a instituição colada no fim da linha de autores', () => {
    const r = lerResumo([
      'ANÁLISE DO SOLO EM PRAÇAS',
      'Autores: COSTA, Ana¹; MATOS, Bia²¹Instituto Federal do Ceará.',
      TEXTO,
      'Palavras-chave: solo',
    ]);
    expect(r.dados?.autores).toBe('Ana Costa; Bia Matos');
    expect(r.dados?.instituicoes).toEqual(['¹Instituto Federal do Ceará.']);
  });

  it('desmarca (suspeita) resumo com texto de IA colado', () => {
    const r = lerResumo([
      'MONITORIA EM EDUCAÇÃO AMBIENTAL',
      'Autores: ANDRADE, Eva¹',
      '¹Instituto Federal do Ceará',
      'RESUMO',
      'O texto original já está bem estruturado. A seguir, apresento a versão corrigida.',
      'Texto Corrigido',
      TEXTO,
      'Palavras-chave: monitoria',
    ]);
    expect(r.dados).toBeDefined();
    expect(r.suspeitas.some((s) => s.includes('texto de IA'))).toBeTrue();
  });

  it('recusa documento sem texto de resumo', () => {
    const r = lerResumo(['TÍTULO', 'Autores: SILVA, Ana', 'Palavras-chave: a']);
    expect(r.recusa).toContain('resumo');
  });

  it('avisa quando sobra texto depois das palavras-chave', () => {
    const r = lerResumo([
      'TÍTULO DO TRABALHO',
      'Autores: SILVA, Ana',
      TEXTO,
      'Palavras-chave: a',
      'Referências',
    ]);
    expect(
      r.avisos.some((a) => a.includes('depois das palavras-chave'))
    ).toBeTrue();
  });

  it('monta o conteúdo com instituições, palavras-chave e PDF, escapando HTML', () => {
    const html = montarConteudo(
      {
        titulo: 'T',
        autores: 'A',
        instituicoes: ['¹IFCE <b>'],
        resumo: 'r',
        palavrasChave: ['a', 'b'],
      },
      '/uploads/123-456.pdf'
    );
    expect(html).toBe(
      '<p><strong>Instituições</strong></p><p>¹IFCE &lt;b&gt;</p>' +
        '<p><strong>Palavras-chave:</strong> a; b.</p>' +
        '<p><a href="/uploads/123-456.pdf">PDF do trabalho</a></p>'
    );
    expect(
      montarConteudo(
        {
          titulo: 'T',
          autores: '',
          instituicoes: [],
          resumo: 'r',
          palavrasChave: [],
        },
        'javascript:x.pdf'
      )
    ).toBe('<p>r</p>');
  });

  it('casa o .docx com o .pdf de mesmo nome', () => {
    const docx = chaveDoArquivo('pasta/Ana Souza-Resumo simples.docx');
    expect(chaveDoArquivo('pasta/Ana Souza-Resumo simples.docx.pdf')).toBe(
      docx
    );
    expect(chaveDoArquivo('Ana Souza-Resumo simples.pdf')).toBe(docx);
    expect(chaveDoArquivo('Ana Souza-Resumo simples..pdf')).toBe(docx);
    expect(nomeLegivel('SUBMISS#U00c3O/Jos#U00e9.docx')).toBe('José.docx');
  });

  it('compara títulos sem acento, pontuação nem caixa', () => {
    expect(chaveDoTitulo('Educação  Ambiental: relato')).toBe(
      chaveDoTitulo('EDUCACAO AMBIENTAL RELATO')
    );
  });

  it('gera CSV com BOM, ";" e proteção contra fórmula', () => {
    const csv = gerarCsv(['a', 'b'], [['=1+1', 'x"y']]);
    expect(csv).toBe('﻿"a";"b"\r\n"\'=1+1";"x""y"');
  });
});
