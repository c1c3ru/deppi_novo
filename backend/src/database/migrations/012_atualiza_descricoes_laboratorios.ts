import type { Knex } from 'knex';

// Substitui as descrições placeholder dos laboratórios inseridos pela
// migration 011 pelas descrições oficiais fornecidas pelo DEPPI. Também
// corrige o nome por extenso do LAPP, que havia sido cadastrado como
// placeholder ("Automação e Processos Produtivos") — a sigla é oficialmente
// "Laboratório de Apoio às Práticas Pedagógicas".
// Casa pelo prefixo da sigla (não pelo nome completo antigo) para ser
// robusta tanto num banco que já rodou a 011 com o placeholder quanto num
// banco que a rode agora pela primeira vez (com o nome já atualizado).
const DESCRICOES_OFICIAIS: Record<string, { name: string; description: string }> = {
  LAQAMB: {
    name: 'LAQAMB - Laboratório de Química Ambiental',
    description:
      'Destinado à realização de ensaios analíticos, aulas práticas e pesquisas voltadas ao monitoramento da qualidade do ar, água e solo. O espaço atende a projetos de controle de contaminação, tratamento de efluentes e desenvolvimento de tecnologias ambientais sustentáveis.',
  },
  LAPP: {
    name: 'LAPP - Laboratório de Apoio às Práticas Pedagógicas',
    description:
      'Espaço voltado ao planejamento, criação e experimentação de metodologias de ensino, recursos didáticos e tecnologias educacionais. O ambiente apoia a formação docente, o desenvolvimento de materiais pedagógicos e a inovação em processos de ensino-aprendizagem.',
  },
  MAKER: {
    name: 'MAKER - Espaço Maker',
    description:
      'Ambiente colaborativo voltado para a cultura do "faça você mesmo", inovação e prototipagem rápida. Oferece suporte ao desenvolvimento de projetos multidisciplinares por meio do uso de impressoras 3D, corte a laser, ferramentas manuais e componentes eletrônicos.',
  },
  OFICINA: {
    name: 'OFICINA - Oficina de Prototipagem e Manutenção',
    description:
      'Espaço técnico equipado para a fabricação, montagem, ajuste e manutenção mecânica e eletroeletrônica de componentes e equipamentos. Presta suporte prático à execução de projetos de extensão, pesquisa aplicada e demandas institucionais.',
  },
  LQOI: {
    name: 'LQOI - Laboratório de Química Orgânica e Inorgânica',
    description:
      'Estruturado para a execução de práticas acadêmicas e de pesquisa em síntese, purificação, caracterização de compostos químicos e análise de reagentes orgânicos e inorgânicos, seguindo rígidos padrões de biossegurança.',
  },
  LASIC: {
    name: 'LASIC - Laboratório de Sistemas Inteligentes e Computação',
    description:
      'Dedicado ao desenvolvimento de pesquisas em inteligência artificial, computação aplicada, sistemas embarcados e redes de computadores. O laboratório apoia o desenvolvimento de software, algoritmos otimizados e soluções computacionais avançadas.',
  },
};

export async function up(knex: Knex): Promise<void> {
  for (const [sigla, dados] of Object.entries(DESCRICOES_OFICIAIS)) {
    await knex('laboratorios')
      .where('name', 'like', `${sigla} - %`)
      .update({ name: dados.name, description: dados.description });
  }
}

export async function down(): Promise<void> {
  // Irreversível: não restaura o texto placeholder original.
}
