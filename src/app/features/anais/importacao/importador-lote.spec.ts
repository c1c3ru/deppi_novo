import {
  ImportadorLote,
  ItemLote,
  PortaImportacao,
  TrabalhoExistente,
} from './importador-lote';

function item(id: number, titulo: string, pdf = true): ItemLote {
  return {
    id,
    arquivo: `${id}.docx`,
    dados: {
      titulo,
      autores: 'Ana Silva',
      instituicoes: [],
      resumo: 'texto',
      palavrasChave: ['a'],
    },
    pdf: pdf
      ? new File(['%PDF'], `${id}.pdf`, { type: 'application/pdf' })
      : undefined,
    suspeitas: [],
    avisos: [],
    selecionado: true,
    estado: 'aguardando',
  };
}

class PortaFalsa implements PortaImportacao {
  trabalhos: TrabalhoExistente[] = [];
  falhasCriar: number[] = [];
  falhasPdf: number[] = [];
  criados: { title: string; content: string; order: number }[] = [];
  esperas = 0;
  trabalhosDaEdicao = async () => this.trabalhos.map((t) => ({ ...t }));
  enviarPdf = async (f: File) => {
    const s = this.falhasPdf.shift();
    if (s !== undefined) throw { status: s };
    return `/uploads/${f.name}`;
  };
  criarTrabalho = async (d: {
    title: string;
    content: string;
    order: number;
  }) => {
    const s = this.falhasCriar.shift();
    if (s !== undefined && s !== 200)
      throw { status: s, error: { error: 'falha' } };
    this.criados.push(d);
    this.trabalhos.push({ title: d.title, order: d.order });
    return this.criados.length;
  };
  esperar = async () => {
    this.esperas++;
  };
}

describe('ImportadorLote', () => {
  it('importa um por vez, com ordem sequencial, PDF e pausa entre itens', async () => {
    const porta = new PortaFalsa();
    porta.trabalhos = [{ title: 'Antigo', order: 4 }];
    const itens = [item(1, 'Primeiro'), item(2, 'Segundo', false)];
    await new ImportadorLote(porta).executar(itens, { enviarPdf: true });

    expect(porta.criados.map((c) => c.order)).toEqual([5, 6]);
    expect(porta.criados[0].content).toContain('href="/uploads/1.pdf"');
    expect(itens.map((i) => i.estado)).toEqual([
      'importado',
      'importado-aviso',
    ]);
    expect(itens[1].detalhe).toContain('sem PDF');
    expect(porta.esperas).toBe(2);
  });

  it('não duplica título que já existe na edição', async () => {
    const porta = new PortaFalsa();
    porta.trabalhos = [{ title: 'EDUCAÇÃO AMBIENTAL', order: 1 }];
    const itens = [item(1, 'Educação ambiental')];
    await new ImportadorLote(porta).executar(itens, { enviarPdf: true });
    expect(itens[0].estado).toBe('ja-existia');
    expect(porta.criados.length).toBe(0);
  });

  it('importa sem PDF e avisa quando o upload falha', async () => {
    const porta = new PortaFalsa();
    porta.falhasPdf = [500];
    const itens = [item(1, 'Um')];
    await new ImportadorLote(porta).executar(itens, { enviarPdf: true });
    expect(itens[0].estado).toBe('importado-aviso');
    expect(porta.criados[0].content).not.toContain('.pdf');
  });

  for (const status of [401, 403, 429]) {
    it(`para no erro ${status} sem perder o que já foi feito`, async () => {
      const porta = new PortaFalsa();
      porta.falhasCriar = [200, status];
      const itens = [item(1, 'Um'), item(2, 'Dois'), item(3, 'Três')];
      const imp = new ImportadorLote(porta);
      await imp.executar(itens, { enviarPdf: false });
      expect(itens.map((i) => i.estado)).toEqual([
        'importado',
        'aguardando',
        'aguardando',
      ]);
      expect(imp.motivoParada).toBeTruthy();

      // Continuar retoma do ponto em que parou.
      await imp.executar(itens, { enviarPdf: false });
      expect(itens.map((i) => i.estado)).toEqual([
        'importado',
        'importado',
        'importado',
      ]);
      expect(porta.criados.length).toBe(3);
    });
  }

  it('para depois de 3 falhas seguidas do servidor', async () => {
    const porta = new PortaFalsa();
    porta.falhasCriar = [500, 0, 502];
    const itens = [
      item(1, 'Um'),
      item(2, 'Dois'),
      item(3, 'Três'),
      item(4, 'Quatro'),
    ];
    const imp = new ImportadorLote(porta);
    await imp.executar(itens, { enviarPdf: false });
    expect(itens.map((i) => i.estado)).toEqual([
      'falhou',
      'falhou',
      'falhou',
      'aguardando',
    ]);
    expect(imp.motivoParada).toContain('3 vezes');
  });

  it('erro de validação marca só o item e segue para o próximo', async () => {
    const porta = new PortaFalsa();
    porta.falhasCriar = [400];
    const itens = [item(1, 'Um'), item(2, 'Dois')];
    const imp = new ImportadorLote(porta);
    await imp.executar(itens, { enviarPdf: false });
    expect(itens[0].estado).toBe('falhou');
    expect(itens[0].detalhe).toContain('400');
    expect(itens[1].estado).toBe('importado');
    expect(imp.motivoParada).toBeNull();
  });

  it('pula itens desmarcados ou sem dados', async () => {
    const porta = new PortaFalsa();
    const a = item(1, 'Um');
    a.selecionado = false;
    const b = item(2, 'Dois');
    b.dados = undefined;
    await new ImportadorLote(porta).executar([a, b], { enviarPdf: false });
    expect(porta.criados.length).toBe(0);
  });

  it('pausa entre itens e retoma', async () => {
    const porta = new PortaFalsa();
    const itens = [item(1, 'Um'), item(2, 'Dois')];
    let imp!: ImportadorLote;
    let pausou = false;
    porta.esperar = async () => {
      if (!pausou) {
        pausou = true;
        imp.pausar();
      }
    };
    imp = new ImportadorLote(porta);
    const execucao = imp.executar(itens, { enviarPdf: false });
    await new Promise((r) => setTimeout(r, 20));
    expect(imp.pausado).toBeTrue();
    expect(itens.map((i) => i.estado)).toEqual(['importado', 'aguardando']);
    imp.continuar();
    await execucao;
    expect(itens[1].estado).toBe('importado');
  });

  it('reaproveita o PDF já enviado ao tentar de novo', async () => {
    const porta = new PortaFalsa();
    porta.falhasCriar = [500];
    const itens = [item(1, 'Um')];
    const enviar = spyOn(porta, 'enviarPdf').and.callThrough();
    const imp = new ImportadorLote(porta);
    await imp.executar(itens, { enviarPdf: true });
    expect(itens[0].estado).toBe('falhou');
    itens[0].estado = 'aguardando';
    await imp.executar(itens, { enviarPdf: true });
    expect(itens[0].estado).toBe('importado');
    expect(enviar).toHaveBeenCalledTimes(1);
  });
});
