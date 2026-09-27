import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { AnaisTrabalhosListComponent } from './trabalhos-list.component';
import { RevistaArtigo } from '../../../../shared/models';

const ARTIGOS: RevistaArtigo[] = [
  {
    id: 1,
    edicaoId: 10,
    title: 'Robótica educacional no ensino médio',
    authors: 'Ana Souza, Bruno Lima',
    summary: 'Resumo do primeiro trabalho.',
    content: '<p>Texto</p><p><a href="/uploads/1-trabalho.pdf">PDF</a></p>',
    order: 1,
  },
  {
    id: 2,
    edicaoId: 10,
    title: 'Horta comunitária no campus',
    authors: 'Carla Dias',
    content: '<p>Sem PDF</p>',
    order: 2,
  },
];

describe('AnaisTrabalhosListComponent', () => {
  let fixture: ComponentFixture<AnaisTrabalhosListComponent>;
  let el: HTMLElement;

  function render(canEdit: boolean): void {
    fixture.componentRef.setInput('artigos', ARTIGOS);
    fixture.componentRef.setInput('canEdit', canEdit);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AnaisTrabalhosListComponent],
      imports: [RouterModule.forRoot([])],
    }).compileComponents();
    fixture = TestBed.createComponent(AnaisTrabalhosListComponent);
    el = fixture.nativeElement;
  });

  it('lista título, autores e ação de acesso de cada trabalho', () => {
    render(false);
    const itens = el.querySelectorAll('[data-testid="trabalho"]');
    expect(itens.length).toBe(2);
    expect(itens[0].textContent).toContain(
      'Robótica educacional no ensino médio'
    );
    expect(itens[0].textContent).toContain('Ana Souza, Bruno Lima');
    expect(
      itens[0].querySelector('a.action-primary')?.getAttribute('href')
    ).toBe('/anais/artigos/1');
  });

  it('mostra o botão PDF só quando o conteúdo tem link para .pdf', () => {
    render(false);
    const itens = el.querySelectorAll('[data-testid="trabalho"]');
    const pdf = Array.from(itens[0].querySelectorAll('a')).find(
      (a) => a.textContent?.trim() === 'PDF'
    );
    expect(pdf?.getAttribute('href')).toBe('/uploads/1-trabalho.pdf');
    const semPdf = Array.from(itens[1].querySelectorAll('a')).some(
      (a) => a.textContent?.trim() === 'PDF'
    );
    expect(semPdf).toBeFalse();
  });

  it('visitante (canEdit = false) não recebe botões de edição no DOM', () => {
    render(false);
    expect(el.querySelectorAll('[data-testid="editar-trabalho"]').length).toBe(
      0
    );
    expect(el.querySelectorAll('[data-testid="excluir-trabalho"]').length).toBe(
      0
    );
  });

  it('usuário logado (canEdit = true) vê Editar e Excluir em cada trabalho', () => {
    render(true);
    const editar = el.querySelectorAll('[data-testid="editar-trabalho"]');
    expect(editar.length).toBe(2);
    expect(editar[1].getAttribute('href')).toBe(
      '/anais/admin/artigos/2/editar'
    );
    expect(el.querySelectorAll('[data-testid="excluir-trabalho"]').length).toBe(
      2
    );
  });

  it('botões somem quando o login cai (true -> false)', () => {
    render(true);
    render(false);
    expect(el.querySelectorAll('[data-testid="editar-trabalho"]').length).toBe(
      0
    );
  });

  it('Excluir emite o trabalho para a página tratar', () => {
    render(true);
    const emitidos: RevistaArtigo[] = [];
    fixture.componentInstance.excluir.subscribe((a) => emitidos.push(a));
    (
      el.querySelector('[data-testid="excluir-trabalho"]') as HTMLButtonElement
    ).click();
    expect(emitidos.map((a) => a.id)).toEqual([1]);
  });

  it('abre e fecha o resumo', () => {
    render(false);
    const botao = Array.from(el.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Resumo'
    ) as HTMLButtonElement;
    botao.click();
    fixture.detectChanges();
    expect(el.textContent).toContain('Resumo do primeiro trabalho.');
    botao.click();
    fixture.detectChanges();
    expect(el.textContent).not.toContain('Resumo do primeiro trabalho.');
  });
});
